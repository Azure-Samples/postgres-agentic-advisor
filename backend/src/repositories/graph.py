from __future__ import annotations

import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from src.configs.config import settings

logger = logging.getLogger(__name__)

GRAPH_NAME = settings.GRAPH_NAME


class GraphRepository:
    """
    Repository for querying the Apache AGE supply chain property graph.

    Uses the raw asyncpg connection directly to avoid SQLAlchemy's query
    pre-processing, which mis-parses Cypher label syntax (:Company, :SUPPLIES)
    as named bind parameters, and which wraps queries in transactions that
    get poisoned when AGE raises an error.

    The graph models upstream supplier relationships between companies:
        NXMG -[:SUPPLIES]-> CSYC -[:SUPPLIES]-> VMTC
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_upstream_chain(self, trigger_security_id: int) -> list[dict]:
        """
        Given a trigger company's security_id, return all upstream companies
        (suppliers) that are indirectly exposed, with their chain path.

        Example: trigger_security_id=5 (VMTC) returns:
            [
                {
                    "security_id": 4,
                    "ticker": "CSYC",
                    "name": "Crestline Systems",
                    "description": "chip fabrication equipment manufacturer",
                    "depth": 1,
                    "chain_tickers": ["VMTC", "CSYC"],
                },
                {
                    "security_id": 3,
                    "ticker": "NXMG",
                    "name": "Nexivus Materials",
                    "description": "raw materials supplier",
                    "depth": 2,
                    "chain_tickers": ["VMTC", "CSYC", "NXMG"],
                },
            ]

        Returns [] if no upstream chain exists for this company.
        """
        conn = await self._raw_conn()

        trigger_ticker = await self._get_ticker_by_security_id_raw(
            conn,
            trigger_security_id,
        )
        if not trigger_ticker:
            logger.info(
                f"No Company node found in supply_chain graph for security_id={trigger_security_id}",
            )
            return []

        # No ORDER BY inside Cypher — AGE on Azure cannot resolve Cypher aliases
        # in the outer SQL ORDER BY clause. Sort in Python instead.
        sql = f"""
            SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
                MATCH path = (trigger:Company {{ticker: '{trigger_ticker}'}})<-[:SUPPLIES_TO*]-(upstream:Company)
                RETURN
                    upstream.security_id   AS security_id,
                    upstream.ticker        AS ticker,
                    upstream.name          AS name,
                    upstream.description   AS description,
                    length(path)           AS depth
            $$) AS (
                security_id   ag_catalog.agtype,
                ticker        ag_catalog.agtype,
                name          ag_catalog.agtype,
                description   ag_catalog.agtype,
                depth         ag_catalog.agtype
            );
        """

        try:
            rows = await conn.fetch(sql)
        except Exception as e:
            logger.error(f"GraphRepository.get_upstream_chain failed: {e}")
            return []

        chain = []
        for row in rows:
            chain.append(
                {
                    "security_id": self._parse_agtype(row[0]),
                    "ticker": self._parse_agtype(row[1]),
                    "name": self._parse_agtype(row[2]),
                    "description": self._parse_agtype(row[3]),
                    "depth": self._parse_agtype(row[4]),
                    "chain_tickers": None,  # filled below
                },
            )

        chain.sort(key=lambda n: n["depth"] or 0)

        # Build chain_tickers in Python:
        # depth=1 → [trigger, d1], depth=2 → [trigger, d1, d2], etc.
        ticker_by_depth = {node["depth"]: node["ticker"] for node in chain}
        name_by_depth = {node["depth"]: node["name"] for node in chain}
        trigger_name = await self._get_name_by_ticker_raw(conn, trigger_ticker)
        for node in chain:
            d = node["depth"]
            node["chain_tickers"] = [trigger_ticker] + [
                ticker_by_depth[i] for i in range(1, d + 1) if i in ticker_by_depth
            ]
            node["chain_names"] = [trigger_name or trigger_ticker] + [
                name_by_depth[i] for i in range(1, d + 1) if i in name_by_depth
            ]

        return chain

    async def get_downstream_chain(self, trigger_security_id: int) -> list[dict]:
        """
        Given a trigger company's security_id, return all downstream companies
        (customers) that are indirectly exposed, with their chain path.

        Example: trigger_security_id=5 (VMTC/Micron) returns:
            [
                {
                    "security_id": 6,
                    "ticker": "CCSC",
                    "name": "Contoso Compute Solutions",
                    "description": "AI compute hardware provider",
                    "depth": 1,
                    "chain_tickers": ["VMTC", "CCSC"],
                },
            ]

        Returns [] if no downstream chain exists for this company.
        """
        conn = await self._raw_conn()

        trigger_ticker = await self._get_ticker_by_security_id_raw(
            conn,
            trigger_security_id,
        )
        if not trigger_ticker:
            logger.info(
                f"No Company node found in supply_chain graph for security_id={trigger_security_id}",
            )
            return []

        sql = f"""
            SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
                MATCH path = (trigger:Company {{ticker: '{trigger_ticker}'}})-[:SUPPLIES_TO*]->(downstream:Company)
                RETURN
                    downstream.security_id   AS security_id,
                    downstream.ticker        AS ticker,
                    downstream.name          AS name,
                    downstream.description   AS description,
                    length(path)             AS depth
            $$) AS (
                security_id   ag_catalog.agtype,
                ticker        ag_catalog.agtype,
                name          ag_catalog.agtype,
                description   ag_catalog.agtype,
                depth         ag_catalog.agtype
            );
        """

        try:
            rows = await conn.fetch(sql)
        except Exception as e:
            logger.error(f"GraphRepository.get_downstream_chain failed: {e}")
            return []

        chain = []
        for row in rows:
            chain.append(
                {
                    "security_id": self._parse_agtype(row[0]),
                    "ticker": self._parse_agtype(row[1]),
                    "name": self._parse_agtype(row[2]),
                    "description": self._parse_agtype(row[3]),
                    "depth": self._parse_agtype(row[4]),
                    "chain_tickers": None,
                },
            )

        chain.sort(key=lambda n: n["depth"] or 0)

        ticker_by_depth = {node["depth"]: node["ticker"] for node in chain}
        name_by_depth = {node["depth"]: node["name"] for node in chain}
        trigger_name = await self._get_name_by_ticker_raw(conn, trigger_ticker)
        for node in chain:
            d = node["depth"]
            node["chain_tickers"] = [trigger_ticker] + [
                ticker_by_depth[i] for i in range(1, d + 1) if i in ticker_by_depth
            ]
            node["chain_names"] = [trigger_name or trigger_ticker] + [
                name_by_depth[i] for i in range(1, d + 1) if i in name_by_depth
            ]

        return chain

    async def get_companies_and_relationships_for_chain(
        self,
        chain_names: list[str],
    ) -> dict:
        """
        Return only edges where at least one endpoint is a chain company,
        plus the nodes that appear in those edges.

        This gives the a→b→c path nodes and their direct neighbours only,
        keeping the frontend graph readable.

        chain_names must be full company names (supply_chain_path stores names,
        not tickers).
        """
        if not chain_names:
            return {"nodes": [], "edges": []}

        conn = await self._raw_conn()

        # Cypher list literal of company names
        name_list = "[" + ", ".join(f"'{n}'" for n in chain_names) + "]"

        sql = f"""
            SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
                MATCH (a:Company)-[r]->(b:Company)
                WHERE a.name IN {name_list} OR b.name IN {name_list}
                RETURN
                    a.ticker      AS source_ticker,
                    a.name        AS source_name,
                    a.description AS source_description,
                    a.security_id AS source_security_id,
                    b.ticker      AS target_ticker,
                    b.name        AS target_name,
                    b.description AS target_description,
                    b.security_id AS target_security_id,
                    type(r)       AS rel_type
            $$) AS (
                source_ticker      ag_catalog.agtype,
                source_name        ag_catalog.agtype,
                source_description ag_catalog.agtype,
                source_security_id ag_catalog.agtype,
                target_ticker      ag_catalog.agtype,
                target_name        ag_catalog.agtype,
                target_description ag_catalog.agtype,
                target_security_id ag_catalog.agtype,
                rel_type           ag_catalog.agtype
            );
        """

        try:
            rows = await conn.fetch(sql)
        except Exception as e:
            logger.error(
                f"GraphRepository.get_companies_and_relationships_for_chain failed: {e}",
            )
            return {"nodes": [], "edges": []}

        seen_nodes: set[str] = set()
        nodes: list[dict] = []
        edges: list[dict] = []
        node_props: dict[str, dict] = {}

        def _register_node(key: str, description: str | None) -> None:
            if key not in seen_nodes:
                seen_nodes.add(key)
                node_props[key] = {"name": key, "description": description}
                nodes.append(node_props[key])
            elif description and not node_props.get(key, {}).get("description"):
                node_props[key]["description"] = description

        for row in rows:
            source_name = self._parse_agtype(row[1])
            source_ticker = self._parse_agtype(row[0])
            source_desc = self._parse_agtype(row[2])
            source_sec_id = self._parse_agtype(row[3])
            target_name = self._parse_agtype(row[5])
            target_ticker = self._parse_agtype(row[4])
            target_desc = self._parse_agtype(row[6])
            target_sec_id = self._parse_agtype(row[7])
            rel_type = self._parse_agtype(row[8])

            source_key = (
                source_name
                or source_ticker
                or (
                    f"security_id:{source_sec_id}"
                    if source_sec_id is not None
                    else None
                )
            )
            target_key = (
                target_name
                or target_ticker
                or (
                    f"security_id:{target_sec_id}"
                    if target_sec_id is not None
                    else None
                )
            )

            if source_key:
                _register_node(source_key, source_desc)
            if target_key:
                _register_node(target_key, target_desc)
            if source_key and target_key and rel_type:
                edges.append(
                    {
                        "source": source_key,
                        "target": target_key,
                        "relationship_type": rel_type,
                    },
                )

        return {"nodes": nodes, "edges": edges}

    async def get_full_chain_for_display(self, trigger_security_id: int) -> str:
        """Return a human-readable chain string, e.g. 'VMTC → CSYC → NXMG'."""
        chain = await self.get_upstream_chain(trigger_security_id)
        if not chain:
            return ""
        deepest = max(chain, key=lambda x: x.get("depth", 0))
        tickers = deepest.get("chain_tickers", [])
        if isinstance(tickers, list):
            return " → ".join(tickers)
        return ""

    # ----------------------------------------------------------------
    # Private helpers
    # ----------------------------------------------------------------

    async def _raw_conn(self):
        """
        Return the underlying asyncpg connection from the SQLAlchemy async session.
        Using the raw connection bypasses all SQLAlchemy query pre-processing and
        transaction wrapping for Cypher queries.
        """
        sa_conn = await self.db.connection()
        raw_dbapi = await sa_conn.get_raw_connection()
        raw = raw_dbapi.driver_connection
        await raw.execute("SET search_path = ag_catalog, '$user', public;")
        return raw

    async def _get_name_by_ticker_raw(self, conn, ticker: str) -> str | None:
        """Look up an Company node's name by its ticker."""
        sql = f"""
            SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
                MATCH (c:Company {{ticker: '{ticker}'}})
                RETURN c.name AS name
            $$) AS (name ag_catalog.agtype);
        """
        try:
            rows = await conn.fetch(sql)
            if rows:
                return self._parse_agtype(rows[0][0])
        except Exception as e:
            logger.error(f"GraphRepository._get_name_by_ticker_raw failed: {e}")
        return None

    async def _get_ticker_by_security_id_raw(
        self,
        conn,
        security_id: int,
    ) -> str | None:
        """Look up an Company node's ticker by its security_id."""
        sql = f"""
            SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
                MATCH (c:Company {{security_id: {security_id}}})
                RETURN c.ticker AS ticker
            $$) AS (ticker ag_catalog.agtype);
        """
        try:
            rows = await conn.fetch(sql)
            if rows:
                return self._parse_agtype(rows[0][0])
        except Exception as e:
            logger.error(f"GraphRepository._get_ticker_by_security_id failed: {e}")
        return None

    @staticmethod
    def _parse_agtype(value) -> int | float | str | list | dict | None:
        """
        Convert an ag_catalog.agtype column value to a native Python type.
        AGE returns values as strings like '"VMTC"' or '5::numeric'.
        """
        if value is None:
            return None
        s = str(value).strip()
        if "::" in s:
            s = s.split("::")[0].strip()
        try:
            return json.loads(s)
        except (json.JSONDecodeError, ValueError):
            return s
