"""
pipeline.py — CSV → Apache AGE graph loader.

Reads cached graph nodes and edges from CSV files and loads them into an
Apache AGE graph. The CSV files in ``graph_cache/`` are the source of truth.

Usage:
    from src.db_setup.graph_pipeline import run_pipeline
    run_pipeline()

Environment variables (put in a .env file next to this script):
    DB_HOST           Database host
    DB_PORT           Database port (default: 5432)
    DB_NAME           Database name
    DB_USER           Database user (omit when using Entra ID auth)
    DB_PASSWORD       Database password (omit when using Entra ID auth)
    USE_ENTRA_AUTH    true | 1  (Azure Entra ID token auth)
    AZURE_CREDENTIAL_EXCLUDE_MANAGED_IDENTITY_CREDENTIAL  true | 1
    GRAPH_NAME        news_graph  (default)
"""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path

import psycopg2
from src.configs.config import settings
from src.database import create_database_manager

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("pipeline")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_MODULE_DIR = Path(__file__).parent
_GRAPH_CACHE_DIR = _MODULE_DIR / "data/graph"
_NODES_CSV_PATH = _GRAPH_CACHE_DIR / "graph_nodes.csv"
_EDGES_CSV_PATH = _GRAPH_CACHE_DIR / "graph_edges.csv"


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_DEFAULT_GRAPH = settings.GRAPH_NAME


# Legal-form suffixes stripped before fuzzy token comparison in the security
# enrichment step (_build_security_lookup / _create_vertices).
_LEGAL_SUFFIXES: frozenset[str] = frozenset(
    {
        "corp",
        "corporation",
        "inc",
        "incorporated",
        "ltd",
        "limited",
        "llc",
        "co",
        "company",
        "group",
        "holdings",
        "the",
        "plc",
    },
)


def _name_tokens(name: str) -> frozenset[str]:
    """Return the meaningful lowercase word-tokens of a company name,
    stripping punctuation and ignoring legal-form suffixes."""
    import re

    words = re.split(r"[\s,./&()-]+", name.lower())
    return frozenset(w for w in words if w and w not in _LEGAL_SUFFIXES)


# ===========================================================================
# SECTION 1 — DB CONNECTION
# ===========================================================================

_db_manager = None


def _get_db_manager():
    global _db_manager
    if _db_manager is None:
        _db_manager = create_database_manager()
    return _db_manager


# ===========================================================================
# SECTION 2 — CSV LOADER
# ===========================================================================


def load_graph_from_csv(
    nodes_path: Path | None = None,
    edges_path: Path | None = None,
) -> dict | None:
    """Load graph from CSV cache. Returns None if either file is absent."""
    nodes_path = nodes_path or _NODES_CSV_PATH
    edges_path = edges_path or _EDGES_CSV_PATH

    if not nodes_path.exists() or not edges_path.exists():
        logger.debug(
            "Graph CSV cache not found (%s, %s)",
            nodes_path.name,
            edges_path.name,
        )
        return None

    node_rows: list[dict] = []
    with nodes_path.open("r", newline="", encoding="utf-8") as fh:
        node_rows = [dict(r) for r in csv.DictReader(fh)]

    edge_rows: list[dict] = []
    with edges_path.open("r", newline="", encoding="utf-8") as fh:
        edge_rows = [dict(r) for r in csv.DictReader(fh)]

    logger.info(
        "Loaded graph from CSV cache: %d nodes, %d edges",
        len(node_rows),
        len(edge_rows),
    )
    return {
        "nodes": len(node_rows),
        "edges": len(edge_rows),
        "node_rows": node_rows,
        "edge_rows": edge_rows,
    }


# ===========================================================================
# SECTION 3 — AGE LOADER
# ===========================================================================


def _get_age_conn() -> psycopg2.extensions.connection:
    dsn = _get_db_manager().get_sync_database_url_with_token()
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    return conn


