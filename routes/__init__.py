from flask import Blueprint, render_template, session, redirect, url_for, jsonify

from .toolset import toolset_bp
from .dataset import dataset_bp
from .help import help_bp
from .admin import admin_bp
from core.auth import login_required
from core.log_service import LogService
from core.statistics_service import StatisticsService

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index.html')
@login_required
def home():
    # 记录访问主页日志
    LogService.log(
        action="访问主页",
        resource="主页",
        log_type="user",
        level="info"
    )
    
    # 获取当前用户的中文姓名
    from core.user_model import User
    username = session.get('username')
    user = User.get_user_by_username(username)
    chinese_name = user.chinese_name if user and user.chinese_name else username
    
    return render_template('index.html', chinese_name=chinese_name)

@main.route('/api/statistics')
@login_required
def get_statistics():
    """获取统计数据API"""
    try:
        # 获取报告统计数据
        report_stats = StatisticsService.get_report_statistics(days=7)
        
        # 获取系统状态
        system_status = StatisticsService.get_system_status()
        
        return jsonify({
            'success': True,
            'data': {
                'report_statistics': report_stats,
                'system_status': system_status
            }
        })
    except Exception as e:
        print(f"获取统计数据失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 检查并应用店铺表迁移
def apply_shop_migrations():
    """应用店铺表相关的迁移"""
    try:
        # 导入并运行迁移脚本
        from core.add_unique_constraint import add_shop_name_unique_constraint
        from core.migrate_shop_table import migrate_shop_table
        
        # 首先运行基本表结构迁移
        migrate_shop_table()
        
        # 然后添加唯一性约束
        add_shop_name_unique_constraint()
        
        print("店铺表迁移完成")
    except Exception as e:
        print(f"店铺表迁移失败: {e}")

# 注册子蓝图
def init_app(app):
    # 应用迁移
    apply_shop_migrations()
    
    app.register_blueprint(main)
    app.register_blueprint(toolset_bp, url_prefix='/toolset')
    app.register_blueprint(dataset_bp, url_prefix='/dataset')
    app.register_blueprint(help_bp, url_prefix='/help')
    app.register_blueprint(admin_bp, url_prefix='/admin')