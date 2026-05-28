"""
Step 2 — Database schema creation.

Uses Base.metadata.create_all() with checkfirst=True so every table and index
is created only if it does not already exist — safe to run on every startup.
"""

import logging

# Import all models so they are registered in Base.metadata before create_all.
import src.models  # noqa: F401
from sqlalchemy.ext.asyncio import AsyncEngine
from src.models.base import Base

logger = logging.getLogger(__name__)


async def setup_schema(engine: AsyncEngine) -> None:
    """Create all ORM-mapped tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all, checkfirst=True)
    logger.info("All ORM tables are ready.")
