from collections import defaultdict

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.alert_sources import AlertSource

from .base import BaseRepository


class AlertSourceRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, entity: AlertSource) -> AlertSource:
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(self, id: int) -> AlertSource | None:
        result = await self.db.execute(
            select(AlertSource).where(AlertSource.id == id),
        )
        return result.scalar_one_or_none()

    async def update(self, entity: AlertSource) -> AlertSource:
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

    async def get_all(self) -> list[AlertSource]:
        result = await self.db.execute(select(AlertSource))
        return list(result.scalars().all())

    async def get_by_alert_and_source(
        self,
        alert_id: int,
        source_id: str,
    ) -> AlertSource | None:
        """Fetch a single source row by its (alert_id, source_id) cache key."""
        result = await self.db.execute(
            select(AlertSource).where(
                AlertSource.alert_id == alert_id,
                AlertSource.source_id == source_id,
            ),
        )
        return result.scalar_one_or_none()

    async def delete_by_alert(self, alert_id: int) -> None:
        """Delete all source rows for a given alert (used on alert overwrite)."""
        await self.db.execute(
            delete(AlertSource).where(AlertSource.alert_id == alert_id),
        )
        await self.db.commit()

    async def bulk_insert(self, rows: list[AlertSource]) -> None:
        """Insert multiple source rows in a single transaction."""
        for row in rows:
            self.db.add(row)
        await self.db.commit()

    @staticmethod
    def build_from_docs(
        news_docs: list,
        sec_docs: list,
        news_reference_sentences: list[str] | None = None,
        sec_reference_sentences: list[str] | None = None,
    ) -> list[AlertSource]:
        """
        Convert retrieved LangChain Document lists into AlertSource model rows.
        One row per unique source document, grouped by news_article_id / sec_file_id.
        alert_id is not set here — assigned after the alert row is committed.
        """
        rows: list[AlertSource] = []

        news_groups: dict[str, list] = defaultdict(list)
        for doc in news_docs or []:
            key = str(doc.metadata.get("news_article_id", ""))
            if key:
                news_groups[key].append(doc)

        for article_id, docs in news_groups.items():
            rows.append(
                AlertSource(
                    source_id=article_id,
                    source_type="news",
                    source_title=docs[0].metadata.get("title", ""),
                    chunk_texts=[doc.page_content for doc in docs],
                    source_file_path=docs[0].metadata.get("markdown_path") or None,
                    reference_sentences=news_reference_sentences or [],
                    reporting_company=docs[0].metadata.get("reporting_company") or None,
                ),
            )

        sec_groups: dict[str, list] = defaultdict(list)
        for doc in sec_docs or []:
            key = str(doc.metadata.get("sec_file_id", ""))
            if key:
                sec_groups[key].append(doc)

        for filing_id, docs in sec_groups.items():
            rows.append(
                AlertSource(
                    source_id=filing_id,
                    source_type="sec_filing",
                    source_title=docs[0].metadata.get("title", ""),
                    chunk_texts=[doc.page_content for doc in docs],
                    source_file_path=docs[0].metadata.get("markdown_path") or None,
                    reference_sentences=sec_reference_sentences or [],
                    reporting_company="SEC_10K",
                ),
            )

        return rows
