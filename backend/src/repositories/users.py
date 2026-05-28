from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.models.users import User
from src.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: User) -> User:
        """Add a new user to the repository."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(
        self,
        id: int,
    ) -> User | None:  # pylint: disable=redefined-builtin
        """Retrieve a user by its ID."""
        query = select(User).filter(User.id == id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update(self, entity: User) -> User:
        """Update an existing user."""
        existing = await self.get_by_id(entity.id)
        if not existing:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()
        return existing

    async def delete(self, id: int) -> bool:  # pylint: disable=redefined-builtin
        """Delete a user by its ID."""
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def get_by_email(self, email: str) -> User | None:
        """Get a user by email address."""
        query = select(User).filter(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def search_by_name_or_email(self, search_term: str) -> list[User]:
        """Search users by name or email."""
        search_pattern = f"%{search_term}%"
        query = (
            select(User)
            .filter(
                or_(
                    User.full_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                ),
            )
            .order_by(User.full_name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_paginated(self, page: int, page_size: int) -> tuple[int, list[User]]:
        """Get paginated users."""
        base_query = select(User)

        # Get total count
        total_result = await self.db.execute(base_query)
        total = len(list(total_result.scalars().all()))

        # Get paginated results
        query = (
            base_query.order_by(User.full_name)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)
        users = list(result.scalars().all())

        return total, users

    async def exists(self, user_id: int) -> bool:
        """Check if a user exists."""
        query = select(User).filter(User.id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def email_exists(self, email: str, exclude_id: int | None = None) -> bool:
        """Check if an email address is already in use."""
        query = select(User).filter(User.email == email)
        if exclude_id:
            query = query.filter(User.id != exclude_id)

        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def get_all(self) -> list[User]:
        """Get all users."""
        query = select(User).order_by(User.full_name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_advisors_with_clients_count(self) -> list[dict]:
        """Get all advisor users with their client count."""
        query = (
            select(User).options(selectinload(User.clients)).order_by(User.full_name)
        )

        result = await self.db.execute(query)
        users = result.scalars().all()

        return [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at,
                "client_count": len(user.clients),
            }
            for user in users
        ]

    async def get_user_json_by_id(self, user_id: int) -> dict | None:
        """Get user information in JSON format by user ID."""
        query = select(User).filter(User.id == user_id)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if user:
            return {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
            }

        return None
