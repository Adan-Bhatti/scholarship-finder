from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from backend.routers import auth, profile, scholarships, health, ai
from backend.core.exceptions import BaseAPIException
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Scholarship Finder AI",
    description="Backend API for the AI-powered Scholarship Finder",
    version="1.0.0",
)

@app.exception_handler(BaseAPIException)
async def custom_api_exception_handler(request: Request, exc: BaseAPIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "detail": exc.detail},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "detail": "An unexpected error occurred."},
    )

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(scholarships.router)
app.include_router(ai.router)




