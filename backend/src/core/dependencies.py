import traceback
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.logging import logger
from src.lifespan_manager import get_db_manager


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide database session for FastAPI dependency injection."""
    async with (await get_db_manager()).session_factory() as session:
        try:
            yield session
        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Database session error: {exc}")
            logger.error(traceback.format_exc())
            await session.rollback()
            raise exc


DBSession = Annotated[AsyncSession, Depends(get_async_db)]
