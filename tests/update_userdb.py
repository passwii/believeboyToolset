#!/usr/bin/env python3
"""
更新用户数据库脚本
用于检查数据库结构并更新用户中文名称
"""

import sys
import os
import sqlite3
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import get_db_connection

def check_and_update_database_structure():
    """检查并更新数据库结构"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 检查 users 表的结构
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        # 检查是否存在 chinese_name 列
        chinese_name_exists = any(column[1] == 'chinese_name' for column in columns)
        
        if not chinese_name_exists:
            print("chinese_name 列不存在，正在添加...")
            # 添加 chinese_name 列
            cursor.execute("ALTER TABLE users ADD COLUMN chinese_name TEXT")
            conn.commit()
            print("chinese_name 列添加成功！")
        else:
            print("chinese_name 列已存在。")
            
        return True
    except Exception as e:
        print(f"检查/更新数据库结构时出错: {e}")
        return False
    finally:
        conn.close()

def update_user_chinese_names():
    """更新用户中文名称"""
    
    # 用户数据映射：用户名 -> 中文名称
    user_updates = {
        'damonrock': '纪亚伟',
        'xusheng': '张旭胜',
        'hanchen': '徐汉宸',
        'youshuai': '尤帅',
        'rock': '测试'
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("开始更新用户中文名称...")
        print("-" * 40)
        
        for username, chinese_name in user_updates.items():
            # 检查用户是否存在
            cursor.execute('SELECT id, username, chinese_name FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            
            if user:
                # 更新用户中文名称
                cursor.execute(
                    'UPDATE users SET chinese_name = ? WHERE username = ?',
                    (chinese_name, username)
                )
                print(f"✓ 已更新用户 {username}: {user[2] or '(空)'} -> {chinese_name}")
            else:
                print(f"✗ 用户 {username} 不存在，跳过更新")
        
        conn.commit()
        print("-" * 40)
        print("更新完成！")
        
        # 显示更新后的所有用户
        print("\n当前所有用户:")
        print("-" * 40)
        cursor.execute('SELECT id, username, chinese_name FROM users ORDER BY id')
        users = cursor.fetchall()
        
        for user in users:
            print(f"ID: {user[0]}, 用户名: {user[1]}, 中文名: {user[2] or '(未设置)'}")
        
    except Exception as e:
        print(f"更新过程中发生错误: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
    
    return True

def main():
    """主函数"""
    print("用户数据库更新工具")
    print("=" * 40)
    
    # 检查并更新数据库结构
    if not check_and_update_database_structure():
        print("数据库结构检查/更新失败！")
        return False
    
    print()
    
    # 更新用户中文名称
    if not update_user_chinese_names():
        print("用户中文名称更新失败！")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n所有操作完成成功！")
    else:
        print("\n操作失败！")