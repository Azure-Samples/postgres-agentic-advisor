"""
Step 4 — Vector stores.

Loads PDF documents, splits them into chunks, embeds them with
AzureOpenAI, and writes them to PGDiskANN tables.  Each
collection is only populated when it doesn't already exist.
"""

import asyncio
import csv
import logging
import math
import time
from pathlib import Path

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from langchain_azure_postgresql.common import (
    AzurePGConnectionPool,
    BasicAuth,
    ConnectionInfo,
    DiskANN,
    VectorType,
)
from langchain_azure_postgresql.langchain import AzurePGVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_openai import AzureOpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
from src.configs.config import settings
from src.database import BaseDatabaseManager, create_database_manager

logger = logging.getLogger(__name__)

_db_manager: BaseDatabaseManager | None = None


def _get_db_url() -> str:
    """Fallback: create a database manager if no URL was passed in."""
    global _db_manager
    if _db_manager is None:
        _db_manager = create_database_manager()
    return _db_manager.get_sync_database_url_with_token()


logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

_SEED_DIR = Path(__file__).parent / "data" / "seed_data"
_DB_SETUP_DIR = Path(__file__).parent  # used to resolve relative PDF paths in CSVs


async def setup_vector_stores(
    engine: AsyncEngine,
    *,
    db_url: str | None = None,
) -> None:
    """Populate PGDiskANN table for SEC filings and news articles."""
    db_url = db_url or _get_db_url()

    credential = DefaultAzureCredential()
    token_provider = get_bearer_token_provider(
        credential,
        "https://cognitiveservices.azure.com/.default",
    )

    embedding_model = AzureOpenAIEmbeddings(
        azure_deployment=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
        model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_ad_token_provider=token_provider,
    )

    await _seed_collection(
        engine=engine,
        db_url=db_url,
        embedding_model=embedding_model,
        collection_name=settings.VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES,
        csv_file=_SEED_DIR / "news_articles.csv",
        pdf_url_field="news_article_url",
        doc_id_field="news_article_id",
        doc_id_metadata_key="news_article_id",
        batch_size=settings.NEWS_ARTICLES_SEEDING_BATCH_SIZE,
    )

    await _seed_collection(
        engine=engine,
        db_url=db_url,
        embedding_model=embedding_model,
        collection_name=settings.VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS,
        csv_file=_SEED_DIR / "sec_files.csv",
        pdf_url_field="sec_file_url",
        doc_id_field="sec_file_id",
        doc_id_metadata_key="sec_file_id",
        batch_size=settings.SEC_FILES_SEEDING_BATCH_SIZE,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _seed_collection(
    *,
    engine: AsyncEngine,
    db_url: str,
    embedding_model: AzureOpenAIEmbeddings,
    collection_name: str,
    csv_file: Path,
    pdf_url_field: str,
    doc_id_field: str,
    doc_id_metadata_key: str,
    batch_size: int,
) -> None:
    if await _collection_exists(engine, collection_name):
        logger.info(
            "Vector store collection %r already populated — skipping.",
            collection_name,
        )
        return

    logger.info("Building vector store collection: %r", collection_name)
    await asyncio.to_thread(
        _insert_file_by_file,
        csv_file=csv_file,
        pdf_url_field=pdf_url_field,
        doc_id_field=doc_id_field,
        doc_id_metadata_key=doc_id_metadata_key,
        embedding_model=embedding_model,
        db_url=db_url,
        collection_name=collection_name,
        batch_size=batch_size,
    )
    logger.info("Finished populating collection: %r", collection_name)


async def _collection_exists(engine: AsyncEngine, collection_name: str) -> bool:
    """Return True when the vector store table exists and contains rows."""
    table_exists_query = text(
        """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = :name
        )
        """,
    )
    try:
        async with engine.connect() as conn:
            table_exists = (
                await conn.execute(table_exists_query, {"name": collection_name})
            ).scalar()
            if not table_exists:
                return False
            rows = await conn.execute(
                text(f'SELECT 1 FROM public."{collection_name}" LIMIT 1'),
            )
            return rows.first() is not None
    except Exception:
        return False


def _insert_file_by_file(
    *,
    csv_file: Path,
    pdf_url_field: str,
    doc_id_field: str,
    doc_id_metadata_key: str,
    embedding_model: AzureOpenAIEmbeddings,
    db_url: str,
    collection_name: str,
    batch_size: int,
) -> None:
    """
    Process one PDF at a time: load → chunk → embed → insert → discard.
    This keeps peak memory proportional to a single document rather than
    the entire corpus.
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    basic_auth_connection_pool = AzurePGConnectionPool(
        azure_conn_info=ConnectionInfo(
            host=settings.DB_HOST,
            dbname=settings.DB_NAME,
            credentials=BasicAuth(
                username=settings.DB_USER,
                password=settings.DB_PASSWORD,
            ),
        ),
        open=True,
    )

    vector_store = AzurePGVectorStore(
        connection=basic_auth_connection_pool,
        embedding=embedding_model,
        table_name=collection_name,
        schema_name="public",
        id_column="id",
        content_column="content",
        embedding_column="embedding",
        metadata_columns="metadata",
        embedding_type=VectorType.vector,
        embedding_dimension=settings.AZURE_OPENAI_EMBEDDING_MODEL_DIMS,
        embedding_index=DiskANN(),
    )

    with csv_file.open(encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))

    total_files = len(rows)
    for file_num, row in enumerate(rows, start=1):
        pdf_path = str(_DB_SETUP_DIR / row[pdf_url_field].strip())
        ticker_id = row["ticker_id"].strip()
        ticker = row["ticker"].strip()
        company_name = row["name"].strip()
        title = row.get("title", "").strip()
        doc_id = row[doc_id_field].strip()
        markdown_url = row.get("markdown_url", "").strip()
        markdown_path = markdown_url if markdown_url else None
        reporting_company = row.get("reporting_company", "").strip() or None

        logger.info(
            "[%d/%d] Loading %s for company %s",
            file_num,
            total_files,
            doc_id,
            company_name,
        )
        try:
            docs = PyPDFLoader(pdf_path).load()
        except Exception as exc:
            logger.error("Failed to load %s: %s — skipping", pdf_path, exc)
            continue

        chunks = splitter.split_documents(docs)
        file_chunks = [
            Document(
                page_content=chunk.page_content,
                metadata={
                    **chunk.metadata,
                    "ticker_id": ticker_id,
                    "ticker": ticker,
                    "company_name": company_name,
                    "title": title,
                    doc_id_metadata_key: doc_id,
                    **({"markdown_path": markdown_path} if markdown_path else {}),
                    **(
                        {"reporting_company": reporting_company}
                        if reporting_company
                        else {}
                    ),
                },
            )
            for chunk in chunks
        ]

        logger.info(
            "  → %d chunks, inserting in batches of %d",
            len(file_chunks),
            batch_size,
        )
        _insert_batches(
            all_chunks=file_chunks,
            vector_store=vector_store,
            batch_size=batch_size,
            collection_name=collection_name,
        )
        # Explicitly release memory before loading the next file
        del docs, chunks, file_chunks


def _build_chunks(
    csv_file: Path,
    pdf_url_field: str,
    doc_id_field: str,
    doc_id_metadata_key: str,
) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_chunks: list[Document] = []

    with csv_file.open(encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            pdf_path = str(_DB_SETUP_DIR / row[pdf_url_field].strip())
            ticker_id = row["ticker_id"].strip()
            ticker = row["ticker"].strip()
            company_name = row["name"].strip()
            title = row.get("title", "").strip()
            doc_id = row[doc_id_field].strip()
            markdown_url = row.get("markdown_url", "").strip()
            markdown_path = markdown_url if markdown_url else None

            logger.info("Loading %s for company %s", doc_id, company_name)
            docs = PyPDFLoader(pdf_path).load()
            chunks = splitter.split_documents(docs)

            for chunk in chunks:
                all_chunks.append(
                    Document(
                        page_content=chunk.page_content,
                        metadata={
                            **chunk.metadata,
                            "ticker_id": ticker_id,
                            "ticker": ticker,
                            "company_name": company_name,
                            "title": title,
                            doc_id_metadata_key: doc_id,
                            **(
                                {"markdown_path": markdown_path}
                                if markdown_path
                                else {}
                            ),
                        },
                    ),
                )

    return all_chunks


def _insert_batches(
    *,
    all_chunks: list[Document],
    vector_store: AzurePGVectorStore,
    batch_size: int,
    collection_name: str,
) -> None:
    total_batches = math.ceil(len(all_chunks) / batch_size)
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i : i + batch_size]
        batch_num = i // batch_size + 1
        logger.info(
            "Processing batch %d / %d for %r",
            batch_num,
            total_batches,
            collection_name,
        )
        try:
            vector_store.add_documents(batch)
        except Exception as exc:
            logger.error("Error in batch %d: %s", batch_num, exc)
            if "429" in str(exc) or "RateLimit" in str(exc):
                logger.warning("Rate limit hit — sleeping 65 s then retrying…")
                time.sleep(65)
                vector_store.add_documents(batch)
            else:
                raise
