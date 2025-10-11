from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from core.user_model import User
from core.log_service import log_login_attempt, log_security_event, LogService
import os

# 创建认证蓝图
auth_bp = Blueprint('auth', __name__)

def is_logged_in():
    """检查用户是否已登录"""
    return 'username' in session

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """登录路由"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if User.verify_password(username, password):
            session.permanent = True  # 设置会话为永久（受 app.permanent_session_lifetime 影响）
            session['username'] = username
            
            # 记录登录成功日志
            log_login_attempt(username, True)
            
            # 登录成功后重定向到主页
            next_page = request.args.get('next')
            return redirect(next_page or url_for('main.home'))
        else:
            # 记录登录失败日志
            log_login_attempt(username, False)
            
            # 登录失败，显示错误信息
            return render_template('login.html', error='用户名或密码错误')
    
    # GET 请求显示登录页面
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    """注销路由"""
    username = session.get('username', 'unknown')
    session.pop('username', None)
    
    # 记录登出日志
    LogService.log(
        action="用户登出",
        resource="认证",
        details=f"用户名: {username}",
        log_type="user",
        level="info"
    )
    
    return redirect(url_for('auth.login'))

def login_required(f):
    """装饰器：要求用户登录"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_logged_in():
            # 保存用户尝试访问的页面，登录后重定向
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """装饰器：要求用户为管理员"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_logged_in():
            return redirect(url_for('auth.login', next=request.url))
        # 检查是否为管理员用户
        if session.get('username') != 'damonrock':
            # 记录权限不足访问尝试
            log_security_event(
                action="权限不足访问",
                details=f"用户 {session.get('username', 'unknown')} 尝试访问管理员功能: {request.endpoint}"
            )
            
            from flask import flash
            flash('权限不足，只有管理员可以访问此页面', 'error')
            return redirect(url_for('main.home'))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/change_password', methods=['GET', 'POST'])
@login_required
def change_password():
    """修改密码路由"""
    if request.method == 'POST':
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        
        # 获取当前用户
        username = session.get('username')
        user = User.get_user_by_username(username)
        
        # 验证当前密码
        if not User.verify_password(username, current_password):
            # 记录密码修改失败日志
            LogService.log(
                action="修改密码失败",
                resource="用户账户",
                details=f"用户 {username} 当前密码验证失败",
                log_type="security",
                level="warning"
            )
            flash('当前密码不正确', 'error')
            return render_template('change_password.html')
        
        # 验证新密码
        if not new_password or len(new_password) < 6:
            flash('新密码长度不能少于6位', 'error')
            return render_template('change_password.html')
        
        # 验证确认密码
        if new_password != confirm_password:
            flash('两次输入的新密码不一致', 'error')
            return render_template('change_password.html')
        
        # 修改密码
        result = User.change_password(user.id, new_password)
        
        if result:
            # 记录密码修改成功日志
            LogService.log(
                action="修改密码成功",
                resource="用户账户",
                details=f"用户 {username} 成功修改密码",
                log_type="security",
                level="info"
            )
            flash('密码修改成功，请重新登录', 'success')
            # 修改成功后注销用户，要求重新登录
            return redirect(url_for('auth.logout'))
        else:
            # 记录密码修改失败日志
            LogService.log(
                action="修改密码失败",
                resource="用户账户",
                details=f"用户 {username} 密码更新失败",
                log_type="security",
                level="error"
            )
            flash('密码修改失败，请重试', 'error')
    
    # GET 请求显示修改密码页面
    return render_template('change_password.html')