from pydantic import BaseModel, ConfigDict


class ChatSessionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    advisor_id: int
    client_id: int
    chat_history: list  # Changed from dict to list
    updated_at: str
