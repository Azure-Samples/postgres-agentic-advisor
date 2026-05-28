from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.suggested_responses import SuggestedResponse
from src.repositories.base import BaseRepository


class SuggestedResponseRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: SuggestedResponse) -> SuggestedResponse:
        """Add a new suggested response to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: int,
    ) -> SuggestedResponse:
        """Retrieve a suggested response by its ID."""
        query = select(SuggestedResponse).filter(
            SuggestedResponse.suggested_response_id == id,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_alert_id(self, alert_id: int) -> list[SuggestedResponse]:
        """Get all suggested responses for a specific alert."""
        query = select(SuggestedResponse).filter(SuggestedResponse.alert_id == alert_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, entity: SuggestedResponse) -> SuggestedResponse:
        """Update an existing suggested response."""
        existing = await self.get_by_id(entity.suggested_response_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Suggested response not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(self, id: int) -> bool:
        """Delete a suggested response by its ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True
