from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
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
    
    # 检查是否是AJAX请求（通过查询参数判断）
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    users = AuthService.get_all_users()
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/users_embed.html', users=users)
    else:
        # 返回完整页面
        return render_template('admin/users.html', users=users)

@admin_bp.route('/users/add', methods=['POST'])
@login_required
@admin_required
def add_user():
    """添加新用户"""
    username = request.form.get('username')
    password = request.form.get('password')
    chinese_name = request.form.get('chinese_name')
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if not username or not password:
        error_msg = '用户名和密码不能为空'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.user_management'))
    
    if len(password) < 6:
        error_msg = '密码长度不能少于6位'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.user_management'))
    
    result = AuthService.create_user(username, password, chinese_name)
    if result:
        # 记录添加用户成功日志
        log_user_management("创建用户", username)
        success_msg = f'用户 {username} 添加成功'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录添加用户失败日志
        log_user_management("创建用户失败", username, "用户名已存在")
        error_msg = f'用户 {username} 已存在，添加失败'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
    
    if is_ajax:
        return jsonify({'success': True, 'message': '操作完成'})
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
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    # 获取日志
    logs = get_logs(
        limit=limit,
        log_type=log_type if log_type else None,
        level=level if level else None
    )
    
    # 不记录查看日志操作 - 按要求移除日志记录
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/logs_embed.html', logs=logs,
                             current_type=log_type, current_level=level, limit=limit)
    else:
        # 返回完整页面
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
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    message = f'已清理 {count} 条超过 {days} 天的日志记录'
    
    if is_ajax:
        return jsonify({'success': True, 'message': message})
    
    flash(message, 'success')
    return redirect(url_for('admin.view_logs'))

@admin_bp.route('/users/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    """删除用户"""
    # 获取要删除的用户信息
    user_to_delete = User.get_user_by_id(user_id)
    if not user_to_delete:
        error_msg = '用户不存在'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.user_management'))
    
    # 检查是否试图删除管理员账户
    admin_user = User.get_user_by_username('damonrock')
    if admin_user and admin_user['id'] == user_id:
        # 记录尝试删除管理员账户日志
        log_user_management("尝试删除管理员账户", user_to_delete['username'], "安全阻止")
        error_msg = '不能删除管理员账户'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.user_management'))
    
    result = User.delete_user(user_id)
    if result:
        # 记录删除用户成功日志
        log_user_management("删除用户", user_to_delete['username'])
        success_msg = '用户删除成功'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录删除用户失败日志
        log_user_management("删除用户失败", user_to_delete['username'], "数据库操作失败")
        error_msg = '用户删除失败'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        return jsonify({'success': True, 'message': '操作完成'})
    return redirect(url_for('admin.user_management'))