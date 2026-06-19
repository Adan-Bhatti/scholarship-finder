from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_matches: int
    saved_count: int
    expiring_soon_count: int
    total_funding_potential: float
