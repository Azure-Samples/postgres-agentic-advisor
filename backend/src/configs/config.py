from mem0.configs.base import MemoryConfig
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow",
    )

    DB_NAME: str
    DB_HOST: str
    DB_PORT: str = "5432"
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    DB_SSLMODE: str = "require"
    DB_TYPE: str = "horizondb"
    ENTRA_AUTH: bool = False
    GRAPH_NAME: str = "agentic_advisor_graph"

    AZURE_OPENAI_EMBEDDING_MODEL: str
    AZURE_OPENAI_CHAT_MODEL: str

    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_VERSION: str
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME: str
    AZURE_OPENAI_CHAT_DEPLOYMENT_NAME: str
    AZURE_OPENAI_API_KEY: str = ""

    SQLALCHEMY_CONNECTION_POOL_SIZE: int = 20
    SQLALCHEMY_POOL_RECYCLE_TIMEOUT: int = 3600
    SQLALCHEMY_DEBUG_MODE: bool = False

    AZURE_IDENTITY_NAME: str = ""
    APP_VERSION: str = "1.0.0"

    CHAT_HISTORY_DB_TABLE_NAME: str

    SEC_FILES_SEEDING_BATCH_SIZE: int = 100
    NEWS_ARTICLES_SEEDING_BATCH_SIZE: int = 100

    VECTOR_STORE_COLLECTION_NAME_SEC_FILINGS: str
    VECTOR_STORE_COLLECTION_NAME_NEWS_ARTICLES: str

    STOCK_PRICE_DROP_THRESHOLD_PERCENTAGE: int
    TOP_K_NEWS_ARTICLES: int
    TOP_K_SEC_FILINGS: int

    PHOENIX_PROJECT_NAME: str = "agentic-advisor"
    PHOENIX_COLLECTOR_ENDPOINT: str = "http://localhost:6006/v1/traces"
    PHOENIX_BASE_URL: str = "http://localhost:6006"

    # Mem0 memory configuration
    MEM0_LLM_PROVIDER: str = "azure_openai"
    MEM0_MEMORY_PROVIDER: str = "pgvector"
    MEM0_MEMORY_TABLE_NAME: str = "mem0_client_preferences"
    AZURE_OPENAI_EMBEDDING_MODEL_DIMS: int = 1536
    MEM0_AZURE_OPENAI_MAX_TOKENS: int = 2000
    MEM0_AZURE_OPENAI_TEMPERATURE: float = 0.1

    def get_mem0_memory_config(self) -> MemoryConfig:
        """Build the mem0 MemoryConfig from application settings."""
        return MemoryConfig(
            llm={
                "provider": self.MEM0_LLM_PROVIDER,
                "config": {
                    "model": self.AZURE_OPENAI_CHAT_MODEL,
                    "temperature": self.MEM0_AZURE_OPENAI_TEMPERATURE,
                    "max_tokens": self.MEM0_AZURE_OPENAI_MAX_TOKENS,
                    "azure_kwargs": {
                        "azure_deployment": self.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME,
                        "api_version": self.AZURE_OPENAI_API_VERSION,
                        "azure_endpoint": self.AZURE_OPENAI_ENDPOINT,
                        "api_key": self.AZURE_OPENAI_API_KEY,
                    },
                },
            },
            embedder={
                "provider": self.MEM0_LLM_PROVIDER,
                "config": {
                    "model": self.AZURE_OPENAI_EMBEDDING_MODEL,
                    "azure_kwargs": {
                        "azure_deployment": self.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
                        "api_version": self.AZURE_OPENAI_API_VERSION,
                        "azure_endpoint": self.AZURE_OPENAI_ENDPOINT,
                        "api_key": self.AZURE_OPENAI_API_KEY,
                    },
                },
            },
            vector_store={
                "provider": self.MEM0_MEMORY_PROVIDER,
                "config": {
                    "dbname": self.DB_NAME,
                    "user": self.DB_USER,
                    "password": self.DB_PASSWORD,
                    "host": self.DB_HOST,
                    "port": self.DB_PORT,
                    "collection_name": self.MEM0_MEMORY_TABLE_NAME,
                    "embedding_model_dims": self.AZURE_OPENAI_EMBEDDING_MODEL_DIMS,
                    "hnsw": True,
                    "diskann": False,
                },
            },
        )


settings = Settings()
