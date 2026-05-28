from azure.identity.aio import DefaultAzureCredential, get_bearer_token_provider
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from src.configs.config import settings


class AzureOpenAIService:
    def __init__(self, credential: DefaultAzureCredential):
        self.credential = credential

        self.chat_model = settings.AZURE_OPENAI_CHAT_MODEL
        self.chat_model_deployment_name = settings.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME
        self.azure_endpoint = settings.AZURE_OPENAI_ENDPOINT
        self.api_version = settings.AZURE_OPENAI_API_VERSION
        self.embedding_model = settings.AZURE_OPENAI_EMBEDDING_MODEL
        self.embedding_model_deployment_name = (
            settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME
        )

    async def get_embedding_client(self):
        """Initialize and return the Azure OpenAI Embedding client."""

        return AzureOpenAIEmbeddings(
            azure_deployment=self.embedding_model_deployment_name,
            model=self.embedding_model,
            azure_endpoint=self.azure_endpoint,
            api_version=self.api_version,
            azure_ad_token_provider=await self._get_token_provider(),
        )

    async def get_chat_client(self):
        """Initialize and return the Azure OpenAI Chat client."""

        return AzureChatOpenAI(
            azure_deployment=self.chat_model_deployment_name,
            azure_endpoint=self.azure_endpoint,
            api_version=self.api_version,
            azure_ad_token_provider=await self._get_token_provider(),
            temperature=0,
        )

    async def _get_token_provider(self):
        """Get the bearer token provider for Azure OpenAI service."""
        return get_bearer_token_provider(
            self.credential,
            "https://cognitiveservices.azure.com/.default",
        )
