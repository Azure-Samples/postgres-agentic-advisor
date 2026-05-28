import asyncio
from contextlib import asynccontextmanager

from azure.identity.aio import DefaultAzureCredential
from openinference.instrumentation.langchain import LangChainInstrumentor
from phoenix.otel import register
from psycopg_pool import AsyncConnectionPool
from src.configs.config import settings
from src.configs.vector_store_config import VectorStoreManager
from src.core.logging import logger
from src.database import create_database_manager
from src.services.alert_flow_agent_service import AlertWorkflowService
from src.services.askai_workflow_service import AskAIWorkflowService
from src.services.azure_openai_service import AzureOpenAIService
from src.services.chatbot_agent_service import ChatAgentService
from src.services.source_highlight_service import SourceHighlightService


async def _refresh_psycopg_pool(db_manager, chat_agent_service: ChatAgentService):
    """Background task that periodically recreates the psycopg pool with a fresh Azure AD token."""

    while True:
        await asyncio.sleep(45 * 60)
        logger.info("Refreshing psycopg connection pool with a new Azure AD token")
        try:
            new_pool = AsyncConnectionPool(
                db_manager.get_sync_database_url_with_token(),
                min_size=5,
                max_size=20,
                open=False,
            )
            await new_pool.open()
            old_pool = chat_agent_service.async_db_pool
            chat_agent_service.async_db_pool = new_pool
            await old_pool.close()
            logger.info("psycopg connection pool refreshed successfully")
        except Exception as exc:
            logger.error(f"Failed to refresh psycopg connection pool: {exc}")


# Global service instances
azure_openai_service = None
chat_agent_service = None
credential = None
alert_workflow_service = None
askai_workflow_service = None
source_highlight_service = None
llm = None
embedding_model = None


@asynccontextmanager
async def lifespan(app):
    """Async context manager for FastAPI application lifespan."""
    global azure_openai_service
    global chat_agent_service
    global credential
    global alert_workflow_service
    global askai_workflow_service
    global source_highlight_service
    global llm
    global db_manager
    global embedding_model
    global async_db_engine

    # arize trace provider
    tracer_provider = register(
        project_name=settings.PHOENIX_PROJECT_NAME,
        endpoint=settings.PHOENIX_COLLECTOR_ENDPOINT,
        auto_instrument=True,
        set_global_tracer_provider=True,
    )
    LangChainInstrumentor().instrument(
        skip_dep_check=True,
        tracer_provider=tracer_provider,
    )

    # Create an async Microsoft Entra ID RBAC credential
    credential = DefaultAzureCredential()

    # Initializations
    db_manager = create_database_manager()
    async_db_pool = AsyncConnectionPool(
        db_manager.get_sync_database_url_with_token(),
        min_size=5,
        max_size=20,
        open=False,
    )
    await async_db_pool.open()

    async_db_engine = db_manager.init_db_session().engine

    azure_openai_service = AzureOpenAIService(
        credential=credential,
    )

    llm = await azure_openai_service.get_chat_client()
    embedding_model = await azure_openai_service.get_embedding_client()

    app.state.vector_store_news_articles = await VectorStoreManager.get_vector_store(
        collection_name="news_articles",
        embedding_model=embedding_model,
        async_db_engine=async_db_engine,
    )

    app.state.vector_store_sec_filings = await VectorStoreManager.get_vector_store(
        collection_name="sec_filings",
        embedding_model=embedding_model,
        async_db_engine=async_db_engine,
    )

    alert_workflow_service = AlertWorkflowService(
        llm=llm,
        vector_store_news_articles=app.state.vector_store_news_articles,
        vector_store_sec_filings=app.state.vector_store_sec_filings,
        async_db_engine=async_db_engine,
    )

    askai_workflow_service = AskAIWorkflowService(
        llm=llm,
        vector_store_news_articles=app.state.vector_store_news_articles,
        vector_store_sec_filings=app.state.vector_store_sec_filings,
        async_db_engine=async_db_engine,
    )

    source_highlight_service = SourceHighlightService()

    chat_agent_service = ChatAgentService(
        async_db_pool=async_db_pool,
        llm=llm,
        session_factory=db_manager.session_factory,
        askai_workflow_service=askai_workflow_service,
    )

    pool_refresh_task = asyncio.create_task(
        _refresh_psycopg_pool(db_manager, chat_agent_service),
    )

    yield

    # Cleanup resources
    pool_refresh_task.cancel()
    try:
        await pool_refresh_task
    except asyncio.CancelledError:
        pass

    app.state.vector_store_news_articles = None
    app.state.vector_store_sec_filings = None
    await chat_agent_service.async_db_pool.close()
    await async_db_engine.dispose()
    await credential.close()


# Dependency getters
async def get_db_manager():
    return db_manager


async def get_async_db_engine():
    return async_db_engine


async def get_chat_client():
    return llm


async def get_embedding_client():
    return embedding_model


async def get_chatbot_agent_service():
    return chat_agent_service


async def get_alert_workflow_service():
    return alert_workflow_service


async def get_askai_workflow_service():
    return askai_workflow_service


async def get_source_highlight_service():
    return source_highlight_service


async def get_async_db_session():
    async with db_manager.session_factory() as session:
        yield session
