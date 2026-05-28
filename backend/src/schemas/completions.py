from datetime import datetime

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str
    turn_id: int | None = None


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessage]


class ChatTitleResponse(BaseModel):
    chat_session_id: int
    chat_title: str
    date: datetime


class ClientChatResponse(BaseModel):
    client_id: int
    chat_session_id: int
    client_name: str
    chat_title: str


class AllClientChatsResponse(BaseModel):
    chats: list[ClientChatResponse]


class ChatTitlesListResponse(BaseModel):
    chat_titles: list[ChatTitleResponse]


class ChatSessionCreateResponse(BaseModel):
    chat_session_id: int