def _init_age(conn, graph_name: str, drop_graph: bool) -> None:
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS age;")
        cur.execute('SET search_path = ag_catalog, "$user", public;')
        cur.execute(
            "SELECT EXISTS(SELECT 1 FROM ag_catalog.ag_graph WHERE name = %s);",
            (graph_name,),
        )
        graph_exists = cur.fetchone()[0]
        if drop_graph and graph_exists:
            logger.info("Dropping existing graph '%s'…", graph_name)
            cur.execute("SELECT drop_graph(%s, true);", (graph_name,))
            graph_exists = False
        if not graph_exists:
            logger.info("Creating graph '%s'…", graph_name)
            cur.execute("SELECT create_graph(%s);", (graph_name,))
        else:
            logger.info("Using existing graph '%s' (incremental)", graph_name)


def _parse_props(props_str) -> dict:
    if not props_str:
        return {}
    try:
        return json.loads(props_str)
    except (json.JSONDecodeError, TypeError):
        return {}


def _cypher_value(value) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return "[" + ", ".join(_cypher_value(v) for v in value) + "]"
    return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"


def _props_cypher(props: dict, extra: dict | None = None) -> str:
    merged = {**(extra or {}), **props}
    if not merged:
        return ""
    parts = [
        f"`{k.replace('-', '_').replace(' ', '_').replace('`', '')}`: {_cypher_value(v)}"
        for k, v in merged.items()
    ]
    return "{" + ", ".join(parts) + "}"


def _build_security_lookup(conn) -> dict[str, tuple[int, str, str | None]]:
    """
    Build a lookup dict from the ``security`` table for Company node enrichment.

    Returns a dict mapping lowercased name/ticker strings → (security_id, ticker, description).
    Both exact-name and ticker keys are included so either can produce a match.
    Token-based fuzzy entries are also added so minor name variations still resolve.
    description is stored as description on the Company node.
    """
    lookup: dict[str, tuple[int, str, str | None]] = {}
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, ticker, name, description FROM security;")
            for row in cur.fetchall():
                sec_id, ticker, name, description = row[0], row[1], row[2], row[3]
                if name:
                    lookup[name.lower().strip()] = (sec_id, ticker, description)
                if ticker:
                    lookup[ticker.lower().strip()] = (sec_id, ticker, description)
    except Exception as exc:
        logger.warning("Could not build security lookup from DB: %s", exc)
    return lookup


def _create_vertices(
    conn,
    graph_name: str,
    node_rows: list[dict],
    security_lookup: dict | None = None,
) -> tuple[int, int]:
    graph_esc = graph_name.replace("'", "''")
    created = skipped = 0
    with conn.cursor() as cur:
        cur.execute('SET search_path = ag_catalog, "$user", public;')
        for row in node_rows:
            node_id = int(row["id"])
            name = str(row.get("name") or "")
            label = (
                str(row["label"]).replace("`", "").replace(" ", "_").replace("&", "And")
            )
            label_esc = label.replace("'", "''")
            props = _parse_props(row.get("properties"))

            # Enrich Company/Organization nodes with security_id + ticker from the relational DB
            if label in ("Company", "Organization") and security_lookup:
                name_lower = name.lower().strip()
                match = security_lookup.get(name_lower)
                if match is None:
                    # Fallback: token-based fuzzy match (strips legal suffixes)
                    name_toks = _name_tokens(name)
                    if name_toks:
                        for key, val in security_lookup.items():
                            if name_toks == _name_tokens(key):
                                match = val
                                break
                if match:
                    sec_id, ticker, description = match
                    props["security_id"] = sec_id
                    props["ticker"] = ticker
                    if description:
                        props["description"] = description
                    logger.debug(
                        "Enriched Company node '%s' → security_id=%d ticker=%s description=%s",
                        name,
                        sec_id,
                        ticker,
                        description,
                    )

            cur.execute(
                f"SELECT * FROM cypher('{graph_esc}', $$ "
                f"MATCH (n:{label_esc} {{id: {node_id}}}) RETURN n $$) AS (v agtype);",
            )
            if cur.fetchone():
                skipped += 1
                continue
            props_str = _props_cypher(props, extra={"id": node_id, "name": name})
            try:
                cur.execute(
                    f"SELECT * FROM cypher('{graph_esc}', $$ "
                    f"CREATE (n:{label_esc} {props_str}) $$) AS (v agtype);",
                )
                created += 1
            except Exception as exc:
                logger.warning(
                    "Failed to create node %d (%s): %s",
                    node_id,
                    name[:50],
                    exc,
                )
    logger.info("Vertices: %d created, %d already existed", created, skipped)
    return created, skipped


def _create_edges(
    conn,
    graph_name: str,
    edge_rows: list[dict],
    node_rows: list[dict],
) -> tuple[int, int, int]:
    graph_esc = graph_name.replace("'", "''")
    id_label: dict[int, str] = {
        int(r["id"]): str(r["label"])
        .replace("`", "")
        .replace(" ", "_")
        .replace("&", "And")
        for r in node_rows
    }
    created = skipped = errors = 0
    with conn.cursor() as cur:
        cur.execute('SET search_path = ag_catalog, "$user", public;')
        for row in edge_rows:
            start_id = int(row["start_id"])
            end_id = int(row["end_id"])
            rel_type = str(row["relationship"]).replace("`", "").replace(" ", "_")
            start_label = (
                str(row.get("start_label") or id_label.get(start_id, "Unknown"))
                .replace("`", "")
                .replace(" ", "_")
                .replace("&", "And")
            )
            end_label = (
                str(row.get("end_label") or id_label.get(end_id, "Unknown"))
                .replace("`", "")
                .replace(" ", "_")
                .replace("&", "And")
            )
            props: dict = {}
            wt = row.get("weight")
            if wt is not None:
                try:
                    props["weight"] = float(wt)
                except (ValueError, TypeError):
                    pass
            ev = row.get("evidence")
            if ev:
                props["evidence"] = str(ev)
            sl_esc = start_label.replace("'", "''")
            el_esc = end_label.replace("'", "''")
            rel_esc = rel_type.replace("'", "''")
            # Idempotency check: AGE throws when the relationship type or label
            # doesn't exist yet, so treat any check failure as "not found" and
            # fall through to the CREATE rather than skipping the edge entirely.
            already_exists = False
            try:
                cur.execute(
                    f"SELECT * FROM cypher('{graph_esc}', $$ "
                    f"MATCH (s:{sl_esc} {{id: {start_id}}})-[r:{rel_esc}]->"
                    f"(t:{el_esc} {{id: {end_id}}}) RETURN r $$) AS (e agtype);",
                )
                already_exists = bool(cur.fetchone())
            except Exception:
                pass  # relationship type/label not yet in graph — proceed to CREATE
            if already_exists:
                skipped += 1
                continue
            props_str = _props_cypher(props)
            rel_part = f"[r:{rel_esc} {props_str}]" if props_str else f"[r:{rel_esc}]"
            try:
                cur.execute(
                    f"SELECT * FROM cypher('{graph_esc}', $$ "
                    f"MATCH (s:{sl_esc} {{id: {start_id}}}), "
                    f"(t:{el_esc} {{id: {end_id}}}) "
                    f"CREATE (s)-{rel_part}->(t) $$) AS (e agtype);",
                )
                created += 1
            except Exception as exc:
                errors += 1
                logger.debug("Edge %d→%d (%s): %s", start_id, end_id, rel_type, exc)
    logger.info(
        "Edges: %d created, %d already existed, %d errors",
        created,
        skipped,
        errors,
    )
    return created, skipped, errors


