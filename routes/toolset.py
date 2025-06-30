from flask import Blueprint, render_template
from apps.mic_pdf import mic_pdf_bp
toolset_bp = Blueprint('toolset', __name__)


@toolset_bp.route('/mic-pdf')
def mic_pdf():
    return render_template('toolset/mic_pdf.html')


# 注册子蓝图
toolset_bp.register_blueprint(mic_pdf_bp, url_prefix='/mic-pdf')
