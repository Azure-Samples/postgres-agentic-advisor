"""
Standalone entry-point for database setup.

Invoked from startup.sh before the uvicorn server starts:

    python -m src.db_setup.setup.py

This runs every setup step exactly once, regardless of how many uvicorn
workers will later be launched.
"""

import asyncio
import logging

from src.database import create_database_manager
from src.db_setup.extensions import setup_extensions
from src.db_setup.load_graph import run_pipeline
from src.db_setup.schema import setup_schema
from src.db_setup.seed_data import seed_data
from src.db_setup.seed_mem0 import seed_mem0_preferences
from src.db_setup.vector_stores import setup_vector_stores

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def main() -> None:
    db_manager = create_database_manager()
    engine = db_manager.init_db_session().engine
    db_url = db_manager.get_sync_database_url_with_token()
    try:
        logger.info("=== db_setup: starting ===")

        logger.info("Step 1/6 — extensions")
        await setup_extensions(engine)

        logger.info("Step 2/6 — schema")
        await setup_schema(engine)

        logger.info("Step 3/6 — seed data")
        await seed_data(engine)

        logger.info("Step 4/6 — vector stores")
        await setup_vector_stores(engine, db_url=db_url)

        logger.info("Step 5/6 — mem0 advisor-client preferences")
        await seed_mem0_preferences()

        logger.info("Step 6/6 — news graph pipeline")
        await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: run_pipeline(),
        )

        logger.info("=== db_setup: complete ===")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
