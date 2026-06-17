from fastapi import FastAPI

app = FastAPI(
    title="Scholarship Finder AI",
    description="Backend API for the AI-powered Scholarship Finder",
    version="1.0.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Scholarship Finder AI"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
