"""
Step 3 — Seed data.

Loads CSV files from data/seed_data/ and bulk-inserts rows into the
corresponding tables.  The function is idempotent: if the `user` table
already contains rows the step is skipped.
"""

import csv
import json
import logging
from datetime import date, datetime
from pathlib import Path

import src.models  # noqa: F401 — ensures all ORM models are registered on Base.metadata
from sqlalchemy import Boolean, Date, DateTime, Integer, Numeric, insert, text
from sqlalchemy.ext.asyncio import AsyncEngine
from src.models.base import Base

logger = logging.getLogger(__name__)

# Ordered to respect foreign-key dependencies
_TABLE_NAMES = [
    "user",
    "client",
    "security",
    "security_price",
    "account_holding",
    "workflow_trigger",
    "meeting",
]

_SEED_DIR = Path(__file__).parent / "data" / "seed_data"


async def seed_data(engine: AsyncEngine) -> None:
    """Insert seed rows from CSV files if the database is empty."""
    if await _is_already_seeded(engine):
        logger.info("Seed data already present — skipping.")
        return

    for table_name in _TABLE_NAMES:
        logger.info("Seeding table: %s", table_name)
        table = Base.metadata.tables.get(table_name)
        if table is None:
            logger.warning("Table %r not found in metadata — skipping.", table_name)
            continue

        rows = _load_csv(table_name)
        if not rows:
            logger.warning("No rows found for table %r — skipping.", table_name)
            continue

        async with engine.begin() as conn:
            await conn.execute(insert(table).values(rows))

        logger.info("Inserted %d rows into %r.", len(rows), table_name)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _is_already_seeded(engine: AsyncEngine) -> bool:
    """Return True when the `user` table already has at least one row."""
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1 FROM public.user LIMIT 1"))
        return result.first() is not None


def _load_csv(table_name: str) -> list[dict]:
    file_path = _SEED_DIR / f"{table_name}.csv"
    table = Base.metadata.tables.get(table_name)
    with file_path.open(encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    return [_coerce_row(_clean_row(_parse_json_fields(row)), table) for row in rows]


def _parse_json_fields(row: dict) -> dict:
    """Parse any string values that look like JSON objects."""
    for key, value in row.items():
        if (
            isinstance(value, str)
            and value.strip().startswith("{")
            and value.strip().endswith("}")
        ):
            try:
                row[key] = json.loads(value)
            except Exception:
                pass
    return row


def _clean_row(row: dict) -> dict:
    """Convert empty strings to None for every field."""
    return {k: (None if v == "" else v) for k, v in row.items()}


def _coerce_row(row: dict, table) -> dict:
    """Cast string values from CSV to the correct Python type based on column definitions."""
    if table is None:
        return row
    result = {}
    for key, value in row.items():
        if value is None:
            result[key] = value
            continue
        col = table.c.get(key)
        if col is None:
            result[key] = value
            continue
        col_type = type(col.type)
        try:
            if issubclass(col_type, Integer):
                result[key] = int(value)
            elif issubclass(col_type, Numeric):
                result[key] = float(value)
            elif issubclass(col_type, Boolean):
                result[key] = (
                    value
                    if isinstance(value, bool)
                    else str(value).lower() in ("1", "true", "yes")
                )
            elif issubclass(col_type, DateTime):
                result[key] = datetime.fromisoformat(value)
            elif issubclass(col_type, Date):
                result[key] = date.fromisoformat(value)
            else:
                result[key] = value
        except (ValueError, TypeError):
            result[key] = value
    return result
