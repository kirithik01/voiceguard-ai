from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "model": settings.MODEL_NAME,
        "thresholds": {
            "low_risk": settings.LOW_RISK_THRESHOLD,
            "high_risk": settings.HIGH_RISK_THRESHOLD
        }
    }
