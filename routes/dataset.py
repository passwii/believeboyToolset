from flask import Blueprint, render_template
from apps.daily_report import daily_report_bp
from apps.monthly_report import monthly_report_bp
from apps.product_analysis import product_analysis_bp
from auth import login_required
import pandas as pd
import os

dataset_bp = Blueprint('dataset', __name__)

@dataset_bp.route('/daily-report')
@login_required
def daily_report():
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
    return render_template('dataset/timeline.html')

# 注册子蓝图
dataset_bp.register_blueprint(daily_report_bp)
dataset_bp.register_blueprint(monthly_report_bp)
dataset_bp.register_blueprint(product_analysis_bp, url_prefix='/product-analysis')