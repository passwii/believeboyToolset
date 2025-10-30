from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from datetime import datetime
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
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    users = AuthService.get_all_users()
    
    # 如果是AJAX请求，返回JSON数据
    if is_ajax or (embed and request.args.get('format') == 'json'):
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'chinese_name': user.chinese_name,
                'created_at': user.created_at
            })
        return jsonify({
            'success': True,
            'users': users_data
        })
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/users_embed.html', users=users)
    else:
        # 返回完整页面
        return render_template('admin/users_embed.html', users=users)

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
    
    # 获取日志
    logs = get_logs(
        limit=limit,
        log_type=log_type if log_type else None,
        level=level if level else None
    )
    
    # 不记录查看日志操作 - 按要求移除日志记录
    
    # 始终返回内嵌模板
    return render_template('admin/logs_embed.html', logs=logs,
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

@admin_bp.route('/logs/download')
@login_required
@admin_required
def download_logs():
    """下载所有日志为CSV格式"""
    from core.database import get_all_logs
    import csv
    from io import StringIO
    
    # 获取所有日志
    logs = get_all_logs()
    
    if not logs:
        flash('没有日志记录可下载', 'warning')
        return redirect(url_for('admin.view_logs'))
    
    # 创建CSV内容
    output = StringIO()
    writer = csv.writer(output)
    
    # 写入表头
    writer.writerow(['ID', '时间', '用户', '操作', '资源', '详情', 'IP地址', '用户代理', '类型', '级别'])
    
    # 写入数据
    for log in logs:
        writer.writerow([
            log[0],  # id
            log[1],  # timestamp
            log[2] or '',  # username
            log[3] or '',  # action
            log[4] or '',  # resource
            log[5] or '',  # details
            log[6] or '',  # ip_address
            log[7] or '',  # user_agent
            log[8] or '',  # log_type
            log[9] or ''   # level
        ])
    
    # 准备响应
    csv_content = output.getvalue()
    output.close()
    
    # 创建响应
    from flask import Response
    response = Response(
        csv_content,
        mimetype='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=logs_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )
    
    return response

@admin_bp.route('/logs/delete-all', methods=['POST'])
@login_required
@admin_required
def delete_all_logs():
    """删除所有日志"""
    from core.database import delete_all_logs
    
    count = delete_all_logs()
    
    # 不记录删除日志操作 - 按要求移除日志记录
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    message = f'成功删除所有日志记录，共 {count} 条'
    
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
    if admin_user and admin_user.id == user_id:
        # 记录尝试删除管理员账户日志
        log_user_management("尝试删除管理员账户", user_to_delete.username, "安全阻止")
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
        log_user_management("删除用户", user_to_delete.username)
        success_msg = '用户删除成功'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录删除用户失败日志
        log_user_management("删除用户失败", user_to_delete.username, "数据库操作失败")
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

@admin_bp.route('/operations-info')
@login_required
def operations_info():
    """运营信息页面 - 全员可见"""
    # 记录访问运营信息页面日志
    LogService.log(
        action="访问运营信息页面",
        resource="运营信息",
        log_type="user",
        level="info"
    )
    
    # 检查是否是AJAX请求（通过查询参数判断）
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/operations_info_embed.html')
    else:
        # 返回完整页面
        return render_template('admin/operations_info_embed.html')

@admin_bp.route('/update-log')
@login_required
def update_log():
    """更新日志页面 - 全员可见"""
    # 记录访问更新日志页面日志
    LogService.log(
        action="访问更新日志页面",
        resource="更新日志",
        log_type="user",
        level="info"
    )
    
    # 检查是否是AJAX请求（通过查询参数判断）
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    # 这里可以添加获取Git提交历史的逻辑
    # 目前先传递空列表，使用默认的更新日志内容
    commits = []
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/update_log_embed.html', commits=commits)
    else:
        # 返回完整页面
        return render_template('admin/update_log_embed.html', commits=commits)

@admin_bp.route('/change-password')
@login_required
def change_password():
    """更改密码页面 - 全员可见"""
    # 记录访问更改密码页面日志
    LogService.log(
        action="访问更改密码页面",
        resource="更改密码",
        log_type="security",
        level="info"
    )
    
    # 检查是否是AJAX请求（通过查询参数判断）
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/change_password_embed.html')
    else:
        # 返回完整页面
        return render_template('admin/change_password_embed.html')

@admin_bp.route('/shops')
@login_required
def shop_management():
    """店铺信息维护页面"""
    # 记录访问店铺管理页面日志
    LogService.log(
        action="访问店铺管理页面",
        resource="店铺管理",
        log_type="user",
        level="info"
    )
    
    # 获取所有店铺数据
    from core.shop_model import Shop
    shops = Shop.get_all()
    
    # 检查是否是AJAX请求（通过查询参数判断）
    embed = request.args.get('embed', 'false').lower() == 'true'
    
    if embed:
        # 返回内嵌模板
        return render_template('admin/shop_management_embed.html', shops=shops)
    else:
        # 返回完整页面（如果需要的话）
        return render_template('admin/shop_management_embed.html', shops=shops)

@admin_bp.route('/shops/add', methods=['POST'])
@login_required
def add_shop():
    """添加新店铺"""
    shop_name = request.form.get('shop_name')
    brand_name = request.form.get('brand_name')
    shop_url = request.form.get('shop_url')
    operator = request.form.get('operator')
    shop_type = request.form.get('shop_type', '自有')
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if not shop_name or not shop_url:
        error_msg = '店铺名称和链接不能为空'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 验证URL格式
    from core.shop_model import Shop
    if not Shop.validate_shop_url(shop_url):
        error_msg = '请输入有效的URL（以http://或https://开头）'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 检查店铺名称是否已存在
    if Shop.shop_name_exists(shop_name):
        error_msg = f'店铺名称 "{shop_name}" 已存在，请使用其他名称'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 获取当前用户ID
    from core.user_model import User
    username = session.get('username')
    current_user = User.get_user_by_username(username)
    user_id = current_user.id if current_user else None
    
    # 创建店铺
    shop = Shop.create(shop_name, brand_name, shop_url, operator, shop_type, user_id)
    if shop:
        # 记录添加店铺成功日志
        LogService.log(
            action="添加店铺",
            resource=f"店铺: {shop_name}",
            details=f"店铺链接: {shop_url}",
            log_type="user",
            level="info"
        )
        success_msg = f'店铺 {shop_name} 添加成功'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录添加店铺失败日志
        LogService.log(
            action="添加店铺失败",
            resource=f"店铺: {shop_name}",
            details=f"店铺链接: {shop_url}",
            log_type="user",
            level="error"
        )
        error_msg = f'店铺 {shop_name} 添加失败'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
    
    if is_ajax:
        return jsonify({'success': True, 'message': '操作完成'})
    return redirect(url_for('admin.shop_management', embed='true'))

@admin_bp.route('/shops/list')
@login_required
def list_shops():
    """获取店铺列表API"""
    from core.shop_model import Shop
    
    try:
        shops = Shop.get_all()
        shops_data = [shop.to_dict() for shop in shops]
        return jsonify({'success': True, 'shops': shops_data})
    except Exception as e:
        print(f"获取店铺列表失败: {e}")
        return jsonify({'success': False, 'message': '获取店铺列表失败'})

@admin_bp.route('/shops/check-name')
@login_required
def check_shop_name():
    """检查店铺名称是否已存在"""
    from core.shop_model import Shop
    
    shop_name = request.args.get('shop_name', '')
    exclude_id = request.args.get('exclude_id', type=int)
    
    if not shop_name:
        return jsonify({'exists': False})
    
    try:
        exists = Shop.shop_name_exists(shop_name, exclude_id)
        return jsonify({'exists': exists})
    except Exception as e:
        print(f"检查店铺名称失败: {e}")
        return jsonify({'exists': False})

@admin_bp.route('/shops/update/<int:shop_id>', methods=['POST'])
@login_required
def update_shop(shop_id):
    """更新店铺信息"""
    shop_name = request.form.get('shop_name')
    brand_name = request.form.get('brand_name')
    shop_url = request.form.get('shop_url')
    operator = request.form.get('operator')
    shop_type = request.form.get('shop_type', '自有')
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    
    if not shop_name or not shop_url:
        error_msg = '店铺名称和链接不能为空'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 验证URL格式
    from core.shop_model import Shop
    if not Shop.validate_shop_url(shop_url):
        error_msg = '请输入有效的URL（以http://或https://开头）'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 检查店铺名称是否已存在（排除当前编辑的店铺）
    if Shop.shop_name_exists(shop_name, exclude_id=shop_id):
        error_msg = f'店铺名称 "{shop_name}" 已存在，请使用其他名称'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    # 获取店铺并更新
    shop = Shop.get_by_id(shop_id)
    if not shop:
        error_msg = '店铺不存在'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    old_name = shop.shop_name
    old_url = shop.shop_url
    
    success = shop.update(shop_name, brand_name, shop_url, operator, shop_type)
    if success:
        # 记录更新店铺成功日志
        LogService.log(
            action="更新店铺信息",
            resource=f"店铺: {old_name}",
            details=f"原名称: {old_name}, 原链接: {old_url}\n新名称: {shop_name}, 新链接: {shop_url}",
            log_type="user",
            level="info"
        )
        success_msg = f'店铺信息更新成功'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录更新店铺失败日志
        LogService.log(
            action="更新店铺信息失败",
            resource=f"店铺: {old_name}",
            details=f"原名称: {old_name}, 原链接: {old_url}\n新名称: {shop_name}, 新链接: {shop_url}",
            log_type="user",
            level="error"
        )
        error_msg = f'店铺信息更新失败，可能是店铺名称已重复'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
    
    if is_ajax:
        return jsonify({'success': True, 'message': '操作完成'})
    return redirect(url_for('admin.shop_management', embed='true'))

@admin_bp.route('/shops/delete/<int:shop_id>', methods=['POST'])
@login_required
def delete_shop(shop_id):
    """删除店铺"""
    # 获取要删除的店铺信息
    from core.shop_model import Shop
    shop = Shop.get_by_id(shop_id)
    if not shop:
        error_msg = '店铺不存在'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
        return redirect(url_for('admin.shop_management', embed='true'))
    
    shop_name = shop.shop_name
    shop_url = shop.shop_url
    
    result = shop.delete()
    if result:
        # 记录删除店铺成功日志
        LogService.log(
            action="删除店铺",
            resource=f"店铺: {shop_name}",
            details=f"店铺链接: {shop_url}",
            log_type="user",
            level="info"
        )
        success_msg = '店铺删除成功'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': True, 'message': success_msg})
        flash(success_msg, 'success')
    else:
        # 记录删除店铺失败日志
        LogService.log(
            action="删除店铺失败",
            resource=f"店铺: {shop_name}",
            details=f"店铺链接: {shop_url}",
            log_type="user",
            level="error"
        )
        error_msg = '店铺删除失败'
        # 检查是否是AJAX请求
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            return jsonify({'success': False, 'message': error_msg})
        flash(error_msg, 'error')
    
    # 检查是否是AJAX请求
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        return jsonify({'success': True, 'message': '操作完成'})
    return redirect(url_for('admin.shop_management', embed='true'))