from flask import Blueprint, jsonify, send_from_directory

from .toolset import toolset_bp
from .dataset import dataset_bp
from .help import help_bp
from .admin import admin_bp
from core.auth import login_required
from core.log_service import LogService
from core.statistics_service import StatisticsService
import os

main = Blueprint("main", __name__)


@main.route("/api/statistics")
@login_required
def get_statistics():
    """获取统计数据API"""
    try:
        report_stats = StatisticsService.get_report_statistics(days=7)
        system_status = StatisticsService.get_system_status()

        return jsonify(
            {
                "success": True,
                "data": {
                    "report_statistics": report_stats,
                    "system_status": system_status,
                },
            }
        )
    except Exception as e:
        print(f"获取统计数据失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@main.route("/health")
def health_check():
    """健康检查 API"""
    return jsonify({"status": "healthy", "service": "BelieveBoy Backend API"})


# 注册子蓝图
def init_app(app):
    app.register_blueprint(main)
    app.register_blueprint(toolset_bp, url_prefix="/api/toolset")
    app.register_blueprint(dataset_bp, url_prefix="/api/dataset")
    app.register_blueprint(help_bp, url_prefix="/api/help")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
