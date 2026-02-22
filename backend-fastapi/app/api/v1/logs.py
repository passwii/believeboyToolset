from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, Log
from app.api.v1.auth import get_current_user

router = APIRouter()


class LogResponse(BaseModel):
    id: int
    action: str
    details: Optional[str] = None
    level: str
    log_type: str
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LogsResponse(BaseModel):
    success: bool = True
    data: List[LogResponse]
    total: int


class MessageResponse(BaseModel):
    success: bool = True
    message: str


@router.get("", response_model=LogsResponse)
def get_logs(
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    query = db.query(Log).order_by(Log.created_at.desc())
    total = query.count()
    logs = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return LogsResponse(
        success=True,
        data=logs,
        total=total
    )


@router.post("/clear", response_model=MessageResponse)
def clear_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    db.query(Log).delete()
    db.commit()
    
    return MessageResponse(success=True, message="日志已清空")


@router.delete("/all", response_model=MessageResponse)
def delete_all_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    db.query(Log).delete()
    db.commit()
    
    return MessageResponse(success=True, message="所有日志已删除")
