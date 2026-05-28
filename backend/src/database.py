from __future__ import annotations

import logging
from abc import ABC, abstractmethod

from sqlalchemy import event
from sqlalchemy.engine.url import URL
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from src.configs.config import settings
from src.core.azure_auth import AzureTokenProvider
from src.core.exceptions import DatabaseAuthenticationError, DatabaseConnectionError

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Abstract base class — defines the contract all DB managers must fulfil
# ──────────────────────────────────────────────────────────────────────────────


class BaseDatabaseManager(ABC):
    """Contract that every database manager must implement.

    Callers (lifespan_manager, repositories, services) only depend on
    this interface — never on a concrete class — so swapping the DB
    backend at runtime has zero impact on the rest of the codebase.
    """

    @property
    @abstractmethod
    def engine(self) -> AsyncEngine:
        """The initialised async SQLAlchemy engine."""
        ...

    @property
    @abstractmethod
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        """Factory that produces AsyncSession instances."""
        ...

    @abstractmethod
    def init_db_session(self) -> "BaseDatabaseManager":
        """Create the engine and session factory. Must be called before use."""
        ...

    @abstractmethod
    def get_sync_database_url_with_token(self) -> str:
        """Return a synchronous database URL with credentials embedded.

        For Postgres this injects an Entra ID token; for HorizonDB it
        embeds the static password. Used by psycopg_pool.
        """
        ...

    @abstractmethod
    async def close(self) -> None:
        """Dispose of the engine and release all connections."""
        ...


# ──────────────────────────────────────────────────────────────────────────────
# PostgreSQL Flexible Server — Azure Entra ID (token) authentication
# ──────────────────────────────────────────────────────────────────────────────


class PostgresDatabaseManager(BaseDatabaseManager):
    """
    Database manager for Azure PostgreSQL Flexible Server.
    Authenticates via Azure Entra ID tokens (no static password stored).
    """

    def __init__(self, token_provider: AzureTokenProvider | None = None):
        self._token_provider = token_provider or AzureTokenProvider()
        self._engine: AsyncEngine | None = None
        self._session_factory: async_sessionmaker[AsyncSession] | None = None

    @property
    def engine(self) -> AsyncEngine:
        """Get the database engine, creating it if necessary."""
        if self._engine is None:
            raise RuntimeError(
                "Database not initialized. Call init_db_session() first.",
            )
        return self._engine

    @property
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        """Get the session factory."""
        if self._session_factory is None:
            raise RuntimeError(
                "Database not initialized. Call init_db_session() first.",
            )
        return self._session_factory

    def init_db_session(self) -> "PostgresDatabaseManager":
        """Initialize the database engine and session factory."""
        try:
            database_url = self._build_database_url(is_async=True)
            self._engine = create_async_engine(
                database_url,
                pool_size=settings.SQLALCHEMY_CONNECTION_POOL_SIZE,
                pool_recycle=settings.SQLALCHEMY_POOL_RECYCLE_TIMEOUT,
                pool_pre_ping=True,
                echo=settings.SQLALCHEMY_DEBUG_MODE,
            )

            self._session_factory = async_sessionmaker(
                bind=self._engine,
                expire_on_commit=False,
                class_=AsyncSession,
            )

            self._register_connection_events()
            logger.info("PostgreSQL Flexible Server session initialized successfully")
            return self

        except DatabaseAuthenticationError as exc:
            raise exc
        except Exception as exc:
            logger.error(f"Failed to initialize database session: {exc}")
            raise DatabaseConnectionError(
                f"Database initialization failed: {exc}",
            ) from exc

    def _register_connection_events(self) -> None:
        """Register SQLAlchemy events for token injection."""

        @event.listens_for(self._engine.sync_engine, "do_connect")
        def provide_token(dialect, conn_rec, cargs, cparams):
            """Inject fresh Azure AD token into connection parameters."""
            try:
                token = (
                    self._token_provider.get_token_sync()
                )  # Use sync method for SQLAlchemy events
                cparams["password"] = token
                logger.debug("Azure AD token injected into connection")
            except Exception as exc:
                logger.error(f"Failed to provide token for connection: {exc}")
                raise exc

    def _build_database_url(
        self,
        is_async: bool = True,
        use_password: bool = False,
    ) -> str:
        try:
            username = self._token_provider.get_username_sync()
            driver_name = "postgresql+asyncpg" if is_async else "postgresql"
            url = URL.create(
                drivername=driver_name,
                username=username,
                host=settings.DB_HOST,
                port=int(settings.DB_PORT),
                database=settings.DB_NAME,
            )

            if use_password:
                token = self._token_provider.get_token_sync()
                url = url.set(password=token)

            logger.debug(f"Built database URL for user: {username}")
            return url.render_as_string(hide_password=False)

        except (DatabaseAuthenticationError, DatabaseConnectionError) as exc:
            raise exc
        except Exception as exc:
            logger.error(f"Failed to build database URL: {exc}")
            raise DatabaseConnectionError(
                f"Database URL construction failed: {exc}",
            ) from exc

    def get_sync_database_url(self) -> str:
        return self._build_database_url(is_async=False)

    def get_sync_database_url_with_token(self) -> str:
        """
        Get sync database URL with embedded token.
        Used by psycopg_pool which cannot use SQLAlchemy connection events.
        """
        return self._build_database_url(is_async=False, use_password=True)

    async def close(self) -> None:
        if self._engine:
            await self._engine.dispose()
            logger.info("PostgreSQL database connections closed")

    async def reset_token_provider(self) -> None:
        await self._token_provider.reset()
        logger.info("Token provider reset")


