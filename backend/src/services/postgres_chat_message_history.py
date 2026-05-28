"""
PostgreSQL-backed chat message history using a psycopg3 async connection.

Implements BaseChatMessageHistory from langchain_core, replacing the
deprecated langchain_postgres.PostgresChatMessageHistory.
"""

import json
import re
from collections.abc import Sequence

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, message_to_dict, messages_from_dict

_SAFE_NAME_RE = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


def _validate_table_name(name: str) -> str:
    if not _SAFE_NAME_RE.match(name):
        raise ValueError(f"Unsafe table name: {name!r}")
    return name


class PostgresAsyncChatMessageHistory(BaseChatMessageHistory):
    """
    Chat message history backed by a PostgreSQL table via a psycopg3 async connection.

    Table schema (created by acreate_tables):
        id          BIGSERIAL PRIMARY KEY
        session_id  UUID NOT NULL
        message     JSONB NOT NULL
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

    Each message is serialized with message_to_dict and stored as JSONB.
    Only async methods are supported; sync variants raise NotImplementedError.
    """

    def __init__(self, table_name: str, session_id: str, async_connection) -> None:
        self._table = _validate_table_name(table_name)
        self._session_id = session_id
        self._conn = async_connection

    @classmethod
    async def acreate_tables(cls, conn, table_name: str) -> None:
        """Create the message history table and its index if they do not exist."""
        table = _validate_table_name(table_name)
        await conn.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id          BIGSERIAL PRIMARY KEY,
                session_id  UUID NOT NULL,
                message     JSONB NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """,
        )
        await conn.execute(
            f"CREATE INDEX IF NOT EXISTS {table}_session_id_idx ON {table}(session_id)",
        )

    @property
    def messages(self) -> list[BaseMessage]:
        raise NotImplementedError("Sync access is not supported; use aget_messages().")

    async def aget_messages(self) -> list[BaseMessage]:
        cursor = await self._conn.execute(
            f"SELECT message FROM {self._table} WHERE session_id = %s ORDER BY id",
            [self._session_id],
        )
        rows = await cursor.fetchall()
        return messages_from_dict([row[0] for row in rows])

    def add_messages(self, messages: Sequence[BaseMessage]) -> None:
        raise NotImplementedError("Sync access is not supported; use aadd_messages().")

    async def aadd_messages(self, messages: Sequence[BaseMessage]) -> None:
        for message in messages:
            await self._conn.execute(
                f"INSERT INTO {self._table} (session_id, message) VALUES (%s, %s::jsonb)",
                [self._session_id, json.dumps(message_to_dict(message))],
            )

    def clear(self) -> None:
        raise NotImplementedError("Sync access is not supported; use aclear().")

    async def aclear(self) -> None:
        await self._conn.execute(
            f"DELETE FROM {self._table} WHERE session_id = %s",
            [self._session_id],
        )
