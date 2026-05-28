from langchain.agents import create_agent
from src.prompts import SEC_FILING_ANALYSIS_AGENT_PROMPT


def get_sec_filing_analysis_agent(llm):
    """
    Create and return a SEC Filing Analysis Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with SEC_FILING_ANALYSIS_AGENT_PROMPT.
    """
    return create_agent(
        tools=[],
        model=llm,
        system_prompt=SEC_FILING_ANALYSIS_AGENT_PROMPT,
    )
