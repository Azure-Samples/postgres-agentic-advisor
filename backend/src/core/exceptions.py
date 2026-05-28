class DatabaseConnectionError(Exception):
    """Raised when there is a connection error with the database."""

    pass


class DatabaseAuthenticationError(Exception):
    """Raised when there is an authentication error with the database."""

    pass


class TokenProviderError(Exception):
    """Raised when there is an error obtaining a token from the token provider."""

    pass
