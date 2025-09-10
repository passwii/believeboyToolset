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
@help_bp.route('/orders_report')
def orders_report_help():
    return render_template('help/orders_report_help.html')

@help_bp.route('/fba_inventory')
def fba_inventory_help():
    return render_template('help/fba_inventory_help.html')