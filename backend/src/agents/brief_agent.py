from langchain.agents import create_agent
from src.prompts import BRIEF_AGENT_PROMPT


def get_brief_agent(llm):
    """
    Create and return a Brief Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with BRIEF_AGENT_PROMPT.
    """
    return create_agent(
        tools=[],
        model=llm,
        system_prompt=BRIEF_AGENT_PROMPT,
    )
