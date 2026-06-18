from fastapi import APIRouter

router = APIRouter(tags=["system"])

@router.get("/")
def read_root():
    return {"message": "Welcome to Scholarship Finder AI"}

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "scholarship-finder-api"}
