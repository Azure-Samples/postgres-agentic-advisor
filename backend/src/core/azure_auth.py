"""Azure AD authentication provider for PostgreSQL database access."""

import asyncio
import threading
import time

import jwt
from azure.core.exceptions import ClientAuthenticationError
from azure.identity import DefaultAzureCredential
from src.configs.config import settings
from src.core.exceptions import DatabaseAuthenticationError, TokenProviderError
from src.core.logging import logger


class AzureTokenProvider:
    """Async thread-safe manager for Azure AD tokens used in PostgreSQL authentication."""

    POSTGRESQL_SCOPE = "https://ossrdbms-aad.database.windows.net/.default"
    TOKEN_REFRESH_BUFFER = 300  # Refresh token 5 minutes before expiry

    def __init__(self, credentials: DefaultAzureCredential | None = None):
        self._credential = credentials or DefaultAzureCredential()
        self._token = None
        self._token_acquired_at = None
        self._username = None
        self._lock = asyncio.Lock()  # async path
        self._sync_lock = threading.RLock()  # sync path (do_connect, Alembic)

    async def get_token(self) -> str:
        """Get a valid Azure AD token, refreshing if necessary. Async-safe."""
        async with self._lock:
            try:
                if self._should_refresh_token():
                    await self._refresh_token()
                return self._token.token
            except DatabaseAuthenticationError as exc:
                raise exc
            except Exception as e:
                logger.error(f"Failed to acquire Azure AD token: {e}")
                raise TokenProviderError(f"Token acquisition failed: {e}") from e

    async def get_username(self) -> str:
        """Get the username associated with the current token. Async-safe."""
        async with self._lock:
            if self._username is None:
                # Get token without acquiring lock again (avoid deadlock)
                if self._should_refresh_token():
                    await self._refresh_token()
                token = self._token.token
                self._username = self._extract_username_from_token(token)
            return self._username

    def _should_refresh_token(self) -> bool:
        """Check if the token needs to be refreshed. Must be called within lock."""
        if self._token is None or self._token_acquired_at is None:
            return True

        time_until_expiry = self._token.expires_on - time.time()
        return time_until_expiry <= self.TOKEN_REFRESH_BUFFER

    async def _refresh_token(self) -> None:
        """Refresh the Azure AD token. Must be called within lock."""
        logger.debug("Refreshing Azure AD token")
        try:
            # Run the synchronous credential.get_token in a thread pool
            loop = asyncio.get_event_loop()
            self._token = await loop.run_in_executor(
                None,
                self._credential.get_token,
                self.POSTGRESQL_SCOPE,
            )
            self._token_acquired_at = time.time()
            self._username = None  # Reset username to be re-extracted
            logger.debug("Azure AD token refreshed successfully")
        except ClientAuthenticationError as exc:
            logger.error(f"Azure authentication failed: {exc}")
            raise DatabaseAuthenticationError(
                f"Azure AD authentication failed: {exc}",
            ) from exc
        except Exception as exc:
            logger.error(f"Unexpected error during token refresh: {exc}")
            raise TokenProviderError(f"Token refresh failed: {exc}") from exc

    def _extract_username_from_token(self, token: str) -> str:
        """Extract username from JWT token."""
        try:
            # Decode without signature verification since we trust Azure AD
            decoded_token = jwt.decode(token, options={"verify_signature": False})

            # For user tokens: use 'upn' (User Principal Name)
            # For managed identity tokens: use configured identity name
            username = decoded_token.get("upn")
            if username:
                logger.debug(f"Extracted username from token: {username}")
                return username

            # Fallback to configured identity name for managed identity
            if settings.AZURE_IDENTITY_NAME:
                logger.debug(
                    f"Using configured identity name: {settings.AZURE_IDENTITY_NAME}",
                )
                return settings.AZURE_IDENTITY_NAME

            raise TokenProviderError(
                "Cannot determine username from token or configuration",
            )

        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {e}")
            raise TokenProviderError(f"Invalid token format: {e}") from e
        except TokenProviderError as exc:
            raise exc
        except Exception as e:
            logger.error(f"Error extracting username from token: {e}")
            raise TokenProviderError(f"Failed to extract username: {e}") from e

    def get_token_sync(self) -> str:
        """Get a valid Azure AD token synchronously. For SQLAlchemy events and Alembic."""
        with self._sync_lock:
            try:
                if self._should_refresh_token():
                    self._token = self._credential.get_token(self.POSTGRESQL_SCOPE)
                    self._token_acquired_at = time.time()
                    self._username = None
                    logger.debug("Azure AD token refreshed successfully (sync)")
                return self._token.token
            except ClientAuthenticationError as exc:
                logger.error(f"Azure authentication failed: {exc}")
                raise DatabaseAuthenticationError(
                    f"Azure AD authentication failed: {exc}",
                ) from exc
            except Exception as exc:
                logger.error(f"Failed to acquire Azure AD token (sync): {exc}")
                raise TokenProviderError(f"Token acquisition failed: {exc}") from exc

    def get_username_sync(self) -> str:
        """Get username synchronously. For SQLAlchemy events and Alembic."""
        with self._sync_lock:
            token = self.get_token_sync()
            if self._username is None:
                self._username = self._extract_username_from_token(token)
            return self._username

    async def reset(self) -> None:
        """Reset the token provider (useful for testing or error recovery). Async-safe."""
        async with self._lock:
            self._token = None
            self._token_acquired_at = None
            self._username = None
            logger.debug("Token provider reset")
