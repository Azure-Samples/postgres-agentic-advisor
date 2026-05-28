from __future__ import annotations

from datetime import date
from typing import Tuple

from fastapi import HTTPException
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.security_prices import SecurityPrice
from src.repositories.base import BaseRepository

# Custom ID type for composite key
SecurityPriceId = Tuple[int, date]


class SecurityPriceRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: SecurityPrice) -> SecurityPrice:
        """Add a new security price to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: SecurityPriceId,
    ) -> SecurityPrice | None:  # pylint: disable=redefined-builtin
        """Retrieve a security price by its composite ID (security_id, price_date)."""
        security_id, price_date = id
        query = select(SecurityPrice).filter(
            and_(
                SecurityPrice.security_id == security_id,
                SecurityPrice.price_date == price_date,
            ),
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update(self, entity: SecurityPrice) -> SecurityPrice:
        """Update an existing security price."""
        existing = await self.get_by_id((entity.security_id, entity.price_date))
        if not existing:
            raise HTTPException(status_code=404, detail="Security price not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(
        self,
        id: SecurityPriceId,
    ) -> bool:  # pylint: disable=redefined-builtin
        """Delete a security price by its composite ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def get_by_security_id(
        self,
        security_id: int,
        limit: int | None = None,
    ) -> list[SecurityPrice]:
        """Get all price data for a specific security."""
        query = (
            select(SecurityPrice)
            .filter(SecurityPrice.security_id == security_id)
            .order_by(desc(SecurityPrice.price_date))
        )

        if limit:
            query = query.limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_date_range(
        self,
        security_id: int,
        start_date: date,
        end_date: date,
    ) -> list[SecurityPrice]:
        """Get price data for a security within a date range."""
        query = (
            select(SecurityPrice)
            .filter(
                and_(
                    SecurityPrice.security_id == security_id,
                    SecurityPrice.price_date >= start_date,
                    SecurityPrice.price_date <= end_date,
                ),
            )
            .order_by(SecurityPrice.price_date)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_latest_price(self, security_id: int) -> SecurityPrice | None:
        """Get the most recent price data for a security."""
        query = (
            select(SecurityPrice)
            .filter(SecurityPrice.security_id == security_id)
            .order_by(desc(SecurityPrice.price_date))
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_price_on_date(
        self,
        security_id: int,
        target_date: date,
    ) -> SecurityPrice | None:
        """Get price data for a security on a specific date."""
        return await self.get_by_id((security_id, target_date))

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        security_id: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> tuple[int, list[SecurityPrice]]:
        """Get paginated security prices with optional filtering."""
        base_query = select(SecurityPrice)

        # Apply filters
        filters = []
        if security_id:
            filters.append(SecurityPrice.security_id == security_id)
        if start_date:
            filters.append(SecurityPrice.price_date >= start_date)
        if end_date:
            filters.append(SecurityPrice.price_date <= end_date)

        if filters:
            base_query = base_query.filter(and_(*filters))

        # Get total count
        total_query = base_query
        total_result = await self.db.execute(total_query)
        total = len(list(total_result.scalars().all()))

        # Get paginated results
        query = (
            base_query.order_by(desc(SecurityPrice.price_date))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)
        prices = list(result.scalars().all())

        return total, prices

    async def exists(self, price_id: SecurityPriceId) -> bool:
        """Check if a security price exists."""
        security_id, price_date = price_id
        query = select(SecurityPrice).filter(
            and_(
                SecurityPrice.security_id == security_id,
                SecurityPrice.price_date == price_date,
            ),
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_all(self) -> list[SecurityPrice]:
        """Get all security prices."""
        query = select(SecurityPrice).order_by(
            SecurityPrice.security_id,
            desc(SecurityPrice.price_date),
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_price_history_summary(self, security_id: int, days: int = 30) -> dict:
        """Get a summary of price history for the last N days."""
        prices = await self.get_by_security_id(security_id, limit=days)

        if not prices:
            return {}

        closes = [p.close for p in prices]
        highs = [p.high for p in prices if p.high is not None]
        lows = [p.low for p in prices if p.low is not None]
        volumes = [p.volume for p in prices if p.volume is not None]

        return {
            "latest_price": closes[0] if closes else None,
            "highest_price": max(highs) if highs else None,
            "lowest_price": min(lows) if lows else None,
            "average_price": sum(closes) / len(closes) if closes else None,
            "total_volume": sum(volumes) if volumes else None,
            "price_change": closes[0] - closes[-1] if len(closes) > 1 else 0,
            "price_change_percent": (
                ((closes[0] - closes[-1]) / closes[-1] * 100)
                if len(closes) > 1 and closes[-1] != 0
                else 0
            ),
            "days_of_data": len(prices),
        }