# ──────────────────────────────────────────────────────────────────────────────
# HorizonDB — standard password authentication
# ──────────────────────────────────────────────────────────────────────────────


class HorizonDBDatabaseManager(BaseDatabaseManager):
    """
    Database manager for Azure HorizonDB clusters.
    Authenticates with a static username/password (no Entra token injection).
    DB_USER and DB_PASSWORD are sourced from Key Vault via environment variables.
    """

    def __init__(self):
        self._engine: AsyncEngine | None = None
        self._session_factory: async_sessionmaker[AsyncSession] | None = None

    @property
    def engine(self) -> AsyncEngine:
        if self._engine is None:
            raise RuntimeError(
                "Database not initialized. Call init_db_session() first.",
            )
        return self._engine

    @property
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._session_factory is None:
            raise RuntimeError(
                "Database not initialized. Call init_db_session() first.",
            )
        return self._session_factory

    def init_db_session(self) -> "HorizonDBDatabaseManager":
        """Initialize the engine and session factory using password auth."""
        try:
            database_url = self._build_database_url(is_async=True)
            self._engine = create_async_engine(
                database_url,
                pool_size=settings.SQLALCHEMY_CONNECTION_POOL_SIZE,
                pool_recycle=settings.SQLALCHEMY_POOL_RECYCLE_TIMEOUT,
                pool_pre_ping=True,
                echo=settings.SQLALCHEMY_DEBUG_MODE,
                # HorizonDB requires SSL; asyncpg accepts this via connect_args
                connect_args={"ssl": "require"},
            )
            self._session_factory = async_sessionmaker(
                bind=self._engine,
                expire_on_commit=False,
                class_=AsyncSession,
            )
            logger.info("HorizonDB session initialized successfully")
            return self

        except Exception as exc:
            logger.error(f"Failed to initialize HorizonDB session: {exc}")
            raise DatabaseConnectionError(
                f"HorizonDB initialization failed: {exc}",
            ) from exc

    def _build_database_url(self, is_async: bool = True) -> str:
        driver_name = "postgresql+asyncpg" if is_async else "postgresql"
        url = URL.create(
            drivername=driver_name,
            username=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=int(settings.DB_PORT),
            database=settings.DB_NAME,
        )
        logger.debug(f"Built HorizonDB URL for user: {settings.DB_USER}")
        return url.render_as_string(hide_password=False)

    def get_sync_database_url(self) -> str:
        return self._build_database_url(is_async=False)

    def get_sync_database_url_with_token(self) -> str:
        """For HorizonDB there is no token — password is embedded directly in the URL."""
        return self.get_sync_database_url()

    async def close(self) -> None:
        if self._engine:
            await self._engine.dispose()
            logger.info("HorizonDB connections closed")


# ──────────────────────────────────────────────────────────────────────────────
# Factory — select the right manager based on DB_TYPE env var
# ──────────────────────────────────────────────────────────────────────────────


def create_database_manager() -> BaseDatabaseManager:
    """
    Return the appropriate DatabaseManager based on settings.DB_TYPE.

    DB_TYPE=horizondb  -> HorizonDBDatabaseManager (password auth)
    DB_TYPE=postgres   -> PostgresDatabaseManager (Azure Entra ID token auth) [legacy]
    """
    db_type = settings.DB_TYPE.lower()
    if db_type in ("postgres", "postgresql"):
        logger.info("Using PostgreSQL Flexible Server database manager (Entra ID auth)")
        return PostgresDatabaseManager()
    else:
        # Default to HorizonDB
        logger.info("Using HorizonDB database manager (password auth)")
        return HorizonDBDatabaseManager()
