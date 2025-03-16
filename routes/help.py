from flask import Blueprint, render_template

help_bp = Blueprint('help', __name__)

@help_bp.route('/payment_delay')
def payment_delay():
    return render_template('help/payment_report_help.html')

@help_bp.route('/payment_report')
def payment_report():
    return render_template('help/payment_report_help.html')

@help_bp.route('/business_report')
def business_report():
    return render_template('help/business_report_help.html')

@help_bp.route('/ad_product_report')
def ad_product_report():
    return render_template('help/ad_product_report_help.html')