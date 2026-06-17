from fastapi import FastAPI
from backend.routers import auth, profile

app = FastAPI(
    title="Scholarship Finder AI",
    description="Backend API for the AI-powered Scholarship Finder",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(profile.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Scholarship Finder AI"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


