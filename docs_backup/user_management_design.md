# 用户管理界面设计文档

## 需求分析

1. 只有管理员用户（damonrock）可以访问用户管理功能
2. 在主页（index.html）上添加用户管理入口
3. 实现用户管理功能：
   - 查看所有用户列表
   - 添加新用户
   - 删除用户
   - 修改用户密码

## 技术实现方案

### 1. 后端实现

#### a. 创建管理员检查装饰器
在 `auth.py` 中添加一个管理员检查装饰器：

```python
def admin_required(f):
    """装饰器：要求用户为管理员"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_logged_in():
            return redirect(url_for('auth.login', next=request.url))
        # 检查是否为管理员用户
        if session.get('username') != 'damonrock':
            flash('权限不足，只有管理员可以访问此页面', 'error')
            return redirect(url_for('main.home'))
        return f(*args, **kwargs)
    return decorated_function
```

#### b. 创建管理员路由
创建新的 `routes/admin.py` 文件：

```python
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from auth import login_required, admin_required
from user_model import User
from auth_service import AuthService

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users')
@login_required
@admin_required
def user_management():
    """用户管理页面"""
    users = AuthService.get_all_users()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/admin/users/add', methods=['POST'])
@login_required
@admin_required
def add_user():
    """添加新用户"""
    username = request.form.get('username')
    password = request.form.get('password')
    
    if not username or not password:
        flash('用户名和密码不能为空', 'error')
        return redirect(url_for('admin.user_management'))
    
    if len(password) < 6:
        flash('密码长度不能少于6位', 'error')
        return redirect(url_for('admin.user_management'))
    
    result = AuthService.create_user(username, password)
    if result:
        flash(f'用户 {username} 添加成功', 'success')
    else:
        flash(f'用户 {username} 已存在，添加失败', 'error')
    
    return redirect(url_for('admin.user_management'))

@admin_bp.route('/admin/users/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    """删除用户"""
    # 注意：这里需要在数据库操作中添加删除用户的功能
    flash('用户删除功能将在后续实现', 'info')
    return redirect(url_for('admin.user_management'))
```

#### c. 更新应用注册
在 `routes/__init__.py` 中注册新的蓝图：

```python
from .admin import admin_bp

def init_app(app):
    app.register_blueprint(main)
    app.register_blueprint(toolset_bp, url_prefix='/toolset')
    app.register_blueprint(dataset_bp, url_prefix='/dataset')
    app.register_blueprint(help_bp, url_prefix='/help')
    app.register_blueprint(admin_bp, url_prefix='/admin')
```

### 2. 前端实现

#### a. 更新主页（index.html）
在主页中为管理员用户添加用户管理入口：

```html
<!-- 在适当位置添加以下代码 -->
{% if session.username == 'damonrock' %}
<div class="subcategory-grid" id="admin">
    <a href="{{ url_for('admin.user_management') }}" class="subcategory-card" data-category="admin">
        <i class="fas fa-users-cog"></i>
        <h3>用户管理</h3>
        <p>管理平台用户账户</p>
    </a>
</div>
{% endif %}
```

#### b. 创建用户管理页面模板
创建 `templates/admin/users.html`：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户管理</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='base.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='mobile.css') }}">
    <style>
        .user-management-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
        }
        
        .user-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .user-table th, .user-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .user-table th {
            background-color: #f2f2f2;
        }
        
        .add-user-form {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .add-user-form input {
            margin: 5px 10px 5px 0;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        
        .add-user-form button {
            padding: 8px 15px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .add-user-form button:hover {
            background: #45a049;
        }
        
        .flash-messages {
            margin: 10px 0;
        }
        
        .flash-success {
            color: #4CAF50;
            padding: 10px;
            background: #dff0d8;
            border: 1px solid #d6e9c6;
            border-radius: 4px;
        }
        
        .flash-error {
            color: #a94442;
            padding: 10px;
            background: #f2dede;
            border: 1px solid #ebccd1;
            border-radius: 4px;
        }
        
        .flash-info {
            color: #31708f;
            padding: 10px;
            background: #d9edf7;
            border: 1px solid #bce8f1;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="user-management-container">
        <h1>用户管理</h1>
        
        <!-- 显示消息 -->
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                <div class="flash-messages">
                    {% for category, message in messages %}
                        <div class="flash-{{ category }}">{{ message }}</div>
                    {% endfor %}
                </div>
            {% endif %}
        {% endwith %}
        
        <!-- 添加用户表单 -->
        <div class="add-user-form">
            <h2>添加新用户</h2>
            <form method="POST" action="{{ url_for('admin.add_user') }}">
                <input type="text" name="username" placeholder="用户名" required>
                <input type="password" name="password" placeholder="密码" required>
                <button type="submit">添加用户</button>
            </form>
        </div>
        
        <!-- 用户列表 -->
        <h2>用户列表</h2>
        <table class="user-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {% for user in users %}
                <tr>
                    <td>{{ user[0] }}</td>
                    <td>{{ user[1] }}</td>
                    <td>{{ user[3] }}</td>
                    <td>
                        <form method="POST" action="{{ url_for('admin.delete_user', user_id=user[0]) }}" style="display: inline;">
                            <button type="submit" onclick="return confirm('确定要删除用户 {{ user[1] }} 吗？')" style="background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">删除</button>
                        </form>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        
        <a href="{{ url_for('main.home') }}">返回主页</a>
    </div>
</body>
</html>
```

### 3. 数据库增强

需要在 `database.py` 中添加删除用户的功能：

```python
def delete_user(user_id):
    """根据用户ID删除用户"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0  # 返回是否成功删除
    except Exception as e:
        return False
    finally:
        conn.close()
```

并在 `user_model.py` 中添加对应的方法：

```python
@staticmethod
def delete_user(user_id):
    """删除用户"""
    return delete_user(user_id)
```

## 安全考虑

1. 只有管理员用户（damonrock）可以访问用户管理功能
2. 所有操作都需要登录验证
3. 密码仍然使用SHA-256哈希存储
4. 添加用户时进行密码强度检查
5. 删除用户时需要确认操作

## 实施步骤

1. 在 `auth.py` 中添加 `admin_required` 装饰器
2. 创建 `routes/admin.py` 蓝图文件
3. 在 `routes/__init__.py` 中注册新的蓝图
4. 更新 `templates/index.html` 添加管理员入口
5. 创建 `templates/admin/users.html` 用户管理页面
6. 增强数据库和用户模型功能
7. 测试所有功能

## 未来扩展

1. 添加用户角色系统（管理员、普通用户等）
2. 添加用户编辑功能（修改密码等）
3. 添加用户搜索和分页功能
4. 添加操作日志记录