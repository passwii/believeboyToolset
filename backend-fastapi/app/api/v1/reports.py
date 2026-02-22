from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import datetime
import pandas as pd

from app.core.database import get_db
from app.models.models import User
from app.api.v1.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class FileUploadResponse(BaseModel):
    success: bool
    filename: Optional[str] = None
    file_path: Optional[str] = None
    message: Optional[str] = None


class ReportResponse(BaseModel):
    success: bool = True
    data: dict


@router.post("/daily-report/upload-file", response_model=FileUploadResponse)
async def upload_daily_report(
    file: UploadFile = File(...),
    project: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "daily", project)
    os.makedirs(upload_path, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{project}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_path, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return FileUploadResponse(
        success=True,
        filename=filename,
        file_path=file_path,
        message="文件上传成功"
    )


@router.post("/daily-report", response_model=ReportResponse)
async def process_daily_report(
    project: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "daily", project)
    
    try:
        files = os.listdir(upload_path) if os.path.exists(upload_path) else []
        if not files:
            return ReportResponse(success=True, data={"html": "<p>暂无上传文件</p>"})
        
        html = f"""
        <div class="report-result">
            <h3>日报数据 - {project}</h3>
            <p>已处理文件数: {len(files)}</p>
            <ul>
                {''.join([f'<li>{f}</li>' for f in files[:5]])}
            </ul>
        </div>
        """
        return ReportResponse(success=True, data={"html": html})
    except Exception as e:
        return ReportResponse(success=True, data={"html": f"<p>处理出错: {str(e)}</p>"})


@router.post("/monthly-report/upload-file", response_model=FileUploadResponse)
async def upload_monthly_report(
    file: UploadFile = File(...),
    project: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "monthly", project)
    os.makedirs(upload_path, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{project}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_path, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return FileUploadResponse(
        success=True,
        filename=filename,
        file_path=file_path,
        message="文件上传成功"
    )


@router.post("/monthly-report", response_model=ReportResponse)
async def process_monthly_report(
    project: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "monthly", project)
    
    try:
        files = os.listdir(upload_path) if os.path.exists(upload_path) else []
        html = f"""
        <div class="report-result">
            <h3>月报数据 - {project}</h3>
            <p>已处理文件数: {len(files)}</p>
        </div>
        """
        return ReportResponse(success=True, data={"html": html})
    except Exception as e:
        return ReportResponse(success=True, data={"html": f"<p>处理出错: {str(e)}</p>"})


@router.post("/product-analysis/upload-file", response_model=FileUploadResponse)
async def upload_product_analysis(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_types = ["business", "payment", "advertising"]
    if file_type not in valid_types:
        raise HTTPException(status_code=400, detail="无效的文件类型")
    
    upload_path = os.path.join(UPLOAD_DIR, "product", file_type)
    os.makedirs(upload_path, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{file_type}_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_path, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return FileUploadResponse(
        success=True,
        filename=filename,
        file_path=file_path,
        message="文件上传成功"
    )


@router.post("/product-analysis/submit", response_model=ReportResponse)
async def submit_product_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product_path = os.path.join(UPLOAD_DIR, "product")
    
    business_path = os.path.join(product_path, "business")
    payment_path = os.path.join(product_path, "payment")
    advertising_path = os.path.join(product_path, "advertising")
    
    business_files = os.listdir(business_path) if os.path.exists(business_path) else []
    payment_files = os.listdir(payment_path) if os.path.exists(payment_path) else []
    advertising_files = os.listdir(advertising_path) if os.path.exists(advertising_path) else []
    
    html = f"""
    <div class="report-result">
        <h3>产品分析结果</h3>
        <p>业务报告: {len(business_files)} 个文件</p>
        <p>付款报告: {len(payment_files)} 个文件</p>
        <p>广告报表: {len(advertising_files)} 个文件</p>
    </div>
    """
    return ReportResponse(success=True, data={"html": html})


@router.post("/yumai-analysis/upload-file", response_model=FileUploadResponse)
async def upload_yumai_analysis(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "yumai")
    os.makedirs(upload_path, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"yumai_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_path, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return FileUploadResponse(
        success=True,
        filename=filename,
        file_path=file_path,
        message="文件上传成功"
    )


@router.post("/yumai-analysis/submit", response_model=ReportResponse)
async def submit_yumai_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    upload_path = os.path.join(UPLOAD_DIR, "yumai")
    
    files = os.listdir(upload_path) if os.path.exists(upload_path) else []
    
    html = f"""
    <div class="report-result">
        <h3>优麦云分析结果</h3>
        <p>已处理文件数: {len(files)}</p>
    </div>
    """
    return ReportResponse(success=True, data={"html": html})
