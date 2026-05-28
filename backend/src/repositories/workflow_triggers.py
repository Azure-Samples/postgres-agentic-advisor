from datetime import date as date_type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.workflow_trigger import WorkflowTrigger


class WorkflowTriggerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_date_range(
        self,
        start_date: str,
        end_date: str,
    ) -> list[WorkflowTrigger]:
        """
        Return all workflow triggers between start_date and end_date (inclusive).

        Args:
            start_date: Start date in 'YYYY-MM-DD' format.
            end_date: End date in 'YYYY-MM-DD' format.
        """
        start = date_type.fromisoformat(start_date)
        end = date_type.fromisoformat(end_date)
        result = await self.db.execute(
            select(WorkflowTrigger).where(
                WorkflowTrigger.date >= start,
                WorkflowTrigger.date <= end,
            ),
        )
        return list(result.scalars().all())

    async def get_latest_by_security_id(
        self,
        security_id: int,
    ) -> WorkflowTrigger | None:
        """
        Return the most recent workflow trigger for a given security.

        Args:
            security_id: The security ID to look up.
        """
        result = await self.db.execute(
            select(WorkflowTrigger)
            .where(WorkflowTrigger.security_id == security_id)
            .order_by(WorkflowTrigger.date.desc())
            .limit(1),
        )
        return result.scalar_one_or_none()

    async def get_by_date(self, date: str) -> list[WorkflowTrigger]:
        """
        Return all workflow triggers for a given date.

        Args:
            date: The date string in 'YYYY-MM-DD' format.

        Returns:
            List of WorkflowTrigger ORM objects for that date.
        """
        parsed_date = date_type.fromisoformat(date)
        result = await self.db.execute(
            select(WorkflowTrigger).where(WorkflowTrigger.date == parsed_date),
        )
        return list(result.scalars().all())
