import csv
import json
import logging
from pathlib import Path

from fastapi import APIRouter, Request
from sqlalchemy import delete, text
from sqlalchemy.orm.attributes import flag_modified
from src.core.dependencies import DBSession
from src.models.alerts import Alert
from src.models.chat_sessions import ChatSession
from src.repositories.clients import ClientRepository
from src.services.memory_service import delete_all_preferences, get_mem0_memory

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/reset",
    tags=["reset"],
)

_CLIENT_CSV = (
    Path(__file__).parent.parent / "db_setup" / "data" / "seed_data" / "client.csv"
)


def _load_seed_profiles() -> dict[int, dict]:
    """
    Read client.csv and return a mapping of client_id -> original profile dict.
    Used to revert runtime profile changes (risk_preference, has_interactive_preferences)
    back to seed state on reset.
    """
    profiles: dict[int, dict] = {}
    if not _CLIENT_CSV.exists():
        logger.warning("client.csv not found — profile revert will be skipped.")
        return profiles

    with _CLIENT_CSV.open(encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            client_id = int(row["id"])
            raw_profile = row.get("profile", "{}").strip()
            try:
                profile = json.loads(raw_profile) if raw_profile else {}
            except Exception:
                profile = {}
            profiles[client_id] = profile

    return profiles


@router.post("")
async def reset_application(
    db: DBSession,
    request: Request,
):
    """
    Reset all runtime application data.

    Clears:
    - All alerts (suggested_responses and alert_sources cascade automatically)
    - All chat sessions (askai_chat_analysis_cache cascades automatically)
    - All Mem0 advisor-client memories
    - Reverts client profile column back to seed state

    Preserves all seed data:
    - clients, users, securities, security_prices,
      account_holdings, meetings, workflow_triggers
    """

    # Read advisor_id from request state
    advisor_id = getattr(request.state, "user_id", None)
    if not advisor_id:
        advisor_id = int(request.headers.get("x-user-id", 1))

    # Delete all alerts. suggested_response and alert_source cascade automatically.
    await db.execute(delete(Alert))
    logger.info("Cleared all alerts (alert_sources and suggested_responses cascaded)")

    # Delete all chat sessions. askai_chat_analysis_cache cascades automatically.
    await db.execute(delete(ChatSession))
    logger.info("Cleared all chat sessions (askai_chat_analysis_cache cascaded)")

    # Drop LangChain chat message history tables.
    await db.execute(text("DROP TABLE IF EXISTS langchain_pg_message_store"))
    logger.info("Dropped langchain_pg_message_store (if existed)")

    await db.execute(text("DROP TABLE IF EXISTS chat_history"))
    logger.info("Dropped chat_history (if existed)")

    # Revert all client profiles back to seed state.
    try:
        seed_profiles = _load_seed_profiles()
        client_repo = ClientRepository(db)
        clients = await client_repo.get_all()

        for client in clients:
            original_profile = seed_profiles.get(client.id)
            if original_profile is None:
                logger.warning(
                    "No seed profile found for client_id=%d — skipping revert.",
                    client.id,
                )
                continue

            client.profile = original_profile
            flag_modified(client, "profile")
            logger.info(
                "Reverted profile for client_id=%d to seed state: %s",
                client.id,
                original_profile,
            )

    except Exception as exc:
        logger.error("Client profile revert failed (non-fatal): %s", exc)

    # Commit all DB changes together.
    await db.commit()

    # Clear Mem0 memories for all advisor-client pairs.
    try:
        memory = get_mem0_memory()
        client_repo = ClientRepository(db)
        clients = await client_repo.get_all()

        for client in clients:
            deleted = await delete_all_preferences(
                memory=memory,
                advisor_id=advisor_id,
                client_id=client.id,
            )
            if deleted:
                logger.info(
                    "Cleared Mem0 memories for advisor=%d client=%d",
                    advisor_id,
                    client.id,
                )
    except Exception as exc:
        logger.error("Mem0 cleanup failed (non-fatal): %s", exc)

    logger.info("Application reset complete")
    return {"message": "Application reset successful"}
