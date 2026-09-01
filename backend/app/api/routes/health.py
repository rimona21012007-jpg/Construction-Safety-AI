from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }
