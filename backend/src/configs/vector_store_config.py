from langchain_azure_postgresql.common import (
    AsyncAzurePGConnectionPool,
    AsyncConnectionInfo,
    BasicAuth,
    DiskANN,
    VectorType,
)
from langchain_azure_postgresql.langchain import AsyncAzurePGVectorStore
from src.configs.config import settings


class VectorStoreManager:

    @classmethod
    async def get_vector_store(
        cls,
        collection_name,
        embedding_model,
        async_db_engine=None,
    ):
        if settings.ENTRA_AUTH:
            azure_conn_info = AsyncConnectionInfo(
                host=settings.DB_HOST,
                dbname=settings.DB_NAME,
            )
        else:
            azure_conn_info = AsyncConnectionInfo(
                host=settings.DB_HOST,
                dbname=settings.DB_NAME,
                credentials=BasicAuth(
                    username=settings.DB_USER,
                    password=settings.DB_PASSWORD,
                ),
            )

        connection = AsyncAzurePGConnectionPool(
            azure_conn_info=azure_conn_info,
            min_size=5,
            max_size=20,
            open=False,
        )
        await connection.open()

        # AsyncAzurePGVectorStore's Pydantic validator calls _run_coroutine_in_sync,
        # which spawns a new thread with a fresh event loop. A pool already opened in
        # the main event loop can't be used from that new loop (asyncio primitives are
        # loop-bound), causing a 30-second PoolTimeout. model_construct bypasses the
        # validator; we run _ensure_table_verified() ourselves in the correct context.
        vector_store = AsyncAzurePGVectorStore.model_construct(
            connection=connection,
            embedding=embedding_model,
            table_name=collection_name,
            schema_name="public",
            id_column="id",
            content_column="content",
            embedding_column="embedding",
            embedding_type=VectorType.vector,
            embedding_dimension=settings.AZURE_OPENAI_EMBEDDING_MODEL_DIMS,
            embedding_index=DiskANN(),
            metadata_columns="metadata",
        )
        await vector_store._ensure_table_verified()

        return vector_store
