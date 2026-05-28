"""
Step 5 — Supply chain graph.

Creates the 'supply_chain' Apache AGE property graph with Company nodes and
SUPPLIES edges.  All statements use MERGE so the step is fully idempotent.

Graph topology (seller → buyer):
    ZVTC ──[:SUPPLIES]──► NFEQ ──[:SUPPLIES]──► NWND ──[:SUPPLIES]──► CCMP
"""

import logging

from sqlalchemy.ext.asyncio import AsyncEngine

logger = logging.getLogger(__name__)

GRAPH_NAME = "supply_chain"

# (security_id, ticker, name, description)
_COMPANIES = [
    (1, "EDUC", "EduCare Corp.", "education software provider"),
    (2, "AWKS", "Adventure Works Analytics Holdings", "AI analytics platform provider"),
    (3, "ZVTC", "Zava Technologies", "raw materials supplier"),
    (4, "NFEQ", "NanoFab Equipment", "chip fabrication equipment manufacturer"),
    (5, "NWND", "NorthWind Memory Technologies", "semiconductor chip producer"),
    (6, "CCMP", "Contoso Compute", "AI compute hardware provider"),
]

# (from_ticker, to_ticker, material, description)
_EDGES = [
    (
        "ZVTC",
        "NFEQ",
        "semiconductor materials",
        "ZVTC supplies chemical precursors used in NFEQ chip fabrication",
    ),
    (
        "NFEQ",
        "NWND",
        "chip fabrication equipment",
        "NFEQ supplies wafer etching equipment used in NWND semiconductor production",
    ),
    (
        "NWND",
        "CCMP",
        "memory chips",
        "NWND supplies high-bandwidth memory chips used in CCMP AI compute hardware",
    ),
]


async def setup_supply_chain(engine: AsyncEngine) -> None:
    """Create the AGE supply_chain graph, nodes, and edges (idempotent)."""
    async with engine.connect() as sa_conn:
        raw_dbapi = await sa_conn.get_raw_connection()
        raw = raw_dbapi.driver_connection
        await raw.execute("SET search_path = ag_catalog, '$user', public;")

        await _create_graph_if_missing(raw)

        for security_id, ticker, name, description in _COMPANIES:
            await _merge_company_node(raw, security_id, ticker, name, description)
        logger.info(
            "Merged %d Company nodes into %r graph.",
            len(_COMPANIES),
            GRAPH_NAME,
        )

        for from_t, to_t, material, desc in _EDGES:
            await _merge_supplies_edge(raw, from_t, to_t, material, desc)
        logger.info("Merged %d SUPPLIES edges into %r graph.", len(_EDGES), GRAPH_NAME)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _create_graph_if_missing(raw) -> None:
    sql = f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM ag_catalog.ag_graph WHERE name = '{GRAPH_NAME}'
            ) THEN
                PERFORM ag_catalog.create_graph('{GRAPH_NAME}');
            END IF;
        END;
        $$;
    """
    await raw.execute(sql)
    logger.info("Ensured AGE graph %r exists.", GRAPH_NAME)


async def _merge_company_node(
    raw,
    security_id: int,
    ticker: str,
    name: str,
    description: str,
) -> None:
    sql = f"""
        SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
            MERGE (:Company {{
                ticker:      '{ticker}',
                security_id: {security_id},
                name:        '{name}',
                description: '{description}'
            }})
        $$) AS (v ag_catalog.agtype);
    """
    await raw.execute(sql)


async def _merge_supplies_edge(
    raw,
    from_ticker: str,
    to_ticker: str,
    material: str,
    description: str,
) -> None:
    sql = f"""
        SELECT * FROM ag_catalog.cypher('{GRAPH_NAME}', $$
            MATCH (a:Company {{ticker: '{from_ticker}'}}),
                  (b:Company {{ticker: '{to_ticker}'}})
            MERGE (a)-[:SUPPLIES {{
                material:    '{material}',
                description: '{description}'
            }}]->(b)
        $$) AS (v ag_catalog.agtype);
    """
    await raw.execute(sql)
