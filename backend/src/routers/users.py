from fastapi import APIRouter, HTTPException, Query
from src.core.dependencies import DBSession
from src.repositories.users import UserRepository
from src.schemas import (
    AdvisorsWithClientCountsResponse,
    UserResponse,
    UserSearchResponse,
    UsersListResponse,
)

router = APIRouter(
    prefix="/advisors",
    tags=["advisors"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DBSession):
    """Get a specific user by ID."""
    user = await UserRepository(db).get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=UsersListResponse)
async def get_users(
    db: DBSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    """Get paginated users."""
    total, users = await UserRepository(db).get_paginated(
        page=page,
        page_size=page_size,
    )

    return UsersListResponse(
        page=page,
        page_size=page_size,
        total=total,
        users=users,
    )


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: DBSession):
    """Get a user by email address."""
    user = await UserRepository(db).get_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/search/", response_model=UserSearchResponse)
async def search_users(
    db: DBSession,
    q: str = Query(..., min_length=2),
):
    """Search users by name or email."""
    users = await UserRepository(db).search_by_name_or_email(q)
    return UserSearchResponse(
        query=q,
        users=users,
        total_results=len(users),
    )


@router.get("/with-client-counts/", response_model=AdvisorsWithClientCountsResponse)
async def get_advisors_with_client_counts(db: DBSession):
    """Get all advisor users with their client counts."""
    advisors = await UserRepository(db).get_advisors_with_clients_count()
    return AdvisorsWithClientCountsResponse(
        advisors=advisors,
        total_advisors=len(advisors),
    )
