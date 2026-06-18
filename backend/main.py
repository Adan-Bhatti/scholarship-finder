from fastapi import FastAPI
from backend.routers import auth, profile, scholarships, health

app = FastAPI(
    title="Scholarship Finder AI",
    description="Backend API for the AI-powered Scholarship Finder",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(scholarships.router)



