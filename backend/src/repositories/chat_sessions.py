from __future__ import annotations

import uuid as uuid_module

from sqlalchemy import func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.chat_sessions import ChatSession
from src.models.clients import Client
from src.repositories.base import BaseRepository


class ChatSessionRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # BaseRepository abstract method implementations (UUID PK)
    # ------------------------------------------------------------------

    async def add(self, entity: ChatSession) -> ChatSession:
        """Add a new ChatSession entity directly."""
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(self, id: uuid_module.UUID) -> ChatSession | None:
        """Retrieve a ChatSession by its UUID primary key."""
        result = await self.db.execute(
            select(ChatSession).where(ChatSession.id == id),
        )
        return result.scalar_one_or_none()

    async def update(self, entity: ChatSession) -> ChatSession:
        """Persist changes to an existing ChatSession entity."""
        existing = await self.get_by_id(entity.id)
        if not existing:
            raise Exception("ChatSession not found.")
        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)
        await self.db.commit()
        return existing

    async def delete(self, id: uuid_module.UUID) -> bool:
        """Delete a ChatSession by its UUID primary key. Returns True if deleted."""
        existing = await self.get_by_id(id)
        if not existing:
            return False
        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def create(self, advisor_id: int, client_id: int) -> int:
        """
        Atomically create a new chat session with the next sequential chat_session_id
        for the given advisor-client pair.

        Returns:
            The newly created chat_session_id integer.
        """
        next_id_subquery = (
            select(func.coalesce(func.max(ChatSession.chat_session_id), 0) + 1)
            .where(ChatSession.advisor_id == advisor_id)
            .where(ChatSession.client_id == client_id)
            .scalar_subquery()
        )
        stmt = (
            insert(ChatSession)
            .values(
                advisor_id=advisor_id,
                client_id=client_id,
                chat_session_id=next_id_subquery,
            )
            .returning(ChatSession.chat_session_id)
        )
        result = await self.db.execute(stmt)
        new_id = result.scalar()
        await self.db.commit()
        return new_id

    async def get_uuid(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
    ) -> str:
        """
        Return the UUID (as string) of a chat session row.

        Raises:
            Exception: If no matching session exists.
        """
        result = await self.db.execute(
            select(ChatSession.id).where(
                ChatSession.advisor_id == advisor_id,
                ChatSession.client_id == client_id,
                ChatSession.chat_session_id == chat_session_id,
            ),
        )
        row = result.scalar_one_or_none()
        if not row:
            raise Exception("No chat session found for this advisor-client pair.")
        return str(row)

    async def get_chat_title(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
    ) -> str | None:
        """Return the chat_title for a session, or None if not set."""
        result = await self.db.execute(
            select(ChatSession.chat_title).where(
                ChatSession.advisor_id == advisor_id,
                ChatSession.client_id == client_id,
                ChatSession.chat_session_id == chat_session_id,
            ),
        )
        return result.scalar_one_or_none()

    async def update_title(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        new_title: str,
    ) -> None:
        """
        Update the chat_title for a session.

        Raises:
            Exception: If no matching session exists.
        """
        result = await self.db.execute(
            ChatSession.__table__.update()
            .where(
                ChatSession.advisor_id == advisor_id,
                ChatSession.client_id == client_id,
                ChatSession.chat_session_id == chat_session_id,
            )
            .values(chat_title=new_title)
            .returning(ChatSession.chat_session_id),
        )
        if result.scalar_one_or_none() is None:
            raise Exception("No chat session found for this advisor-client pair.")
        await self.db.commit()

    async def get_all_for_advisor(self, advisor_id: int) -> list[dict]:
        """
        Return all chat sessions for an advisor, joined with client name, ordered newest first.
        """
        result = await self.db.execute(
            select(
                ChatSession.client_id,
                ChatSession.chat_session_id,
                ChatSession.chat_title,
                Client.full_name,
            )
            .join(Client, ChatSession.client_id == Client.id)
            .where(ChatSession.advisor_id == advisor_id)
            .order_by(ChatSession.created_at.desc()),
        )
        return [
            {
                "client_id": row[0],
                "chat_session_id": row[1],
                "chat_title": row[2] or "",
                "client_name": row[3] or "",
            }
            for row in result.all()
        ]

    async def get_titles(self, advisor_id: int, client_id: int) -> list[dict]:
        """Return all chat titles for a specific advisor-client pair."""
        result = await self.db.execute(
            select(
                ChatSession.chat_session_id,
                ChatSession.chat_title,
                ChatSession.created_at,
            )
            .where(
                ChatSession.advisor_id == advisor_id,
                ChatSession.client_id == client_id,
            )
            .order_by(ChatSession.chat_session_id.desc()),
        )
        return [
            {
                "chat_session_id": row[0],
                "chat_title": row[1] or "",
                "date": row[2].strftime("%Y-%m-%d %H:%M:%S") if row[2] else "",
            }
            for row in result.all()
        ]

    async def delete_session(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
    ) -> None:
        """Delete a chat session row by its composite business key."""
        await self.db.execute(
            ChatSession.__table__.delete().where(
                ChatSession.advisor_id == advisor_id,
                ChatSession.client_id == client_id,
                ChatSession.chat_session_id == chat_session_id,
            ),
        )
        await self.db.commit()
