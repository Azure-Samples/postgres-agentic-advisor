from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased
from src.models.alerts import Alert
from src.models.securities import Security
from src.models.workflow_trigger import WorkflowTrigger

from .base import BaseRepository


class AlertRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: Alert) -> Alert:
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(self, id: int) -> Alert | None:
        result = await self.db.execute(select(Alert).where(Alert.id == id))
        return result.scalar_one_or_none()

    async def update(self, entity: Alert) -> Alert:
        existing = await self.get_by_id(entity.id)
        if not existing:
            return None

        for key, value in entity.__dict__.items():
            if not key.startswith("_") and hasattr(existing, key):
                setattr(existing, key, value)

        await self.db.commit()

        return existing

    async def delete(self, id: int) -> bool:
        existing = await self.get_by_id(id)
        if not existing:
            return False

        await self.db.delete(existing)
        await self.db.commit()
        return True

    async def get_all(self) -> list[Alert]:
        result = await self.db.execute(select(Alert))
        return list(result.scalars().all())

    async def get_all_alerts_in_ui_format(self, date) -> list:
        date_formatted = datetime.strptime(date, "%Y-%m-%d").date()
        TriggerSecurity = aliased(Security)

        result = await self.db.execute(
            select(
                Alert.id,
                Alert.trend,
                Alert.date,
                Alert.client_name,
                Alert.alert_heading_1,
                Alert.alert_heading_2,
                Security.name.label("company_name"),
                Security.description.label("company_description"),
                Security.ticker.label("company_ticker"),
                TriggerSecurity.name.label("trigger_company_name"),
                TriggerSecurity.description.label("trigger_company_description"),
                TriggerSecurity.ticker.label("trigger_company_ticker"),
            )
            .outerjoin(Security, Security.ticker == Alert.ticker)
            .outerjoin(WorkflowTrigger, WorkflowTrigger.id == Alert.trigger_id)
            .outerjoin(
                TriggerSecurity,
                TriggerSecurity.id == WorkflowTrigger.security_id,
            )
            .where(Alert.date == date_formatted)
            .order_by(Alert.created_at.desc()),
        )
        return result.all()

    async def get_view_summary_endpoint_details_by_id(self, alert_id: int):
        result = await self.db.execute(
            select(Alert, WorkflowTrigger, Security)
            .join(WorkflowTrigger, Alert.trigger_id == WorkflowTrigger.id)
            .join(Security, WorkflowTrigger.security_id == Security.id)
            .where(Alert.id == alert_id),
        )
        row = result.one_or_none()
        if row is None:
            return None, None, None
        return row.Alert, row.WorkflowTrigger, row.Security

    async def get_alerts_for_client(self, user_id: int, client_id: int) -> list:
        TriggerSecurity = aliased(Security)

        result = await self.db.execute(
            select(
                Alert.id,
                Alert.trend,
                Alert.date,
                Alert.client_name,
                Alert.alert_heading_1,
                Alert.alert_heading_2,
                Security.name.label("company_name"),
                Security.description.label("company_description"),
                Security.ticker.label("company_ticker"),
                TriggerSecurity.name.label("trigger_company_name"),
                TriggerSecurity.description.label("trigger_company_description"),
                TriggerSecurity.ticker.label("trigger_company_ticker"),
            )
            .outerjoin(Security, Security.ticker == Alert.ticker)
            .outerjoin(WorkflowTrigger, WorkflowTrigger.id == Alert.trigger_id)
            .outerjoin(
                TriggerSecurity,
                TriggerSecurity.id == WorkflowTrigger.security_id,
            )
            .where((Alert.client_id == client_id) & (Alert.user_id == user_id))
            .order_by(Alert.created_at.desc()),
        )
        return result.all()

    async def exists_for_trigger_client(
        self,
        trigger_id: int,
        client_id: int,
        ticker: str,
    ) -> bool:
        result = await self.db.execute(
            select(Alert.id)
            .where(
                (Alert.trigger_id == trigger_id)
                & (Alert.client_id == client_id)
                & (Alert.ticker == ticker),
            )
            .limit(1),
        )
        return result.scalar_one_or_none() is not None

    async def get_by_trigger_client_ticker(
        self,
        trigger_id: int,
        client_id: int,
        ticker: str,
    ) -> Alert | None:
        """Return the alert for a (trigger_id, client_id, ticker) triplet, or None."""
        result = await self.db.execute(
            select(Alert)
            .where(
                (Alert.trigger_id == trigger_id)
                & (Alert.client_id == client_id)
                & (Alert.ticker == ticker),
            )
            .limit(1),
        )
        return result.scalar_one_or_none()

    async def mark_outdated_for_client(self, client_id: int) -> int:
        """
        Set 'is_outdated = True' for all alerts belonging to a client.
        Called whenever the advisor updates mem0 preferences so that the next
        chat-triggered alert generation re-runs the workflow with fresh preferences.

        Returns the number of rows updated.
        """
        result = await self.db.execute(
            update(Alert).where(Alert.client_id == client_id).values(is_outdated=True),
        )
        await self.db.commit()
        return result.rowcount
