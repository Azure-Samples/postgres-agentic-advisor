from __future__ import annotations

import datetime as dt
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, cast, desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.types import Date as SADate
from src.models.account_holdings import AccountHolding
from src.models.securities import Security
from src.models.security_prices import SecurityPrice
from src.repositories.base import BaseRepository


class AccountHoldingRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: AccountHolding) -> AccountHolding:
        """Add a new account holding to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: int,
    ) -> AccountHolding | None:  # pylint: disable=redefined-builtin
        """Retrieve an account holding by its ID."""
        query = select(AccountHolding).filter(AccountHolding.id == id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self) -> list[AccountHolding]:
        """Get all account holdings."""
        query = select(AccountHolding).order_by(AccountHolding.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_client_id(
        self,
        client_id: int,
        as_of_date: Optional[dt.date] = None,
    ) -> list[AccountHolding]:
        """Get account holdings for a client that were open on as_of_date.

        If as_of_date is provided, returns only holdings where:
          - as_of <= as_of_date  (position existed by that date)
          - closed_at IS NULL OR closed_at > as_of_date  (not yet closed)
        """
        query = select(AccountHolding).filter(AccountHolding.client_id == client_id)
        if as_of_date is not None:
            query = query.filter(
                and_(
                    cast(AccountHolding.as_of, SADate) <= as_of_date,
                    or_(
                        AccountHolding.closed_at.is_(None),
                        cast(AccountHolding.closed_at, SADate) > as_of_date,
                    ),
                ),
            )
        query = query.order_by(AccountHolding.as_of.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, entity: AccountHolding) -> AccountHolding:
        """Update an existing account holding."""
        existing = await self.get_by_id(entity.id)
        if not existing:
            raise HTTPException(status_code=404, detail="Account holding not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(self, id: int) -> bool:  # pylint: disable=redefined-builtin
        """Delete an account holding by its ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def exists(self, holding_id: int) -> bool:
        """Check if an account holding exists."""

        query = select(AccountHolding).filter(AccountHolding.id == holding_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_with_security_by_client_id(
        self,
        client_id: int,
        as_of_date: Optional[dt.date] = None,
    ) -> list[dict]:
        """Get a client's open holdings joined with security details (company name)."""
        filters = [AccountHolding.client_id == client_id]
        if as_of_date is not None:
            filters.extend(
                [
                    cast(AccountHolding.as_of, SADate) <= as_of_date,
                    or_(
                        AccountHolding.closed_at.is_(None),
                        cast(AccountHolding.closed_at, SADate) > as_of_date,
                    ),
                ],
            )
        query = (
            select(AccountHolding, Security)
            .join(Security, AccountHolding.security_id == Security.id)
            .filter(and_(*filters))
            .order_by(AccountHolding.as_of.desc())
        )
        result = await self.db.execute(query)
        return [
            {
                "company_name": security.name,
                "quantity": holding.quantity,
                "cost_basis_total_usd": holding.cost_basis_total_usd,
            }
            for holding, security in result.all()
        ]

    async def get_holding_for_client_and_security(
        self,
        client_id: int,
        security_id: int,
        as_of_date: Optional[dt.date] = None,
    ) -> dict | None:
        """Get a client's holding for a specific security, joined with security details.

        If as_of_date is provided, only returns the holding if the position was open
        on that date (as_of <= date and not yet closed).
        """
        filters = [
            AccountHolding.client_id == client_id,
            AccountHolding.security_id == security_id,
        ]
        if as_of_date is not None:
            filters.extend(
                [
                    cast(AccountHolding.as_of, SADate) <= as_of_date,
                    or_(
                        AccountHolding.closed_at.is_(None),
                        cast(AccountHolding.closed_at, SADate) > as_of_date,
                    ),
                ],
            )
        query = (
            select(AccountHolding, Security)
            .join(Security, AccountHolding.security_id == Security.id)
            .filter(and_(*filters))
        )
        result = await self.db.execute(query)
        row = result.first()

        if not row:
            return {}

        holding, security = row
        return {
            "id": holding.id,
            "security_id": holding.security_id,
            "ticker": security.ticker,
            "company_name": security.name,
            "quantity": holding.quantity,
            "cost_basis_total_usd": holding.cost_basis_total_usd,
        }

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        client_id: int | None = None,
        security_id: int | None = None,
    ) -> tuple[int, list[AccountHolding]]:
        """Get paginated account holdings with optional filtering."""
        base_query = select(AccountHolding)

        # Apply filters
        filters = []
        if client_id:
            filters.append(AccountHolding.client_id == client_id)
        if security_id:
            filters.append(AccountHolding.security_id == security_id)

        if filters:
            base_query = base_query.filter(and_(*filters))

        # Get total count - simplified approach
        if filters:
            total_query = select(AccountHolding).filter(and_(*filters))
        else:
            total_query = select(AccountHolding)

        total_result = await self.db.execute(total_query)
        total = len(list(total_result.scalars().all()))  # Get paginated results
        query = (
            base_query.order_by(AccountHolding.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)
        holdings = list(result.scalars().all())

        return total, holdings

    async def get_total_value_by_client(self, client_id: int) -> float:
        """Calculate total cost basis value for a client's holdings."""
        query = select(AccountHolding.cost_basis_total_usd).filter(
            AccountHolding.client_id == client_id,
        )
        result = await self.db.execute(query)
        values = result.scalars().all()
        return sum(values) if values else 0.0

    async def get_client_portfolio_metrics(
        self,
        client_id: int,
        reference_date,
    ) -> dict:
        """
        Calculate portfolio metrics for a client on a given date.
        Used to populate client_net_worth, client_portfolio_value, client_growth,
        and per-holding current values
        """
        holdings = await self.get_by_client_id(client_id, as_of_date=reference_date)

        if not holdings:
            return {
                "client_portfolio_value": None,
                "client_net_worth": None,
                "client_growth": None,
                "holdings_current_values": {},
            }

        total_current_value = 0.0
        total_cost_basis = 0.0
        holdings_current_values = {}

        for holding in holdings:
            price_query = (
                select(SecurityPrice)
                .filter(SecurityPrice.security_id == holding.security_id)
                .filter(SecurityPrice.price_date <= reference_date)
                .order_by(desc(SecurityPrice.price_date))
                .limit(1)
            )
            price_result = await self.db.execute(price_query)
            latest_price = price_result.scalar_one_or_none()

            current_price = float(latest_price.close) if latest_price else 0.0
            holding_current_value = float(holding.quantity) * current_price
            total_current_value += holding_current_value
            total_cost_basis += float(holding.cost_basis_total_usd)

            holdings_current_values[holding.security_id] = round(
                holding_current_value,
                2,
            )

        total_gain_loss = total_current_value - total_cost_basis
        total_return_percentage = (
            (total_gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0.0
        )

        client_growth = f"{'+' if total_return_percentage >= 0 else ''}{round(total_return_percentage, 1)}%"

        return {
            "client_portfolio_value": round(total_current_value, 2),
            "client_net_worth": round(total_current_value, 2),
            "client_growth": client_growth,
            "holdings_current_values": holdings_current_values,
        }

    async def enrich_client_information_with_metrics(
        self,
        client_information: dict,
        company_id: int,
        reference_date,
    ) -> dict:
        """
        Enrich client_information dict with portfolio metrics and
        pre-computed exposure percentage for a specific company.
        Called before the alert workflow runs so the LLM receives
        accurate values directly in its prompt context.
        """
        portfolio_metrics = await self.get_client_portfolio_metrics(
            client_id=client_information["id"],
            reference_date=reference_date,
        )

        client_information["client_portfolio_value"] = portfolio_metrics[
            "client_portfolio_value"
        ]
        client_information["client_net_worth"] = portfolio_metrics["client_net_worth"]
        client_information["client_growth"] = portfolio_metrics["client_growth"]

        holdings_current_values = portfolio_metrics.get("holdings_current_values", {})
        holding_current_value = holdings_current_values.get(company_id, 0.0)
        total_portfolio_value = portfolio_metrics.get("client_portfolio_value") or 0.0
        client_information["client_exposure_percentage"] = (
            round(min((holding_current_value / total_portfolio_value) * 100, 100.0), 1)
            if total_portfolio_value > 0
            else 0.0
        )

        return client_information
