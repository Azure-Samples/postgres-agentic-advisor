from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from src.configs.config import settings
from src.core.exceptions import DatabaseAuthenticationError
from src.core.middlewares import add_simulated_date_to_request, add_user_id_to_request
from src.lifespan_manager import lifespan
from src.routers import (
    account_holdings,
    alerts,
    clients,
    completions,
    dashboard,
    reset,
    securities,
    security_prices,
    users,
)


def custom_openapi():
    """
    Generates a custom OpenAPI schema for the FastAPI application.

    If the schema is already generated and cached in `app.openapi_schema`, it returns that.
    Otherwise, it generates a new schema using FastAPI's `get_openapi`, adds a custom header
    (`X-User-Id`, `X-Simulated-Date`) as a required parameter to all endpoints, and stores it back in
    `app.openapi_schema` for reuse.

    The custom header is useful for emulating user session.
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    custom_headers = [
        {
            "name": "X-User-Id",
            "in": "header",
            "required": True,
            "description": "Simulates a user session by passing a user ID in the header.",
            "schema": {"type": "integer"},
        },
        {
            "name": "X-Simulated-Date",
            "in": "header",
            "required": False,
            "description": "Simulates the app behavior on a specific date by passing a date in the header (format: YYYY-MM-DD).",
            "schema": {"type": "string", "format": "date"},
        },
    ]
    # Add the custom header to all paths
    for path in openapi_schema["paths"].values():
        for method in path:
            path[method].setdefault("parameters", [])
            path[method]["parameters"].extend(custom_headers)
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app = FastAPI(
    title="Agentic Advisor API",
    description="Provides APIs for the Agentic Advisor application - Investment portfolio management system",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)


@app.exception_handler(DatabaseAuthenticationError)
async def db_auth_exception_handler(request: Request, exc: DatabaseAuthenticationError):
    return JSONResponse(
        status_code=401,
        content={
            "detail": "Azure AD authentication failed. Please re-authenticate using 'az login'.",
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.openapi = custom_openapi
app.middleware("http")(add_user_id_to_request)
app.middleware("http")(add_simulated_date_to_request)

app.include_router(account_holdings.router)
app.include_router(clients.router)
app.include_router(dashboard.router)
app.include_router(securities.router)
app.include_router(security_prices.router)
app.include_router(users.router)
app.include_router(completions.router)
app.include_router(alerts.router)
app.include_router(reset.router)


@app.get("/")
async def get():
    """API welcome message."""
    return {"message": "Welcome to the Agentic Advisor API!"}
