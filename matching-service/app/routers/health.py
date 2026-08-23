"""
Health check router for the matching service.
"""
from fastapi import APIRouter
import time

router = APIRouter()
_start_time = time.time()


@router.get("/health", tags=["Health"])
async def health_check():
    """Returns service health status and uptime."""
    uptime_seconds = round(time.time() - _start_time, 2)
    return {
        "success": True,
        "service": "matching",
        "status": "healthy",
        "uptime_seconds": uptime_seconds,
    }
