from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class UserWithClientCount(UserResponse):
    client_count: int


class UsersListResponse(BaseModel):
    page: int
    page_size: int
    total: int
    users: list[UserResponse]


class UserSearchResponse(BaseModel):
    query: str
    users: list[UserResponse]
    total_results: int


class AdvisorsWithClientCountsResponse(BaseModel):
    advisors: list[UserWithClientCount]
    total_advisors: int
