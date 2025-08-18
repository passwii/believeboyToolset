from flask import Blueprint, render_template
from apps.daily_report import daily_report_bp
from apps.monthly_report import monthly_report_bp
from apps.product_analysis import product_analysis_bp

dataset_bp = Blueprint('dataset', __name__)

@dataset_bp.route('/daily-report')
def daily_report():
    return render_template('dataset/daily_report.html')

@dataset_bp.route('/monthly-report')
def monthly_report():
    return render_template('dataset/monthly_report.html')

@dataset_bp.route('/product-analysis')
def product_analysis():
    return render_template('dataset/product_analysis.html')

@dataset_bp.route('/project-analysis')
def project_analysis():
    return render_template('dataset/project_analysis.html')

# 注册子蓝图
dataset_bp.register_blueprint(daily_report_bp)
dataset_bp.register_blueprint(monthly_report_bp)
dataset_bp.register_blueprint(product_analysis_bp)