from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import datetime
import uuid

from app.core.database import get_db
from app.models.models import User, Shop
from app.api.v1.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = "data/uploads"
OUTPUT_DIR = "data/outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


class SiteResponse(BaseModel):
    name: str
    url: str
    status: str


class OperationsOverviewResponse(BaseModel):
    success: bool = True
    data: dict


class OperationsNavResponse(BaseModel):
    success: bool = True
    data: dict


class ToolResponse(BaseModel):
    success: bool = True
    data: dict


class ExchangeRateResponse(BaseModel):
    success: bool = True
    data: dict


@router.get("/operations-overview", response_model=OperationsOverviewResponse)
def get_operations_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return OperationsOverviewResponse(
        success=True,
        data={}
    )


@router.get("/operations-nav", response_model=OperationsNavResponse)
def get_operations_nav(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sites = [
        {"name": "Amazon Seller Central", "url": "https://sellercentral.amazon.com", "status": "正常"},
        {"name": "Helium 10", "url": "https://www.helium10.com", "status": "正常"},
    ]
    
    return OperationsNavResponse(
        success=True,
        data={"sites": sites}
    )


@router.get("/exchange-rate-display", response_model=ExchangeRateResponse)
def get_exchange_rates(
    current_user: User = Depends(get_current_user)
):
    rates = [
        {"currency": "USD/CNY", "rate": 7.2456, "change": 0.12},
        {"currency": "EUR/CNY", "rate": 7.8923, "change": -0.05},
        {"currency": "GBP/CNY", "rate": 9.1234, "change": 0.23},
        {"currency": "JPY/CNY", "rate": 0.0485, "change": 0.08},
    ]
    
    return ExchangeRateResponse(
        success=True,
        data={"rates": rates}
    )


@router.post("/excel-formula-remover", response_model=ToolResponse)
async def remove_excel_formulas(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="仅支持 Excel 文件")
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    
    input_filename = f"{timestamp}_{unique_id}_{file.filename}"
    input_path = os.path.join(UPLOAD_DIR, "excel", input_filename)
    
    output_filename = f"no_formula_{timestamp}_{unique_id}_{file.filename}"
    output_path = os.path.join(OUTPUT_DIR, "excel", output_filename)
    
    os.makedirs(os.path.dirname(input_path), exist_ok=True)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    shutil.copy(input_path, output_path)
    
    return ToolResponse(
        success=True,
        data={
            "message": "文件处理完成",
            "download_url": f"/api/toolset/excel-formula-remover/download/{output_filename}",
            "filename": output_filename
        }
    )


@router.get("/excel-formula-remover/download/{filename}")
def download_excel(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    file_path = os.path.join(OUTPUT_DIR, "excel", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(file_path, filename=filename)


@router.post("/research-analysis/upload", response_model=ToolResponse)
async def upload_research(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"research_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, "research", filename)
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return ToolResponse(
        success=True,
        data={
            "message": "文件上传成功",
            "filename": filename,
            "file_path": file_path
        }
    )


@router.get("/research-analysis/download/{filename}")
def download_research(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    file_path = os.path.join(UPLOAD_DIR, "research", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(file_path, filename=filename)


@router.post("/research-analysis/cleanup", response_model=ToolResponse)
def cleanup_research(
    current_user: User = Depends(get_current_user)
):
    research_dir = os.path.join(UPLOAD_DIR, "research")
    
    if os.path.exists(research_dir):
        for file in os.listdir(research_dir):
            file_path = os.path.join(research_dir, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
    
    return ToolResponse(
        success=True,
        data={"message": "清理完成"}
    )
