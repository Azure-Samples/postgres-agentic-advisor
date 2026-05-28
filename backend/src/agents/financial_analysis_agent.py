from datetime import datetime

from langchain.agents import create_agent
from langchain_core.tools import tool
from sqlalchemy import text
from src.prompts import FINANCIAL_ANALYSIS_AGENT_PROMPT


def get_financial_analysis_agent(llm, async_db_engine):
    """
    Create and return a Financial Analysis Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with FINANCIAL_ANALYSIS_AGENT_PROMPT.
    """

    @tool
    async def stocks_information_tool(security_id: int, target_date: str) -> str:
        """
        Fetch historical price data for a given security ID from the database.
        Returns OHLCV (open, high, low, close, volume) data sorted by date.
        Use this tool to retrieve stock price history before analyzing trends.

        Args:
            security_id: The unique identifier of the security/stock.
            target_date: The target date to fetch historical data up to.
        """

        date_formatted = datetime.strptime(
            target_date,
            "%Y-%m-%d",
        ).date()  # Convert to date object

        query = text(
            """
            SELECT security_id, price_date, open, high, low, close, volume
            FROM security_price
            WHERE security_id = :security_id
            AND price_date <= :date_formatted
            ORDER BY price_date DESC
            LIMIT 10
        """,
        )

        async with async_db_engine.connect() as conn:
            result = await conn.execute(
                query,
                {"security_id": security_id, "date_formatted": date_formatted},
            )
            rows = result.fetchall()

        if not rows:
            return f"No price data found for security_id {security_id}."

        lines = ["date | open | high | low | close | volume"]
        for row in rows:
            lines.append(
                f"{row.price_date} | {row.open} | {row.high} | {row.low} | {row.close} | {row.volume}",
            )

        return "\n".join(lines)

    return create_agent(
        tools=[stocks_information_tool],
        model=llm,
        system_prompt=FINANCIAL_ANALYSIS_AGENT_PROMPT,
    )
