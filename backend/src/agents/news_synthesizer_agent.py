from contextvars import ContextVar

from langchain.agents import create_agent
from langchain.tools import tool
from src.configs.config import settings
from src.prompts import NEWS_SYNTHESIZER_AGENT_PROMPT

# Stores chunk docs retrieved by news_search_tool. Each async task gets its own private copy, so concurrent requests don't interfere.
news_retrieved_docs_var: ContextVar[list] = ContextVar(
    "news_retrieved_docs",
    default=[],
)


def get_news_synthesizer_agent(llm, vector_store_news_articles):
    """
    Create and return a News Synthesizer Agent.

    Args:
        llm: The language model to use for the agent.

    Returns:
        Agent configured with NEWS_SYNTHESIZER_AGENT_PROMPT.
    """

    @tool
    async def news_search_tool(query: str, ticker_id: str) -> str:
        """
        Search the news vector database for relevant articles about a specific company.

        Args:
            query: str The search query to find relevant news articles.
            ticker_id: str The unique identifier of the company to filter news for.
        """

        docs = await vector_store_news_articles.asimilarity_search(
            query,
            k=settings.TOP_K_NEWS_ARTICLES,
            filter={
                "column": "(metadata->>'ticker_id')",
                "operator": "in",
                "value": [str(ticker_id)],
            },
        )

        if not docs:
            return "No relevant news articles found."

        # Add new chunk docs to the capture list, skipping any already seen from a previous tool call.
        captured = news_retrieved_docs_var.get()
        existing_contents = {d.page_content for d in captured}
        for doc in docs:
            if doc.page_content not in existing_contents:
                captured.append(doc)
                existing_contents.add(doc.page_content)

        context = "\n\n".join(
            [
                f"[{i + 1}] {doc.metadata.get('title', 'No title')}\n{doc.page_content}"
                for i, doc in enumerate(docs)
            ],
        )

        return context

    return create_agent(
        tools=[news_search_tool],
        model=llm,
        system_prompt=NEWS_SYNTHESIZER_AGENT_PROMPT,
    )
