import asyncio
import json
from datetime import date as date_type

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy.ext.asyncio import async_sessionmaker
from src.prompts import (
    ASK_AI_CHAT_AGENT_PROMPT,
    RISK_PROFILE_CLASSIFIER_PROMPT,
    RISK_PROFILE_LABELS,
)
from src.repositories import AlertRepository
from src.repositories.clients import ClientRepository
from src.services.memory_service import (
    delete_all_preferences,
    fetch_preferences,
    save_preference,
)


async def _classify_risk_profile(llm, statement: str) -> str | None:
    """
    Return a canonical risk profile label if the statement is about the
    client's overall risk appetite or investment style, otherwise None.
    """
    labels = ", ".join(RISK_PROFILE_LABELS)
    response = await llm.ainvoke(
        [
            SystemMessage(
                content=f"{RISK_PROFILE_CLASSIFIER_PROMPT}\n\nValid labels: {labels}",
            ),
            HumanMessage(content=statement),
        ],
    )
    result = response.content.strip().strip('"').strip("'")
    return result if result in RISK_PROFILE_LABELS else None


def get_ask_ai_agent(
    llm,
    askai_workflow_service,
    session_factory: async_sessionmaker,
    user_id: int,
    client_id: int,
    client_portfolio: dict,
    memory,
    session_id: str,
    turn_id: int,
    request_date: str | None = None,
):
    """
    Create and return the AskAI agent.

    Tools:
      - run_analysis:             delegates to AskAIWorkflowService (news/stock/SEC).
      - save_client_preference:   persists to mem0 and classifies risk profile to DB.
      - clear_client_preferences: wipes mem0 and clears DB risk profile.
      - fetch_client_preferences: retrieves fresh preferences from mem0.

    request_date: ISO date (YYYY-MM-DD) from the X-Simulated-Date header.
        Used as the default target date for stock analysis when the advisor's
        message does not name a date. The advisor's message takes precedence.
    """

    @tool
    async def run_analysis(query: str, date: str = "") -> str:
        """
        Analyze companies using the multi-agent research workflow.

        Build the query with two decisions:

        1. Source type: if the advisor's message contains "news", "stock", or "sec",
           include that exact word. It tells the planner which agents to run.
           If none are present, omit — the planner runs all three automatically.

        2. Company: include a company name only if it is the investment target.
           If the advisor mentions a company only because they are reducing/exiting it,
           leave it out. If no target company is named, leave the company out entirely —
           the planner will analyze all companies in the database.

        Frame the query as a question about which company to pick, e.g.:
           "Based on news, which company is performing well for investment?"

        For the risk-averse second pass, name the shortlisted companies explicitly:
           "Full analysis of Apple, Microsoft, TSLA"
        The planner targets only those companies; the cache skips already-run sources.

        Direct stock-on-date questions (e.g. "what is the stock of Northwind on
        5th May?") are valid run_analysis calls — pass query="stock analysis of
        Northwind" and the resolved date.

        Args:
            query: The analysis request built by the rules above.
            date:  Target date for share-price analysis in YYYY-MM-DD format.
                   Pass ONLY if the advisor's message names a specific date
                   (e.g. "5th May 2025", "last Friday"). Omit otherwise — the
                   system applies the CURRENT DATE from the system prompt.

        Returns:
            JSON string with:
              - "results":          {ticker: {name, news, stock, sec}}
              - "planner_decision": the planner's reasoning and chosen parameters
        """
        effective_date = date or request_date
        output = await askai_workflow_service.run_analysis(
            query=query,
            session_id=session_id,
            turn_id=turn_id,
            date=effective_date or None,
        )
        return json.dumps(output, default=str)

    async def _read_preferences_state() -> dict:
        """Fetch current {preferences, risk_profile} from the sources of truth."""

        async def _get_risk_profile() -> str | None:
            async with session_factory() as db:
                client = await ClientRepository(db).get_by_id(client_id)
                if not client or not client.profile:
                    return None
                return client.profile.get("risk_preference")

        prefs, risk_profile = await asyncio.gather(
            fetch_preferences(memory=memory, advisor_id=user_id, client_id=client_id),
            _get_risk_profile(),
        )
        return {"preferences": prefs or [], "risk_profile": risk_profile}

    @tool
    async def save_client_preference(preference_statement: str) -> str:
        """
        Save anything descriptive about the client to persistent memory.

        Call this whenever the advisor's current message says ANYTHING about the
        client — their risk appetite, investment style, preferences, personality,
        likes, dislikes, or any other characteristic. Pass the statement exactly
        as the advisor stated it.

        Do NOT call this for requests to clear/reset preferences — use
        clear_client_preferences for that.

        This tool already returns the full updated state — do NOT call
        fetch_client_preferences afterward.

        Args:
            preference_statement: The advisor's statement about the client, verbatim.

        Returns:
            JSON object with:
              - "status":       "changed" if a new preference (or risk profile) was
                                stored, "unchanged" otherwise.
              - "preferences":  list of stored preference strings AFTER the save.
              - "risk_profile": the client's risk label AFTER the save, or null.
              - "changed_facts" (only when status="changed"): what was newly stored.
              - "message" (only when status="unchanged"): why nothing changed.
        """
        # Run mem0 save and risk classification in parallel — they are independent.
        mem0_result, risk_label = await asyncio.gather(
            save_preference(
                memory=memory,
                advisor_id=user_id,
                client_id=client_id,
                message=preference_statement,
            ),
            _classify_risk_profile(llm, preference_statement),
        )

        print(f"   [mem0] Saved preference: {mem0_result}")
        print(f"   [risk_profile] Classified risk profile: {risk_label}")

        if risk_label:
            async with session_factory() as db:
                await ClientRepository(db).update_risk_profile(client_id, risk_label)
            print(f"   [risk_profile] Set to '{risk_label}' for client {client_id}")

        changed = mem0_result["changed"] or bool(risk_label)
        if changed:
            async with session_factory() as db:
                repo = ClientRepository(db)
                await repo.set_has_interactive_preferences(client_id, True)
                stale_count = await AlertRepository(db).mark_outdated_for_client(
                    client_id,
                )
                if stale_count:
                    print(
                        f"   [mem0] Marked {stale_count} alert(s) as outdated for client {client_id}",
                    )

        state = await _read_preferences_state()
        if changed:
            state["status"] = "changed"
            state["changed_facts"] = mem0_result["facts"] or (
                [f"Risk Profile: {risk_label}"] if risk_label else []
            )
        else:
            state["status"] = "unchanged"
            state["message"] = "No new preference was extracted from that statement."
        return json.dumps(state)

    @tool
    async def clear_client_preferences() -> str:
        """
        Remove ALL stored preferences and the risk profile for this client.

        Call this — instead of save_client_preference — when the advisor's intent
        is to wipe or reset preferences, not add a new one. Trigger phrases include:
        "client has no preferences", "clear preferences", "reset preferences",
        "start fresh", "forget everything", "blank slate", "ignore what I said".

        Do NOT call this to update or add a preference — use save_client_preference.

        This tool already returns the full updated state — do NOT call
        fetch_client_preferences afterward.

        Returns:
            JSON object with:
              - "status":       "cleared" if preferences were removed,
                                "unchanged" if nothing was stored to begin with.
              - "preferences":  empty list.
              - "risk_profile": null.
              - "message" (only when status="unchanged"): explanation.
        """
        # Snapshot DB state before clearing so status reflects reality.
        # risk_preference and has_interactive_preferences may be set in DB
        # without any corresponding mem0 entries (e.g. seeded from external data),
        # so deleted (mem0 only) is not a reliable signal on its own.
        pre_clear = await _read_preferences_state()
        async with session_factory() as db:
            client = await ClientRepository(db).get_by_id(client_id)
            db_had_data = bool(
                client
                and client.profile
                and (
                    client.profile.get("risk_preference")
                    or client.profile.get("has_interactive_preferences")
                ),
            )
        had_data = bool(
            pre_clear["preferences"] or pre_clear["risk_profile"] or db_had_data,
        )

        deleted = await delete_all_preferences(
            memory=memory,
            advisor_id=user_id,
            client_id=client_id,
        )
        async with session_factory() as db:
            repo = ClientRepository(db)
            await repo.update_risk_profile(client_id, None)
            await repo.set_has_interactive_preferences(client_id, False)
            stale_count = await AlertRepository(db).mark_outdated_for_client(client_id)
            if stale_count:
                print(
                    f"   [mem0] Marked {stale_count} alert(s) as outdated for client {client_id}",
                )

        state = await _read_preferences_state()
        if deleted or had_data:
            state["status"] = "cleared"
        else:
            state["status"] = "unchanged"
            state["message"] = "No preferences were stored for this client."
        return json.dumps(state)

    @tool
    async def fetch_client_preferences() -> str:
        """
        Retrieve the current stored preferences and risk profile for this client.

        Call this ONLY in this situation:
          - After run_analysis returns and before synthesizing a client-centric
            recommendation — to check whether the risk profile is known.

        Do NOT call this after save_client_preference or clear_client_preferences —
        those tools already return the full updated state.

        Takes no arguments.

        Returns:
            JSON object with:
              - "preferences":  list of stored preference strings from memory.
              - "risk_profile": the client's classified risk label
                                (e.g. "Risk Aversive", "Growth Oriented"), or null if not set.
            Use "risk_profile" as the authoritative signal for whether the client's
            risk profile is known. A null value means the follow-up question must be asked.
        """
        state = await _read_preferences_state()
        if not state["preferences"]:
            state["message"] = "No preferences stored yet."
        return json.dumps(state)

    portfolio_section = ""
    if client_portfolio:
        portfolio_section = f"""
---

CLIENT PORTFOLIO CONTEXT (use this when synthesising analysis results):
{json.dumps(client_portfolio, indent=2, default=str)}

Note: this context does NOT include the client's preferences or risk profile.
Always obtain those by calling fetch_client_preferences — that tool is the only
authoritative source.

When interpreting run_analysis results:
- Cross-reference which analyzed companies the client already holds
- Flag how findings affect the client's existing positions or sector exposure
- Highlight any concentration risk, opportunity, or mismatch
"""

    current_date = request_date or date_type.today().isoformat()
    date_section = f"""
---

CURRENT DATE: {current_date}

If the advisor's message names a date (e.g. "5th May 2025", "last Friday"), resolve it to YYYY-MM-DD against CURRENT DATE and pass it as the `date` argument to run_analysis. Otherwise omit `date`.
"""

    system_prompt = ASK_AI_CHAT_AGENT_PROMPT + portfolio_section + date_section

    return create_agent(
        tools=[
            run_analysis,
            save_client_preference,
            clear_client_preferences,
            fetch_client_preferences,
        ],
        model=llm,
        system_prompt=system_prompt,
    )
