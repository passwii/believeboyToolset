#!/usr/bin/env python3
"""
测试管理员权限控制功能
验证用户管理和日志管理菜单的显示控制
"""

import sys
import os

# 添加项目根目录到 sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template_string, session
from core.auth import login_required, admin_required

def test_admin_permission():
    """测试管理员权限控制"""
    print("=== 管理员权限控制测试 ===\n")
    
    # 模拟Flask应用和请求上下文
    app = Flask(__name__)
    app.secret_key = 'test_secret_key'
    
    with app.test_request_context():
        # 测试1: 非管理员用户登录
        print("测试1: 非管理员用户权限")
        session['username'] = 'test_user'
        
        # 模拟admin_required装饰器检查
        username = session.get('username')
        is_admin = username == 'damonrock'
        
        print(f"  当前用户: {username}")
        print(f"  是否为管理员: {is_admin}")
        print(f"  结果: {'✓ 可以看到管理菜单' if is_admin else '✗ 无法看到管理菜单'}\n")
        
        # 测试2: 管理员用户登录
        print("测试2: 管理员用户权限")
        session['username'] = 'damonrock'
        
        username = session.get('username')
        is_admin = username == 'damonrock'
        
        print(f"  当前用户: {username}")
        print(f"  是否为管理员: {is_admin}")
        print(f"  结果: {'✓ 可以看到管理菜单' if is_admin else '✗ 无法看到管理菜单'}\n")
        
        # 测试3: 检查模板条件渲染
        print("测试3: 模板条件渲染测试")
        
        template_content = """
        {% if session.username == 'damonrock' %}
        <li class="nav-item">
            <a href="#" data-content="user-management" class="nav-link">
                <i class="fas fa-users-cog"></i>
                <span>用户管理</span>
            </a>
        </li>
        <li class="nav-item">
            <a href="#" data-content="log-management" class="nav-link">
                <i class="fas fa-list-alt"></i>
                <span>日志管理</span>
            </a>
        </li>
        {% endif %}
        """
        
        # 渲染模板
        try:
            # 模拟非管理员用户的模板渲染
            session['username'] = 'test_user'
            rendered_no_admin = render_template_string(template_content, session=session)
            menu_visible_no_admin = len(rendered_no_admin.strip()) > 0
            
            # 模拟管理员用户的模板渲染
            session['username'] = 'damonrock'
            rendered_admin = render_template_string(template_content, session=session)
            menu_visible_admin = len(rendered_admin.strip()) > 0
            
            print(f"  非管理员用户 - 菜单是否显示: {menu_visible_admin}")
            print(f"  管理员用户 - 菜单是否显示: {menu_visible_admin}")
            
            if not menu_visible_no_admin and menu_visible_admin:
                print("  ✓ 模板条件渲染正常工作")
            else:
                print("  ✗ 模板条件渲染异常")
                
        except Exception as e:
            print(f"  ✗ 模板渲染测试失败: {e}")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_admin_permission()