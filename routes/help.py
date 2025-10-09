from flask import Blueprint, render_template
from core.log_service import LogService

help_bp = Blueprint('help', __name__)

@help_bp.route('/payment_delay')
def payment_delay():
    # 记录访问支付延迟帮助页面日志
    LogService.log(
        action="访问支付延迟帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/payment_report_help.html')

@help_bp.route('/payment_report')
def payment_report():
    # 记录访问支付报告帮助页面日志
    LogService.log(
        action="访问支付报告帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/payment_report_help.html')

@help_bp.route('/business_report')
def business_report():
    # 记录访问业务报告帮助页面日志
    LogService.log(
        action="访问业务报告帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/business_report_help.html')

@help_bp.route('/ad_product_report')
def ad_product_report():
    # 记录访问广告产品报告帮助页面日志
    LogService.log(
        action="访问广告产品报告帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/ad_product_report_help.html')

@help_bp.route('/orders_report')
def orders_report_help():
    # 记录访问订单报告帮助页面日志
    LogService.log(
        action="访问订单报告帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/orders_report_help.html')

@help_bp.route('/fba_inventory')
def fba_inventory_help():
    # 记录访问FBA库存帮助页面日志
    LogService.log(
        action="访问FBA库存帮助页面",
        resource="帮助文档",
        log_type="user",
        level="info"
    )
    return render_template('help/fba_inventory_help.html')