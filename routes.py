from flask import Blueprint, render_template, send_from_directory
from auth import login_required

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index.html')
@login_required
def home():
    return render_template('index.html')

# 工具集
@main.route('/exchange-rate')
@login_required
def exchange_rate():
    return render_template('toolset/exchange_rate.html')


@main.route('/resize-image')
@login_required
def resize_image():
    return render_template('toolset/resize_image.html')

# 数据集
@main.route('/daily-report')
@login_required
def daily_report():
    return render_template('dataset/daily_report.html')

@main.route('/monthly-report')
@login_required
def monthly_report():
    return render_template('dataset/monthly_report.html')



@main.route('/project-analysis')
@login_required
def project_analysis():
    return render_template('dataset/project_analysis.html')



# 添加帮助页面
@main.route('/help/payment_delay')
@login_required
def payment_delay():
    return render_template('help/payment_report_help.html')

@main.route('/help/payment_report')
@login_required
def payment_report():
    return render_template('help/payment_report_help.html')

