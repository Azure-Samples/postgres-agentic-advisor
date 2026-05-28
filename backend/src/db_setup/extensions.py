"""
Step 1 — Database extensions.

Creates the PostgreSQL extensions required by the application.
All statements use IF NOT EXISTS so this is safe to run on every startup.
"""

import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

logger = logging.getLogger(__name__)


async def setup_extensions(engine: AsyncEngine) -> None:
    """Create required PostgreSQL extensions if they do not already exist."""
    extensions = [
        "vector",
        "pg_diskann",
        "azure_ai",
        "age",
    ]

    async with engine.begin() as conn:
        for ext in extensions:
            await conn.execute(text(f"CREATE EXTENSION IF NOT EXISTS {ext} CASCADE"))
            logger.info(f"Extension ensured: {ext}")

    logger.info("All database extensions are ready.")
