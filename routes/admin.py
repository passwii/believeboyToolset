from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from core.auth import login_required, admin_required
from core.user_model import User
from core.auth_service import AuthService
from core.log_service import log_user_management, LogService

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users')
@login_required
@admin_required
def user_management():
    """用户管理页面"""
    # 记录访问用户管理页面日志
    LogService.log(
        action="访问用户管理页面",
        resource="用户管理",
        log_type="user",
        level="info"
    )
    
    users = AuthService.get_all_users()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/add', methods=['POST'])
@login_required
@admin_required
def add_user():
    """添加新用户"""
    username = request.form.get('username')
    password = request.form.get('password')
    chinese_name = request.form.get('chinese_name')
    
    if not username or not password:
        flash('用户名和密码不能为空', 'error')
        return redirect(url_for('admin.user_management'))
    
    if len(password) < 6:
        flash('密码长度不能少于6位', 'error')
        return redirect(url_for('admin.user_management'))
    
    result = AuthService.create_user(username, password, chinese_name)
    if result:
        # 记录添加用户成功日志
        log_user_management("创建用户", username)
        flash(f'用户 {username} 添加成功', 'success')
    else:
        # 记录添加用户失败日志
        log_user_management("创建用户失败", username, "用户名已存在")
        flash(f'用户 {username} 已存在，添加失败', 'error')
    
    return redirect(url_for('admin.user_management'))

@admin_bp.route('/logs')
@login_required
@admin_required
def view_logs():
    """查看系统日志"""
    from core.database import get_logs
    
    # 获取查询参数
    log_type = request.args.get('type', '')
    level = request.args.get('level', '')
    limit = int(request.args.get('limit', 100))
    
    # 获取日志
    logs = get_logs(
        limit=limit,
        log_type=log_type if log_type else None,
        level=level if level else None
    )
    
    # 不记录查看日志操作 - 按要求移除日志记录
    
    return render_template('admin/logs.html', logs=logs,
                         current_type=log_type, current_level=level, limit=limit)

@admin_bp.route('/logs/clear', methods=['POST'])
@login_required
@admin_required
def clear_logs():
    """清理旧日志"""
    from core.database import clean_old_logs
    
    days = int(request.form.get('days', 30))
    count = clean_old_logs(days)
    
    # 不记录清理日志操作 - 按要求移除日志记录
    
    flash(f'已清理 {count} 条超过 {days} 天的日志记录', 'success')
    return redirect(url_for('admin.view_logs'))

@admin_bp.route('/users/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    """删除用户"""
    # 获取要删除的用户信息
    user_to_delete = User.get_user_by_id(user_id)
    if not user_to_delete:
        flash('用户不存在', 'error')
        return redirect(url_for('admin.user_management'))
    
    # 检查是否试图删除管理员账户
    admin_user = User.get_user_by_username('damonrock')
    if admin_user and admin_user['id'] == user_id:
        # 记录尝试删除管理员账户日志
        log_user_management("尝试删除管理员账户", user_to_delete['username'], "安全阻止")
        flash('不能删除管理员账户', 'error')
        return redirect(url_for('admin.user_management'))
    
    result = User.delete_user(user_id)
    if result:
        # 记录删除用户成功日志
        log_user_management("删除用户", user_to_delete['username'])
        flash('用户删除成功', 'success')
    else:
        # 记录删除用户失败日志
        log_user_management("删除用户失败", user_to_delete['username'], "数据库操作失败")
        flash('用户删除失败', 'error')
    
    return redirect(url_for('admin.user_management'))