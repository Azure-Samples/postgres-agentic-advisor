"""
mem0 memory service for advisor-client preference storage and retrieval.

Each advisor-client pair gets its own isolated memory namespace so that
preferences captured in chat ("Xavier prefers large-cap stocks") are scoped
to the specific advisor who set them and the specific client they concern.

Namespace convention:  "advisor_{advisor_id}_client_{client_id}"

Core operations:
  - save_preference    → write (mem0 LLM extracts discrete facts from raw text)
  - fetch_preferences  → read (semantic search returns relevant stored facts)
  - fetch_risk_profile → read the single stored "Risk Profile: <label>" entry
"""

from mem0 import AsyncMemory
from src.configs.config import settings


def get_mem0_memory() -> AsyncMemory:
    """
    Return a fresh AsyncMemory instance. Stateless — safe to call per request.

    Returns:
        AsyncMemory backed by the pgdiskann table in settings.
    """
    return AsyncMemory(config=settings.get_mem0_memory_config())


async def _find_existing_risk_profile(memory: AsyncMemory, user_id: str) -> dict | None:
    """
    Return the first stored mem0 entry whose text starts with 'Risk Profile:',
    or None if no such entry exists yet.
    """
    all_memories = await memory.get_all(filters={"user_id": user_id})
    return next(
        (
            item
            for item in all_memories.get("results", [])
            if item.get("memory", "").startswith("Risk Profile:")
        ),
        None,
    )


async def save_preference(
    memory: AsyncMemory,
    advisor_id: int,
    client_id: int,
    message: str,
) -> dict:
    """
    Store a raw advisor message in mem0 for the given advisor-client pair.
    mem0 extracts discrete facts via LLM before persisting.

    Args:
        memory: AsyncMemory instance from get_mem0_memory().
        advisor_id: Advisor's integer ID.
        client_id: Client's integer ID.
        message: Raw natural-language preference, e.g. "Xavier prefers large-cap companies."

    Returns:
        Dict with:
          - "facts": list of fact strings stored by mem0.
          - "changed": True if mem0 added any new facts.
    """
    user_id = f"advisor_{advisor_id}_client_{client_id}"
    results = await memory.add(messages=message, user_id=user_id)
    stored_items = results.get("results", [])
    facts = [
        item.get("memory", "")
        for item in stored_items
        if item.get("memory") and item.get("event") == "ADD"
    ]
    return {"facts": facts, "changed": bool(facts)}


async def fetch_preferences(
    memory: AsyncMemory,
    advisor_id: int,
    client_id: int,
) -> list[str]:
    """
    Retrieve stored investment preferences for the given advisor-client pair via semantic search.

    Args:
        memory: AsyncMemory instance from get_mem0_memory().
        advisor_id: Advisor's integer ID.
        client_id: Client's integer ID.

    Returns:
        List of plain-text preference strings, e.g. ["Client prefers large-cap companies"].
        Empty list if no preferences have been stored yet.
    """
    user_id = f"advisor_{advisor_id}_client_{client_id}"
    search_results = await memory.search(
        query=(
            "Client investment preferences, sector preferences, company size preferences, "
            "risk appetite, asset class preferences, and any specific likes or dislikes "
            "relevant to financial advisory decisions."
        ),
        filters={"user_id": user_id},
        threshold=0.0,
        rerank=True,
    )
    return [
        item.get("memory", "")
        for item in search_results.get("results", [])
        if item.get("memory")
    ]


async def delete_all_preferences(
    memory: AsyncMemory,
    advisor_id: int,
    client_id: int,
) -> bool:
    """
    Delete all stored preferences for the given advisor-client pair.

    Returns True if any preferences existed and were deleted, False if there
    was nothing to delete.

    Args:
        memory: AsyncMemory instance from get_mem0_memory().
        advisor_id: Advisor's integer ID.
        client_id: Client's integer ID.
    """
    user_id = f"advisor_{advisor_id}_client_{client_id}"
    existing = await memory.get_all(filters={"user_id": user_id})
    if not existing.get("results"):
        return False
    await memory.delete_all(user_id=user_id)
    return True


async def fetch_risk_profile(
    memory: AsyncMemory,
    advisor_id: int,
    client_id: int,
) -> str | None:
    """
    Return the stored risk profile label for the given advisor-client pair,
    or None if no risk profile has been saved yet.

    The label is stored as "Risk Profile: <label>" and this function strips
    the prefix, returning only the label (e.g. "Growth Oriented").

    Args:
        memory: AsyncMemory instance from get_mem0_memory().
        advisor_id: Advisor's integer ID.
        client_id: Client's integer ID.

    Returns:
        The risk profile label string (e.g. "Growth Oriented"), or None.
    """
    user_id = f"advisor_{advisor_id}_client_{client_id}"
    existing = await _find_existing_risk_profile(memory, user_id)
    if not existing:
        return None
    return existing["memory"].removeprefix("Risk Profile:").strip()
