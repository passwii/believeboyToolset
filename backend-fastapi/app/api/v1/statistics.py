from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import User, Shop, Log
from app.api.v1.auth import get_current_user

router = APIRouter()


class ReportStatistics(BaseModel):
    daily_reports: int = 0
    monthly_reports: int = 0
    product_analysis: int = 0


class SystemStatus(BaseModel):
    total_users: int
    total_shops: int
    total_logs: int


class StatisticsResponse(BaseModel):
    success: bool = True
    data: dict


@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: get_current_user = Depends(get_current_user)
):
    total_users = db.query(User).count()
    total_shops = db.query(Shop).count()
    total_logs = db.query(Log).count()
    
    return StatisticsResponse(
        success=True,
        data={
            "report_statistics": {
                "daily_reports": 0,
                "monthly_reports": 0,
                "product_analysis": 0
            },
            "system_status": {
                "total_users": total_users,
                "total_shops": total_shops,
                "total_logs": total_logs
            }
        }
    )


@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "BelieveBoy API"}
