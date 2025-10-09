#!/usr/bin/env python3
"""
用户管理脚本
用于添加新用户到认证系统
"""

import sys
from core.user_model import User
from core.auth_service import AuthService

def display_usage():
    """显示使用方法"""
    print("用户管理工具")
    print("=" * 20)
    print("用法:")
    print("  python manage_users.py add <用户名> <密码>  - 添加新用户")
    print("  python manage_users.py list             - 列出所有用户")
    print("  python manage_users.py auth <用户名> <密码>  - 验证用户")
    print("  python manage_users.py                - 显示此帮助信息")
    print("=" * 20)

def add_user(username, password):
    """添加新用户"""
    print(f"正在添加用户: {username}")
    result = AuthService.create_user(username, password)
    if result:
        print(f"✓ 用户 {username} 添加成功")
    else:
        print(f"✗ 用户 {username} 已存在，添加失败")
    return result

def list_users():
    """列出所有用户"""
    print("所有用户:")
    print("-" * 20)
    users = AuthService.get_all_users()
    if users:
        for user in users:
            print(f"- {user[1]}")  # user[1] 是username列
    else:
        print("暂无用户")
    print("-" * 20)

def authenticate_user(username, password):
    """验证用户"""
    print(f"正在验证用户: {username}")
    result = AuthService.authenticate_user(username, password)
    if result:
        print(f"✓ 用户 {username} 验证成功")
    else:
        print(f"✗ 用户 {username} 验证失败")
    return result

def main():
    """主函数"""
    if len(sys.argv) < 2:
        display_usage()
        return

    command = sys.argv[1]
    
    try:
        if command == "add" and len(sys.argv) == 4:
            username = sys.argv[2]
            password = sys.argv[3]
            add_user(username, password)
        elif command == "list" and len(sys.argv) == 2:
            list_users()
        elif command == "auth" and len(sys.argv) == 4:
            username = sys.argv[2]
            password = sys.argv[3]
            authenticate_user(username, password)
        else:
            display_usage()
    except Exception as e:
        print(f"错误: {str(e)}")
        display_usage()

if __name__ == "__main__":
    main()