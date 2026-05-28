"""
Teardown entry-point — reverses everything run.py sets up.

    python -m src.db_setup.reset

Steps run in reverse order:
  6. drop mem0 tables
  5. drop vector store collections
  4. delete seed data
  3. drop all ORM tables
  2. drop graph + graph pipeline tables  (must run before extensions are dropped)
  1. drop extensions

WARNING: This is destructive and irreversible. All data will be lost.
"""

import asyncio
import logging

import src.models  # noqa: F401 — registers all models on Base.metadata
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
from src.configs.config import settings
from src.database import create_database_manager
from src.models.base import Base

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

GRAPH_NAME = settings.GRAPH_NAME

_SEED_TABLES = [
    "workflow_trigger",
    "account_holding",
    "security_price",
    "security",
    "client",
    "user",
]

_EXTENSIONS = [
    "age",
    "azure_ai",
    "pg_diskann",
    "vector",
]


async def main() -> None:
    db_manager = create_database_manager()
    engine = db_manager.init_db_session().engine
    try:
        logger.info("=== db_setup reset: starting ===")

        logger.info("Step 6 — drop mem0 tables")
        await _drop_mem0_tables(engine)

        logger.info("Step 5 — drop vector store collections")
        await _drop_vector_stores(engine)

        logger.info("Step 4 — delete seed data")
        await _delete_seed_data(engine)

        logger.info("Step 3 — drop all ORM tables")
        await _drop_schema(engine)

        logger.info("Step 2 — drop graph pipeline tables + graph")
        await _drop_graph(engine)

        # Discard pooled connections before dropping extensions — DROP EXTENSION
        # age CASCADE removes ag_catalog and leaves asyncpg's protocol state
        # machine inconsistent. Disposing forces fresh connections.
        await engine.dispose()

        logger.info("Step 1 — drop extensions")
        await _drop_extensions(engine)

        logger.info("=== db_setup reset: complete ===")
    finally:
        await engine.dispose()


# ---------------------------------------------------------------------------
# Step implementations
# ---------------------------------------------------------------------------


async def _drop_mem0_tables(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text(f"DROP TABLE IF EXISTS {settings.MEM0_MEMORY_TABLE_NAME} CASCADE"),
        )
        await conn.execute(text("DROP TABLE IF EXISTS mem0migrations CASCADE"))
    logger.info(
        "Dropped %s and mem0migrations tables.",
        settings.MEM0_MEMORY_TABLE_NAME,
    )


async def _drop_supply_chain(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SELECT 1 FROM pg_extension WHERE extname = 'age'"),
        )
        if result.first() is None:
            logger.info("AGE extension not installed — skipping supply chain drop.")
            return

    sa_conn = await engine.connect()
    try:
        raw_dbapi = await sa_conn.get_raw_connection()
        raw = raw_dbapi.driver_connection
        await raw.execute("SET search_path = ag_catalog, '$user', public;")

        sql = f"""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM ag_catalog.ag_graph WHERE name = '{GRAPH_NAME}'
                ) THEN
                    PERFORM ag_catalog.drop_graph('{GRAPH_NAME}', true);
                END IF;
            END;
            $$;
        """
        await raw.execute(sql)
        logger.info("Supply chain graph dropped.")
    finally:
        await sa_conn.close()


async def _drop_vector_stores(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        # AzurePGVectorStore tables (current)
        for table_name in [
            settings.VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES,
            settings.VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS,
        ]:
            await conn.execute(
                text(f'DROP TABLE IF EXISTS public."{table_name}" CASCADE'),
            )
            logger.info("Dropped vector store table: %s", table_name)
    logger.info("Dropped vector store tables.")


async def _delete_seed_data(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        for table_name in _SEED_TABLES:
            result = await conn.execute(
                text(
                    "SELECT 1 FROM information_schema.tables "
                    "WHERE table_schema = 'public' AND table_name = :name",
                ),
                {"name": table_name},
            )
            if result.first() is None:
                logger.info("Table %r does not exist — skipping.", table_name)
                continue

            table = Base.metadata.tables.get(table_name)
            if table is not None:
                await conn.execute(table.delete())
                logger.info("Deleted all rows from %r.", table_name)


async def _drop_schema(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        # Drop the chat_history table created dynamically by PostgresChatMessageHistory
        await conn.execute(text("DROP TABLE IF EXISTS chat_history CASCADE"))

        # drop all ORM-mapped tables
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("All ORM tables dropped.")


async def _drop_extensions(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        for ext in _EXTENSIONS:
            await conn.execute(text(f"DROP EXTENSION IF EXISTS {ext} CASCADE"))
            logger.info("Dropped extension: %s", ext)


async def _drop_graph(engine: AsyncEngine) -> None:
    _DROP_ORDER = [
        "graph_relationships",
        "graph_entities",
        "documents",
    ]

    async with engine.begin() as conn:
        for table in _DROP_ORDER:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE;"))
            logger.info("Dropped table: %s", table)

        # AGE extension may have already been dropped in the extensions step.
        # ag_catalog.drop_graph only exists while the extension is installed.
        result = await conn.execute(
            text("SELECT 1 FROM pg_extension WHERE extname = 'age'"),
        )
        if result.first() is None:
            logger.info("AGE extension not installed — skipping graph drop.")
            return

        await conn.execute(
            text('SET search_path = ag_catalog, "$user", public;'),
        )
        await conn.execute(
            text(
                f"SELECT * FROM ag_catalog.drop_graph('{settings.GRAPH_NAME}', true);",
            ),
        )

    logger.info(
        "Dropped graph pipeline tables (documents, graph_entities, graph_relationships) and graph.",
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(main())
