from datetime import datetime

from fastapi import Request


async def add_user_id_to_request(request: Request, call_next):
    user_id = request.headers.get("X-User-ID")
    if user_id:
        request.state.user_id = int(user_id)
    response = await call_next(request)
    return response


async def add_simulated_date_to_request(request: Request, call_next):
    simulated_date = request.headers.get("X-Simulated-Date")
    if simulated_date:
        request.state.simulated_date = datetime.fromisoformat(simulated_date)
    response = await call_next(request)
    return response
