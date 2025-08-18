from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import hashlib
import os

# 创建认证蓝图
auth_bp = Blueprint('auth', __name__)

# 简单的用户存储（在实际应用中应该使用数据库）
# 用户名: 密码哈希 (这里使用简单的用户名密码对作为示例)
USERS = {
    "damonrock": hashlib.sha256("jrway2012".encode()).hexdigest(),  # admin管理员
    "xusheng": hashlib.sha256("zhangxusheng2025".encode()).hexdigest()     # 张旭胜
}

def hash_password(password):
    """对密码进行哈希处理"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(username, password):
    """验证用户名和密码"""
    if username in USERS:
        return USERS[username] == hash_password(password)
    return False

def is_logged_in():
    """检查用户是否已登录"""
    return 'username' in session

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """登录路由"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if verify_password(username, password):
            session.permanent = True  # 设置会话为永久（受 app.permanent_session_lifetime 影响）
            session['username'] = username
            # 登录成功后重定向到主页
            next_page = request.args.get('next')
            return redirect(next_page or url_for('main.home'))
        else:
            # 登录失败，显示错误信息
            return render_template('login.html', error='用户名或密码错误')
    
    # GET 请求显示登录页面
    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    """注销路由"""
    session.pop('username', None)
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