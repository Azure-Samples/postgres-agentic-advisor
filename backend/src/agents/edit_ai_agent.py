from langchain.agents import create_agent
from src.prompts import EDIT_AI_AGENT_PROMPT


def get_edit_ai_agent(llm):
    """
    Create and return an Edit AI Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with EDIT_AI_AGENT_PROMPT.
    """
    return create_agent(
        tools=[],
        model=llm,
        system_prompt=EDIT_AI_AGENT_PROMPT,
    )
