"""
Step 6 — Seed advisor-client preferences into mem0.

Reads advisor_client_preferences.csv and stores each preference string
into the mem0 pgdiskann table under the correct advisor-client namespace.
Idempotent: mem0 deduplicates facts internally via its LLM extraction step,
so re-running will not create exact duplicates.
"""

import csv
import logging
from pathlib import Path

from src.services.memory_service import fetch_preferences, get_mem0_memory

logger = logging.getLogger(__name__)

_PREFERENCES_CSV = (
    Path(__file__).parent / "data" / "seed_data" / "advisor_client_preferences.csv"
)


async def seed_mem0_preferences() -> None:
    """Read the preferences CSV and store each row in mem0."""
    if not _PREFERENCES_CSV.exists():
        logger.warning("advisor_client_preferences.csv not found — skipping mem0 seed.")
        return

    memory = get_mem0_memory()

    rows = list(csv.DictReader(_PREFERENCES_CSV.open(encoding="utf-8")))
    if not rows:
        logger.warning("advisor_client_preferences.csv is empty — skipping mem0 seed.")
        return

    # Check if preferences are already seeded for the first advisor-client pair
    first = rows[0]
    existing = await fetch_preferences(
        memory=memory,
        advisor_id=int(first["advisor_id"]),
        client_id=int(first["client_id"]),
    )
    if existing:
        logger.info("mem0 preferences already seeded — skipping.")
        return

    total = 0
    for row in rows:
        advisor_id = int(row["advisor_id"])
        client_id = int(row["client_id"])
        preference = row["preference"].strip()
        if not preference:
            continue

        user_id = f"advisor_{advisor_id}_client_{client_id}"
        result = await memory.add(messages=preference, user_id=user_id)
        stored = result.get("results", [])
        total += len(stored)
        logger.info(
            "Seeded %d fact(s) for advisor=%d client=%d: %r",
            len(stored),
            advisor_id,
            client_id,
            preference[:60],
        )

    logger.info("mem0 seed complete — %d total facts stored.", total)
