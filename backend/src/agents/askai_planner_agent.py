import json

from langchain.agents import create_agent
from langchain.tools import tool
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import async_sessionmaker
from src.models.securities import Security
from src.prompts.askai_planner_agent_prompt import ASKAI_PLANNER_AGENT_PROMPT


def get_askai_planner_agent(llm, session_factory: async_sessionmaker):
    """
    Create and return the AskAI Planner Agent.

    This planner is specific to the AskAI chat workflow. Unlike the alert
    planner (which only decides which agent types to trigger based on client
    preferences), this planner:

      1. Interprets the advisor's raw natural-language query.
      2. Resolves any named companies to DB-backed tickers via search_companies.
      3. Decides which analysis types (news / stock / sec) to run.
      4. Returns a structured JSON plan consumed by AskAIWorkflowService.

    Args:
        llm: The language model to use.
        session_factory: SQLAlchemy async session factory for DB lookups.

    Returns:
        A LangChain agent configured with ASKAI_PLANNER_AGENT_PROMPT and the
        search_companies tool.
    """

    @tool
    async def search_companies(query: str) -> str:
        """
        Search for companies in the database by name or ticker symbol.

        Use this to resolve a company name to its database company_id and
        ticker before including it in the analysis plan. Returns matching companies —
        pick the most relevant one from context.

        Args:
            query: Company name, partial name, or ticker to search for.
                   Examples: "Apple", "JPMorgan", "TSLA", "cyber"

        Returns:
            JSON list of matching companies with company_id, ticker, and name.
        """
        async with session_factory() as db:
            rows = await db.execute(
                select(Security.id, Security.ticker, Security.name).where(
                    or_(
                        Security.name.ilike(f"%{query}%"),
                        Security.ticker.ilike(f"%{query}%"),
                    ),
                ),
            )
            matches = [
                {"company_id": r[0], "ticker": r[1], "name": r[2]} for r in rows.all()
            ]
            if not matches:
                return json.dumps(
                    {
                        "matches": [],
                        "message": f"No companies found matching '{query}'.",
                    },
                )
            return json.dumps({"matches": matches})

    return create_agent(
        tools=[search_companies],
        model=llm,
        system_prompt=ASKAI_PLANNER_AGENT_PROMPT,
    )
