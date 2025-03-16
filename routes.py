from flask import Blueprint, render_template, send_from_directory

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index.html')
def home():
    return render_template('index.html')

# 工具集
@main.route('/exchange-rate')
def exchange_rate():
    return render_template('toolset/exchange_rate.html')

@main.route('/mic-pdf')
def mic_pdf():
    return render_template('toolset/mic_pdf.html')

@main.route('/fba-revise-pdf')
def fba_revise_pdf():
    return render_template('toolset/fba_revise_pdf.html')

@main.route('/resize-image')
def resize_image():
    return render_template('toolset/resize_image.html')

# 数据集
@main.route('/daily-report')
def daily_report():
    return render_template('dataset/daily_report.html')

@main.route('/weekly-report')
def weekly_report():
    return render_template('dataset/weekly_report.html')

@main.route('/monthly-report')
def monthly_report():
    return render_template('dataset/monthly_report.html')

@main.route('/product-analysis')
def product_analysis():
    return render_template('dataset/product_analysis.html')

@main.route('/project-analysis')
def project_analysis():
    return render_template('dataset/project_analysis.html')



# 添加帮助页面
@main.route('/help/payment_delay')
def payment_delay():
    return render_template('help/payment_report_help.html')

@main.route('/help/payment_report')
def payment_report():
    return render_template('help/payment_report_help.html')

