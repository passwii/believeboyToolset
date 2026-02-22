from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, Shop
from app.api.v1.auth import get_current_user

router = APIRouter()


class ShopResponse(BaseModel):
    id: int
    name: str
    url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ShopCreate(BaseModel):
    name: str
    url: Optional[str] = None


class ShopUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None


class MessageResponse(BaseModel):
    success: bool = True
    message: str


@router.get("", response_model=List[ShopResponse])
def get_shops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shops = db.query(Shop).all()
    return shops


@router.post("/add", response_model=ShopResponse)
def create_shop(
    shop: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    existing_shop = db.query(Shop).filter(Shop.name == shop.name).first()
    if existing_shop:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="商店名称已存在"
        )
    
    db_shop = Shop(name=shop.name, url=shop.url)
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    
    return db_shop


@router.post("/update/{shop_id}", response_model=ShopResponse)
def update_shop(
    shop_id: int,
    shop: ShopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    db_shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not db_shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商店不存在"
        )
    
    if shop.name is not None:
        db_shop.name = shop.name
    if shop.url is not None:
        db_shop.url = shop.url
    
    db.commit()
    db.refresh(db_shop)
    
    return db_shop


@router.delete("/{shop_id}", response_model=MessageResponse)
def delete_shop(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商店不存在"
        )
    
    db.delete(shop)
    db.commit()
    
    return MessageResponse(success=True, message="商店删除成功")


@router.get("/nav", response_model=List[ShopResponse])
def get_shops_nav(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shops = db.query(Shop).all()
    return shops
