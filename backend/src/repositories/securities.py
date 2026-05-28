from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect
from src.models.securities import Security
from src.repositories.base import BaseRepository


class SecurityRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: Security) -> Security:
        """Add a new security to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: int,
    ) -> Security | None:  # pylint: disable=redefined-builtin
        """Retrieve a security by its ID."""
        query = select(Security).filter(Security.id == id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_security_json_by_id(self, security_id: int) -> Dict[str, Any]:
        """Return full security ORM fields as JSON-friendly dict."""
        security = await self.get_by_id(security_id)
        if not security:
            raise HTTPException(status_code=404, detail="Security not found")
        data = {
            c.key: getattr(security, c.key)
            for c in inspect(security).mapper.column_attrs
        }
        return data

    async def get_all(self) -> list[Security]:
        """Get all securities."""
        query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .order_by(Security.ticker)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, entity: Security) -> Security:
        """Update an existing security."""
        existing = await self.get_by_id(entity.id)
        if not existing:
            raise HTTPException(status_code=404, detail="Security not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(self, id: int) -> bool:  # pylint: disable=redefined-builtin
        """Delete a security by its ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def get_by_ticker(self, ticker: str) -> Security | None:
        """Get a security by ticker symbol."""
        query = select(Security).filter(Security.ticker == ticker.upper())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_exchange(self, exchange: str) -> list[Security]:
        query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .filter(Security.exchange == exchange.upper())
            .order_by(Security.ticker)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_sector(self, sector: str) -> list[Security]:
        query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .filter(Security.sector == sector)
            .order_by(Security.ticker)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_industry(self, industry: str) -> list[Security]:
        query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .filter(Security.industry == industry)
            .order_by(Security.ticker)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        exchange: str | None = None,
        sector: str | None = None,
        industry: str | None = None,
    ) -> tuple[int, list[Security]]:
        base_query = select(Security).filter(Security.has_data.is_(True))

        # Apply filters
        filters = []
        if exchange:
            filters.append(Security.exchange == exchange.upper())
        if sector:
            filters.append(Security.sector == sector)
        if industry:
            filters.append(Security.industry == industry)

        if filters:
            base_query = base_query.filter(and_(*filters))

        # Get total count
        total_query = base_query
        total_result = await self.db.execute(total_query)
        total = len(list(total_result.scalars().all()))

        # Get paginated results
        query = (
            base_query.order_by(Security.ticker)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)
        securities = list(result.scalars().all())

        return total, securities

    async def exists(self, security_id: int) -> bool:
        """Check if a security exists."""
        query = select(Security).filter(Security.id == security_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
