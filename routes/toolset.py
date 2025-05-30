from flask import Blueprint, render_template
from apps.mic_pdf import mic_pdf_bp
from apps.fba_revise_pdf import fba_revise_pdf_bp

toolset_bp = Blueprint('toolset', __name__)

@toolset_bp.route('/exchange-rate')
def exchange_rate():
    return render_template('toolset/exchange_rate.html')

@toolset_bp.route('/mic-pdf')
def mic_pdf():
    return render_template('toolset/mic_pdf.html')

@toolset_bp.route('/fba-revise-pdf')
def fba_revise_pdf():
    return render_template('toolset/fba_revise_pdf.html')

# 注册子蓝图
toolset_bp.register_blueprint(mic_pdf_bp, url_prefix='/mic-pdf')
toolset_bp.register_blueprint(fba_revise_pdf_bp, url_prefix='/fba-revise-pdf')
