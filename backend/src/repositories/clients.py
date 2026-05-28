from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.inspection import inspect
from sqlalchemy.orm.attributes import flag_modified
from src.models.clients import Client
from src.repositories.base import BaseRepository


class ClientRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: Client) -> Client:
        """Add a new client to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: int,
    ) -> Client:  # pylint: disable=redefined-builtin
        """Retrieve a client by its ID."""
        query = select(Client).filter(Client.id == id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Client]:
        """Get all clients."""
        query = select(Client).order_by(Client.full_name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_advisor(self, advisor_id: int) -> list[Client]:
        """Get all clients for a specific advisor."""
        query = (
            select(Client)
            .filter(Client.primary_advisor_id == advisor_id)
            .order_by(Client.full_name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, entity: Client) -> Client:
        """Update an existing client."""
        existing = await self.get_by_id(entity.id)
        if not existing:
            raise HTTPException(status_code=404, detail="Client not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(self, id: int) -> bool:  # pylint: disable=redefined-builtin
        """Delete a client by its ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def exists(self, client_id: int) -> bool:
        """Check if a client exists."""
        query = select(Client).filter(Client.id == client_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        advisor_id: int | None = None,
        risk_profile: str | None = None,
    ) -> tuple[int, list[Client]]:
        """Get paginated clients with optional filtering."""
        base_query = select(Client)

        # Apply filters
        filters = []
        if advisor_id:
            filters.append(Client.primary_advisor_id == advisor_id)
        if risk_profile:
            filters.append(
                Client.profile["risk_preference"].astext.ilike(risk_profile.lower()),
            )

        if filters:
            base_query = base_query.filter(and_(*filters))

        # Get total count
        total_query = base_query
        total_result = await self.db.execute(total_query)
        total = len(list(total_result.scalars().all()))

        # Get paginated results
        query = (
            base_query.order_by(Client.full_name)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)
        clients = list(result.scalars().all())

        return total, clients

    async def search_by_name_or_email(self, search_term: str) -> list[Client]:
        """Search clients by name or email."""
        search_pattern = f"%{search_term}%"
        query = (
            select(Client)
            .filter(
                or_(
                    Client.full_name.ilike(search_pattern),
                    Client.email.ilike(search_pattern),
                ),
            )
            .order_by(Client.full_name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_risk_profile(self, client_id: int, label: str | None) -> None:
        """Set or clear the risk_preference key inside the client's profile JSONB column."""
        client = await self.get_by_id(client_id)
        if not client:
            return
        profile = dict(client.profile or {})
        if label is None:
            profile.pop("risk_preference", None)
        else:
            profile["risk_preference"] = label
        client.profile = profile
        flag_modified(client, "profile")
        await self.db.commit()

    async def set_has_interactive_preferences(
        self,
        client_id: int,
        value: bool,
    ) -> None:
        """
        Set or clear the has_interactive_preferences flag in the client's profile JSONB.

        True  — an advisor has actively saved preferences via chat for this client.
        False — all preferences have been cleared; only seeded data (if any) remains.

        This flag is used at alert generation time to stamp mem0_used on the alert,
        distinguishing alerts personalised by real advisor input from those that ran
        with seed-only or no preferences.
        """
        client = await self.get_by_id(client_id)
        if not client:
            return
        profile = dict(client.profile or {})
        profile["has_interactive_preferences"] = value
        client.profile = profile
        flag_modified(client, "profile")
        await self.db.commit()

    async def get_client_json_by_id(self, client_id: int) -> Dict[str, Any]:
        """Return full client ORM fields as JSON-friendly dict."""

        client = await self.get_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        data = {
            c.key: getattr(client, c.key) for c in inspect(client).mapper.column_attrs
        }
        return data
