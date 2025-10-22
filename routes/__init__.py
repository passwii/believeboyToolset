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
    """应用店铺表相关的迁移（仅在需要时执行）"""
    try:
        # 检查是否已经完成迁移
        from core.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 检查shops表是否存在且已经包含所有必要字段
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='shops'")
        shops_table_exists = cursor.fetchone() is not None
        
        if not shops_table_exists:
            # 表不存在，需要初始化
            from core.database import init_db
            init_db()
            print("数据库表初始化完成")
            conn.close()
            return
        
        # 检查是否已经包含所有字段
        cursor.execute("PRAGMA table_info(shops)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # 检查是否有唯一性约束（通过检查表结构）
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='shops'")
        table_result = cursor.fetchone()
        table_sql = table_result[0] if table_result else ""
        has_unique_constraint = "UNIQUE" in table_sql
        
        conn.close()
        
        # 如果所有字段都存在且有唯一性约束，则不需要迁移
        required_fields = ['brand_name', 'operator', 'shop_type']
        all_fields_exist = all(field in columns for field in required_fields)
        
        if all_fields_exist and has_unique_constraint:
            print("数据库已是最新版本，无需迁移")
            return
        
        # 需要迁移时才执行以下代码
        print("检测到数据库需要迁移...")
        
        # 导入并运行迁移脚本
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app', 'db_init'))
        from add_unique_constraint import add_shop_name_unique_constraint
        from migrate_shop_table import migrate_shop_table
        
        # 首先运行基本表结构迁移
        if not all_fields_exist:
            migrate_shop_table()
        
        # 然后添加唯一性约束
        if not has_unique_constraint:
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