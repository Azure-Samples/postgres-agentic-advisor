from langchain.agents import create_agent
from src.prompts import RISK_INSIGHT_AGENT_PROMPT


def get_risk_insight_agent(llm):
    """
    Create and return a Risk Insight Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with RISK_INSIGHT_AGENT_PROMPT.
    """
    return create_agent(
        tools=[],
        model=llm,
        system_prompt=RISK_INSIGHT_AGENT_PROMPT,
    )
