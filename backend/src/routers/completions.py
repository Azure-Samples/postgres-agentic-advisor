import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from phoenix.client import AsyncClient as PhoenixAsyncClient
from src.configs.config import settings
from src.core.dependencies import DBSession
from src.lifespan_manager import get_chatbot_agent_service
from src.repositories.askai_chat_analysis_cache import AskAIChatAnalysisCacheRepository
from src.repositories.chat_sessions import ChatSessionRepository
from src.schemas.completions import (
    AllClientChatsResponse,
    ChatHistoryResponse,
    ChatMessage,
    ChatSessionCreateResponse,
    ChatTitlesListResponse,
)
from src.services.askai_trace_parser_service import AskAITraceParser

router = APIRouter(
    prefix="/completions",
    tags=["completions"],
    responses={404: {"description": "Not found"}},
)


@router.get("/all_client_chats", response_model=AllClientChatsResponse)
async def get_all_client_chats(
    db: DBSession,
    request: Request,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Fetch all chat sessions for all clients of the advisor."""

    advisor_id = request.state.user_id

    all_client_chats = await chat_agent.get_all_client_chats(
        advisor_id=advisor_id,
        db=db,
    )

    return AllClientChatsResponse(chats=all_client_chats)


@router.patch("/chat/{chat_session_id}/title")
async def update_chat_title(
    chat_session_id: int,
    client_id: int,
    new_title: str,
    db: DBSession,
    request: Request,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Update the title of a specific chat session."""
    advisor_id = request.state.user_id
    try:
        await chat_agent.update_chat_title(
            advisor_id=advisor_id,
            client_id=client_id,
            chat_session_id=chat_session_id,
            new_title=new_title,
            db=db,
        )
        return {"chat_session_id": chat_session_id, "chat_title": new_title}
    except Exception as e:
        if "No chat session found" in str(e):
            raise HTTPException(
                status_code=404,
                detail="No chat session found with this ID.",
            )
        raise HTTPException(status_code=500, detail="Error updating chat title.")


@router.get("/chat/titles")
async def chat_titles(
    db: DBSession,
    request: Request,
    client_id: int,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Fetch chat titles based"""

    advisor_id = request.state.user_id

    chat_titles = await chat_agent.get_chat_titles(
        advisor_id=advisor_id,
        client_id=client_id,
        db=db,
    )

    return ChatTitlesListResponse(chat_titles=chat_titles)


@router.get("/chat/{chat_session_id}/agents-graph")
async def get_agents_graph(
    chat_session_id: int,
    client_id: int,
    db: DBSession,
    request: Request,
    turn_id: Optional[int] = None,
):
    """Return the agents graph for a chat session, sourced from Phoenix Arize traces."""
    advisor_id = request.state.user_id

    # Fetch session UUID for cache lookup
    try:
        session_uuid_str = await ChatSessionRepository(db).get_uuid(
            advisor_id,
            client_id,
            chat_session_id,
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    session_uuid = uuid.UUID(session_uuid_str)

    cache_repo = AskAIChatAnalysisCacheRepository(db)
    trace_ids_by_type = await cache_repo.get_trace_ids_for_session(
        session_uuid,
        turn_id=turn_id,
    )

    if not trace_ids_by_type:
        raise HTTPException(
            status_code=404,
            detail="No trace data found for this session yet.",
        )

    phoenix_client = PhoenixAsyncClient(base_url=settings.PHOENIX_BASE_URL)
    parsed = await AskAITraceParser(
        phoenix_client=phoenix_client,
        trace_ids_by_type=trace_ids_by_type,
    ).parse()
    return {
        "agents_graph": parsed["graph"],
        "agent_outputs": parsed["agent_outputs"],
    }


@router.post("/chat/session/create")
async def create_new_chat_session(
    client_id: int,
    db: DBSession,
    request: Request,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Create a new chat session for a specific advisor-client pair."""

    advisor_id = request.state.user_id

    chat_session_id = await chat_agent.create_new_chat_session(
        advisor_id=advisor_id,
        client_id=client_id,
        db=db,
    )

    return ChatSessionCreateResponse(chat_session_id=chat_session_id)


@router.post("/chat/stream")
async def generate_chat_completions(
    request: Request,
    client_id: int,
    chat_session_id: int,
    user_message: str,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Generate chat completions using Azure OpenAI."""

    simulated_date = getattr(request.state, "simulated_date", None)
    request_date = simulated_date.date().isoformat() if isinstance(simulated_date, datetime) else None

    async def token_generator():
        async for token in chat_agent.get_agent_response(
            user_message=user_message,
            advisor_id=request.state.user_id,
            client_id=client_id,
            chat_session_id=chat_session_id,
            request_date=request_date,
        ):
            yield token

    return StreamingResponse(token_generator(), media_type="text/event-stream")


@router.get("/history")
async def get_chat_history(
    db: DBSession,
    request: Request,
    client_id: int,
    chat_session_id: int,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Retrieve chat history for a specific advisor-client pair."""

    try:
        advisor_id = request.state.user_id

        response = await chat_agent.get_chat_history(
            advisor_id=advisor_id,
            client_id=client_id,
            chat_session_id=chat_session_id,
            db=db,
        )

        messages = [
            ChatMessage(
                role=msg.type,
                content=msg.content if isinstance(msg.content, str) else "",
                turn_id=(msg.additional_kwargs or {}).get("turn_id"),
            )
            for msg in response
        ]

        return ChatHistoryResponse(messages=messages)
    except Exception as e:
        if "No chat session found" in str(e):
            raise HTTPException(
                status_code=404,
                detail="No chat session found with this ID.",
            )
        # For other errors, re-raise or handle generically
        raise HTTPException(status_code=500, detail="Error retrieving chat history.")


@router.delete("/history")
async def delete_chat_history(
    db: DBSession,
    request: Request,
    client_id: int,
    chat_session_id: int,
    chat_agent=Depends(get_chatbot_agent_service),
):
    """Delete chat history for a specific advisor-client pair."""

    advisor_id = request.state.user_id

    try:
        await chat_agent.delete_chat_history(
            advisor_id=advisor_id,
            client_id=client_id,
            chat_session_id=chat_session_id,
            db=db,
        )

        return Response(status_code=204)
    except Exception as e:

        if "No chat session found" in str(e):
            raise HTTPException(
                status_code=404,
                detail="No chat session found with this ID.",
            )
        # For other errors, re-raise or handle generically
        raise HTTPException(status_code=500, detail="Error deleting chat history.")
