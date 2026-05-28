import json
import uuid as uuid_module

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from src.agents import get_ask_ai_agent
from src.configs.config import settings
from src.prompts import ASK_AI_CHAT_AGENT_PROMPT, CHAT_TITLE_GENERATION_PROMPT
from src.repositories.account_holdings import AccountHoldingRepository
from src.repositories.askai_chat_analysis_cache import AskAIChatAnalysisCacheRepository
from src.repositories.chat_sessions import ChatSessionRepository
from src.repositories.clients import ClientRepository
from src.services.memory_service import get_mem0_memory
from src.services.postgres_chat_message_history import PostgresAsyncChatMessageHistory


class ChatAgentService:
    """
    Service for managing chat interactions between advisors and clients, including
    message history retrieval, deletion, and AI response generation using an async database connection.
    """

    def __init__(
        self,
        async_db_pool,
        llm,
        session_factory,
        askai_workflow_service,
    ):
        """
        Initialize the ChatAgentService.

        Args:
            async_db_pool: An asynchronous database connection pool for storing and retrieving chat history.
            llm: The language model client for generating AI responses.
            session_factory: SQLAlchemy async session factory.
            askai_workflow_service: Singleton AskAIWorkflowService used by the agent's run_analysis tool.
        """

        self.async_db_pool = async_db_pool
        self.session_factory = session_factory
        self.llm = llm
        self.askai_workflow_service = askai_workflow_service
        self.table_name = settings.CHAT_HISTORY_DB_TABLE_NAME
        self.system_prompt = ASK_AI_CHAT_AGENT_PROMPT

    def _get_message_history(
        self,
        session_id: str,
        conn,
    ) -> PostgresAsyncChatMessageHistory:
        """
        Create a PostgresAsyncChatMessageHistory instance for a given session.

        Args:
            session_id (str): The unique session identifier.

        Returns:
            PostgresAsyncChatMessageHistory: The message history object for the session.
        """

        return PostgresAsyncChatMessageHistory(
            self.table_name,
            session_id,
            async_connection=conn,
        )

    async def create_new_chat_session(self, advisor_id: int, client_id: int, db) -> int:
        """
        Create a new chat session for a specific advisor-client pair.

        Args:
            advisor_id (int): The advisor's ID.
            client_id (int): The client's ID.
            db: The database session.

        Returns:
            int: The id of the newly created chat session.
        """

        return await ChatSessionRepository(db).create(advisor_id, client_id)

    async def get_all_client_chats(self, advisor_id: int, db) -> list[dict]:
        """
        Retrieve all chat sessions for all clients of a specific advisor.

        Args:
            advisor_id (int): The advisor's ID.
            db: The database session.
        """
        return await ChatSessionRepository(db).get_all_for_advisor(advisor_id)

    async def get_chat_history(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        db,
    ):
        """
        Retrieve the chat history for a specific advisor-client pair.

        Args:
            advisor_id (int): The advisor's ID.
            client_id (int): The client's ID.
            chat_session_id (int): The chat session's ID.
            db: The database session.

        Returns:
            list: The list of chat messages for the session.
        """

        session_id = await self._get_session_uuid(
            advisor_id=advisor_id,
            client_id=client_id,
            chat_session_id=chat_session_id,
            db=db,
        )
        async with self.async_db_pool.connection() as conn:
            history = self._get_message_history(session_id, conn)
            return await history.aget_messages()

    async def update_chat_title(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        new_title: str,
        db,
    ) -> None:
        """Update the chat title for a specific chat session."""
        await ChatSessionRepository(db).update_title(
            advisor_id,
            client_id,
            chat_session_id,
            new_title,
        )

    async def get_chat_titles(self, advisor_id: int, client_id: int, db) -> list[dict]:
        """
        Retrieve all chat titles for a specific advisor-client pair.

        Args:
            advisor_id (int): The advisor's ID.
            client_id (int): The client's ID.
            db: The database session."""

        return await ChatSessionRepository(db).get_titles(advisor_id, client_id)

    async def _chat_history_table_exists(self) -> bool:
        """Check if the chat history table exists in the database."""
        async with self.async_db_pool.connection() as conn:
            cursor = await conn.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s)",
                [self.table_name],
            )
            row = await cursor.fetchone()
            return row[0]

    async def delete_chat_history(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        db,
    ):
        """
        Delete the chat history for a specific advisor-client pair.

        Args:
            advisor_id (int): The advisor's ID.
            client_id (int): The client's ID.
            chat_session_id (int): The chat session's ID.
            db: The database session.

        Returns:
            dict: A message indicating successful deletion.
        """

        # delete messages from the chat_history table if it exists
        if await self._chat_history_table_exists():
            session_id = await self._get_session_uuid(
                advisor_id=advisor_id,
                client_id=client_id,
                chat_session_id=chat_session_id,
                db=db,
            )
            async with self.async_db_pool.connection() as conn:
                history = self._get_message_history(session_id, conn)
                await history.aclear()

        # delete the chat session entry from chat_session table
        await ChatSessionRepository(db).delete_session(
            advisor_id,
            client_id,
            chat_session_id,
        )

    async def get_agent_response(
        self,
        user_message: str,
        advisor_id: int,
        chat_session_id: int,
        client_id: int,
        request_date: str | None = None,
    ):
        """
        Generate a streaming response from the AskAI agent.

        Yields JSON-lines in one of these shapes:
            {"type": "text",             "content": str}  — streamed text chunk
            {"type": "preference_saved"}         — mem0 preference stored notification
            {"type": "done", "turn_id": int | None}  — end of stream; turn_id is set if workflow ran

        Args:
            user_message: The advisor's input message.
            advisor_id: Authenticated advisor's user ID.
            client_id: The client currently in context for this conversation.
            chat_session_id: The chat session ID.
            request_date: ISO date (YYYY-MM-DD) from the X-Simulated-Date header,
                or None if not provided. Used as the default target date for
                stock analysis; overridden if the advisor's message names a date.
        """

        # --- Setup: ensure history table, handle chat title, get session UUID ---
        async with self.session_factory() as db:

            # create table in db to store chat messages
            async with self.async_db_pool.connection() as conn:
                await PostgresAsyncChatMessageHistory.acreate_tables(
                    conn,
                    self.table_name,
                )

            # add chat title if not already present
            chat_title = await ChatSessionRepository(db).get_chat_title(
                advisor_id,
                client_id,
                chat_session_id,
            )
            if chat_title is None:
                await self._insert_chat_title(
                    db,
                    advisor_id,
                    client_id,
                    chat_session_id,
                    user_message,
                    self.llm,
                )

            session_id = await self._get_session_uuid(
                advisor_id=advisor_id,
                client_id=client_id,
                chat_session_id=chat_session_id,
                db=db,
            )

        # --- Create agent for this request ---
        memory = get_mem0_memory()

        async with self.session_factory() as db:
            client_info = await ClientRepository(db).get_client_json_by_id(client_id)
            holdings_raw = await AccountHoldingRepository(
                db,
            ).get_with_security_by_client_id(
                client_id,
            )
            holdings = [
                {
                    "company_name": h["company_name"],
                    "quantity": float(h["quantity"]),
                    "cost_basis_total_usd": float(h["cost_basis_total_usd"]),
                }
                for h in holdings_raw
            ]

        if isinstance(client_info.get("profile"), dict):
            client_info["profile"] = {
                k: v
                for k, v in client_info["profile"].items()
                if k not in ("risk_preference", "has_interactive_preferences")
            }

        client_portfolio = {
            "client": client_info,
            "holdings": holdings,
        }

        # Generate turn_id for this workflow invocation before the agent runs.
        # turn_id = MAX(turn_id) + 1 over existing cache rows for this session.
        # If the workflow tool is never called, this value is never written to DB.
        async with self.session_factory() as db:
            cache_repo = AskAIChatAnalysisCacheRepository(db)
            turn_id = await cache_repo.get_next_turn_id(
                uuid_module.UUID(session_id),
            )

        agent = get_ask_ai_agent(
            llm=self.llm,
            askai_workflow_service=self.askai_workflow_service,
            session_factory=self.session_factory,
            user_id=advisor_id,
            client_id=client_id,
            client_portfolio=client_portfolio,
            memory=memory,
            session_id=session_id,
            turn_id=turn_id,
            request_date=request_date,
        )

        # --- Stream events ---
        async with self.async_db_pool.connection() as conn:
            history = self._get_message_history(session_id, conn)
            past_messages = await history.aget_messages()
            past_messages = past_messages[-8:]

            messages = [
                SystemMessage(content=[{"type": "text", "text": self.system_prompt}]),
                *past_messages,
                HumanMessage(content=[{"type": "text", "text": user_message}]),
            ]

            full_ai_response = ""
            workflow_was_called = False
            tool_depth = 0  # tracks nesting depth; >0 means inside a tool call
            agent_display_names = {
                "news_synthesizer": "News",
                "stock_analysis": "Stock",
                "sec_filing_analysis": "SEC Filings",
            }

            print(
                f"[askai] new turn: session={session_id} client={client_id} "
                f"advisor={advisor_id} message={user_message}",
            )

            async for event in agent.astream_events(
                {"messages": messages},
                version="v2",
            ):
                kind = event["event"]
                name = event.get("name", "")
                if kind not in ("on_chat_model_stream",):
                    print(f"[astream_events] kind={kind} name={name}")

                if kind == "on_tool_start":
                    tool_depth += 1
                    if name == "run_analysis":
                        workflow_was_called = True
                elif kind == "on_tool_end":
                    tool_depth = max(0, tool_depth - 1)
                    if name in ("save_client_preference", "clear_client_preferences"):
                        output = event.get("data", {}).get("output", "")
                        content = (
                            output.content
                            if hasattr(output, "content")
                            else str(output)
                        )
                        if content.startswith("{"):
                            status = json.loads(content).get("status")
                            if status in ("changed", "cleared"):
                                yield json.dumps({"type": "memory_saved"}) + "\n"
                elif kind == "on_chain_start" and name in agent_display_names:
                    # Notify frontend which analysis agent just started
                    yield json.dumps(
                        {"type": "analyzing", "agent": agent_display_names[name]},
                    ) + "\n"
                elif kind == "on_chat_model_stream":
                    # Only stream the outer agent's response, not inner workflow LLM calls
                    if tool_depth > 0:
                        continue
                    chunk = event["data"]["chunk"]
                    if chunk.content:
                        full_ai_response += chunk.content
                        yield json.dumps(
                            {"type": "text", "content": chunk.content},
                        ) + "\n"

            yield json.dumps(
                {
                    "type": "done",
                    "turn_id": turn_id if workflow_was_called else None,
                },
            ) + "\n"

            ai_kwargs = {"turn_id": turn_id} if workflow_was_called else {}
            await history.aadd_messages(
                [
                    HumanMessage(content=user_message),
                    AIMessage(
                        content=full_ai_response,
                        additional_kwargs=ai_kwargs,
                    ),
                ],
            )

    async def _get_session_uuid(
        self,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        db,
    ) -> str:
        """
        Retrieve the session UUID for a given advisor-client pair.

        Args:
            advisor_id (int): The advisor's ID.
            client_id (int): The client's ID.
            chat_session_id (int): The chat session's ID.
            db: The database session.

        Returns:
            str: The session UUID.

        Raises:
            Exception: If no chat session is found for the advisor-client pair.
        """

        return await ChatSessionRepository(db).get_uuid(
            advisor_id,
            client_id,
            chat_session_id,
        )

    async def _insert_chat_title(
        self,
        db,
        advisor_id: int,
        client_id: int,
        chat_session_id: int,
        user_message: str,
        llm,
    ):
        """Insert a default chat title into the chat_session table."""

        messages = [
            SystemMessage(
                content=[{"type": "text", "text": CHAT_TITLE_GENERATION_PROMPT}],
            ),
            HumanMessage(content=[{"type": "text", "text": user_message}]),
        ]

        agent_response = await llm.ainvoke(messages)

        chat_title = agent_response.content.strip(" \t\n\r.\"'!,:;()[]{}-")

        await ChatSessionRepository(db).update_title(
            advisor_id,
            client_id,
            chat_session_id,
            chat_title,
        )
