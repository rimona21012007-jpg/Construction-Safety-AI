from fastapi import APIRouter
from app.ml.model_loader import ml_manager

router = APIRouter()

@router.get("/model-info")
def get_model_info():
    return ml_manager.get_model_info()
