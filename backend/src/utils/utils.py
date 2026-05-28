import asyncio
import csv
import json


def load_csv_data(file_path: str) -> list:
    with open(file_path, "r", encoding="utf-8") as file:
        reader = list(csv.DictReader(file))
        data = [parse_json_fields(row) for row in reader]
    return data


def parse_json_fields(row: dict) -> dict:
    for key, value in row.items():
        try:
            row[key] = json.loads(value)
        except json.JSONDecodeError:
            pass
    return row


async def run_parallel_rag_with_docs(
    vector_store,
    questions: list[str],
    ticker_id: int,
    top_k: int,
) -> tuple[str, list]:
    """
    Run multiple RAG queries in parallel against a vector store, returning
    both the combined context string and the deduplicated list of Document objects.

    Args:
        vector_store: The vector store to query.
        questions: A list of questions to ask in parallel.
        ticker_id: The company ID to filter the vector store search.
        top_k: The number of top results to retrieve per question.

    Returns:
        A tuple of (combined_context_string, deduplicated_documents).
    """

    print(f"Ticker ID: {ticker_id}, Type: {type(ticker_id)}")

    async def fetch(question: str) -> tuple[str, list]:
        docs = await vector_store.asimilarity_search(
            question,
            k=top_k,
            filter={
                "column": "(metadata->>'ticker_id')",
                "operator": "in",
                "value": [str(ticker_id)],
            },
        )
        context = "\n".join([doc.page_content for doc in docs])
        return f"Q: {question}\nContext:\n{context}\n\n", docs

    results = await asyncio.gather(*[fetch(q) for q in questions])
    context_parts, doc_lists = zip(*results) if results else ([], [])

    # Deduplicate docs by page_content to avoid storing duplicate chunks
    seen: set[str] = set()
    unique_docs = []
    for doc_list in doc_lists:
        for doc in doc_list:
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                unique_docs.append(doc)

    return "\n\n---\n\n".join(context_parts), unique_docs


def build_companies(alert) -> list[dict]:
    """
    Build the companies list for an alert response.
    """
    companies = []
    held_ticker = getattr(alert, "company_ticker", None)
    if held_ticker and getattr(alert, "company_name", None):
        companies.append(
            {
                "ticker": held_ticker,
                "company_name": getattr(alert, "company_name", None),
                "company_description": getattr(alert, "company_description", None),
            },
        )
    trigger_ticker = getattr(alert, "trigger_company_ticker", None)
    if (
        trigger_ticker
        and trigger_ticker != held_ticker
        and getattr(alert, "trigger_company_name", None)
    ):
        companies.append(
            {
                "ticker": trigger_ticker,
                "company_name": getattr(alert, "trigger_company_name", None),
                "company_description": getattr(
                    alert,
                    "trigger_company_description",
                    None,
                ),
            },
        )
    return companies


def prompt_security_info(raw: dict) -> dict:
    """Prompt-safe subset of security_information — strips internal fields."""
    return {k: raw[k] for k in ("ticker", "name", "description", "earnings_date", "exchange", "sector", "industry") if k in raw}


def prompt_client_info(raw: dict) -> dict:
    """Prompt-safe subset of client_information — strips IDs, PII, and internal flags."""
    return {k: raw[k] for k in ("full_name", "age", "client_portfolio_value", "client_net_worth", "client_growth", "client_exposure_percentage") if k in raw}


def prompt_holdings(raw: dict) -> dict:
    """Prompt-safe subset of client_account_holdings — strips internal IDs."""
    return {k: raw[k] for k in ("ticker", "company_name", "quantity", "cost_basis_total_usd") if k in raw}


def prompt_supply_chain(raw: dict) -> dict:
    """Prompt-safe subset of supply_chain_context — strips internal IDs and redundant chain_tickers."""
    chain = [
        {k: node[k] for k in ("ticker", "name", "description", "depth", "chain_names") if k in node}
        for node in raw.get("upstream_chain", [])
    ]
    return {"upstream_chain": chain}


# Escape any literal newlines inside JSON string values (LLMs sometimes emit
# real \n characters instead of the \\n escape sequence, making the JSON invalid).
def sanitize_json_strings(s: str) -> str:
    """Escape literal newlines in JSON string values to ensure valid JSON output."""

    result = []
    in_string = False
    escaped = False
    for ch in s:
        if escaped:
            result.append(ch)
            escaped = False
        elif ch == "\\":
            result.append(ch)
            escaped = True
        elif ch == '"':
            in_string = not in_string
            result.append(ch)
        elif ch == "\n" and in_string:
            result.append("\\n")
        elif ch == "\r" and in_string:
            result.append("\\r")
        else:
            result.append(ch)
    return "".join(result)