def load_into_age(
    node_rows: list[dict],
    edge_rows: list[dict],
    graph_name: str | None = None,
    drop_graph: bool = False,
) -> dict:
    graph_name = graph_name or _DEFAULT_GRAPH
    conn = _get_age_conn()
    try:
        _init_age(conn, graph_name, drop_graph=drop_graph)
        security_lookup = _build_security_lookup(conn)
        logger.info("Security lookup built: %d entries", len(security_lookup))
        v_created, v_skipped = _create_vertices(
            conn,
            graph_name,
            node_rows,
            security_lookup=security_lookup,
        )
        e_created, e_skipped, e_errors = _create_edges(
            conn,
            graph_name,
            edge_rows,
            node_rows,
        )
    finally:
        conn.close()
    return {
        "graph": graph_name,
        "vertices_created": v_created,
        "vertices_skipped": v_skipped,
        "edges_created": e_created,
        "edges_skipped": e_skipped,
        "edges_errors": e_errors,
    }


def _get_age_graph_counts(graph_name: str) -> tuple[int, int]:
    """Return (vertex_count, edge_count) in the AGE graph; (0, 0) if absent or on error."""
    try:
        conn = _get_age_conn()
        try:
            with conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS age;")
                cur.execute('SET search_path = ag_catalog, "$user", public;')
                cur.execute(
                    "SELECT EXISTS("
                    "  SELECT 1 FROM ag_catalog.ag_graph WHERE name = %s"
                    ");",
                    (graph_name,),
                )
                if not cur.fetchone()[0]:
                    return 0, 0
                g = graph_name.replace("'", "''")
                cur.execute(
                    f"SELECT count(*) FROM cypher('{g}', $$ MATCH (n) RETURN n $$)"
                    " AS (v agtype);",
                )
                v_count = int(cur.fetchone()[0])
                cur.execute(
                    f"SELECT count(*) FROM cypher('{g}',"
                    " $$ MATCH ()-[r]->() RETURN r $$) AS (e agtype);",
                )
                e_count = int(cur.fetchone()[0])
                return v_count, e_count
        finally:
            conn.close()
    except Exception as exc:
        logger.warning("Could not query AGE graph counts: %s", exc)
        return 0, 0


# ===========================================================================
# SECTION 4 — PIPELINE RUNNER
# ===========================================================================


def run_pipeline(
    graph_name: str | None = None,
    drop_graph: bool = False,
) -> dict:
    """Load the cached CSV graph into Apache AGE.

    The CSV files in graph_cache/ are the source of truth. If they are missing,
    the pipeline is a no-op.

    Steps:
      1. load_graph_from_csv — read nodes and edges from graph_cache/
      2. load_into_age       — push graph into Apache AGE
                               (SKIPPED when AGE counts already match exactly)
    """
    logger.info("=== run_pipeline: starting ===")
    gname = graph_name or _DEFAULT_GRAPH

    graph_data = load_graph_from_csv()
    if graph_data is None:
        logger.warning(
            "Graph CSV cache absent at %s — nothing to load.",
            _GRAPH_CACHE_DIR,
        )
        return {"graph": gname, "loaded": False}

    age_v, age_e = (0, 0) if drop_graph else _get_age_graph_counts(gname)

    if not drop_graph and age_v == graph_data["nodes"] and age_e == graph_data["edges"]:
        logger.info(
            "AGE graph '%s' already up-to-date (%d nodes, %d edges) — skipping load.",
            gname,
            age_v,
            age_e,
        )
        age_summary = {
            "graph": gname,
            "vertices_created": 0,
            "vertices_skipped": age_v,
            "edges_created": 0,
            "edges_skipped": age_e,
            "edges_errors": 0,
        }
    else:
        age_summary = load_into_age(
            graph_data["node_rows"],
            graph_data["edge_rows"],
            graph_name=gname,
            drop_graph=drop_graph,
        )
        logger.info("AGE load complete: %s", age_summary)

    logger.info("=== run_pipeline: complete ===")
    return {"graph": age_summary}
