from langchain.agents import create_agent
from src.prompts import PLANNING_AGENT_PROMPT


def get_planner_agent(llm):
    """
    Create and return a Planning Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with PLANNING_AGENT_PROMPT.
    """
    return create_agent(
        tools=[],
        model=llm,
        system_prompt=PLANNING_AGENT_PROMPT,
    )
