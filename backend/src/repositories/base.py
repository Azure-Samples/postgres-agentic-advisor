from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TypeVar

T = TypeVar("T")
ID = TypeVar("ID")


class BaseRepository(ABC):
    @abstractmethod
    async def add(self, entity: T) -> T:
        """
        Add a new entity to the repository.

        Returns:
            The added entity (may include generated ID)
        """
        pass

    @abstractmethod
    async def get_by_id(self, id: ID) -> T | None:
        """
        Retrieve an entity by its ID.

        Returns:
            Entity if found, None otherwise
        """
        pass

    @abstractmethod
    async def update(self, entity: T) -> T:
        """
        Update an existing entity.

        Returns:
            Updated entity

        Raises:
            EntityNotFoundError: If entity doesn't exist
        """
        pass

    @abstractmethod
    async def delete(self, id: ID) -> bool:
        """
        Delete an entity by its ID.

        Returns:
            True if deleted, False if not found
        """
        pass
