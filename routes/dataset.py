from flask import Blueprint, render_template
from apps.daily_report import daily_report_bp
from apps.monthly_report import monthly_report_bp
from apps.product_analysis import product_analysis_bp
from core.auth import login_required
from core.log_service import LogService
import pandas as pd
import os

dataset_bp = Blueprint('dataset', __name__)

@dataset_bp.route('/daily-report')
@login_required
def daily_report():
    # 记录访问日报页面日志
    LogService.log(
        action="访问日报页面",
        resource="数据集",
        log_type="user",
        level="info"
    )
    
    # 读取项目名称
    projects = []
    projects_file = os.path.join('apps', 'model_file', 'projects.csv')
    if os.path.exists(projects_file):
        df = pd.read_csv(projects_file)
        projects = df['项目名称'].tolist()
    
    return render_template('dataset/daily_report.html', projects=projects)

@dataset_bp.route('/monthly-report')
@login_required
def monthly_report():
    # 记录访问月报页面日志
    LogService.log(
        action="访问月报页面",
        resource="数据集",
        log_type="user",
        level="info"
    )
    
    # 读取项目名称
    projects = []
    projects_file = os.path.join('apps', 'model_file', 'projects.csv')
    if os.path.exists(projects_file):
        df = pd.read_csv(projects_file)
        projects = df['项目名称'].tolist()
    
    return render_template('dataset/monthly_report.html', projects=projects)

@dataset_bp.route('/product-analysis')
@login_required
def product_analysis_page():
    # 记录访问产品分析页面日志
    LogService.log(
        action="访问产品分析页面",
        resource="数据集",
        log_type="user",
        level="info"
    )
    
    # 读取项目名称
    projects = []
    projects_file = os.path.join('apps', 'model_file', 'projects.csv')
    if os.path.exists(projects_file):
        df = pd.read_csv(projects_file)
        projects = df['项目名称'].tolist()
    
    return render_template('dataset/product_analysis.html', projects=projects)

@dataset_bp.route('/timeline')
@login_required
def timeline():
    # 记录访问时间线页面日志
    LogService.log(
        action="访问时间线页面",
        resource="数据集",
        log_type="user",
        level="info"
    )
    return render_template('dataset/timeline.html')

# 注册子蓝图
dataset_bp.register_blueprint(daily_report_bp)
dataset_bp.register_blueprint(monthly_report_bp)
dataset_bp.register_blueprint(product_analysis_bp, url_prefix='/product-analysis')