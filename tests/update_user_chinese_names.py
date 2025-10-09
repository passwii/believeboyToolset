#!/usr/bin/env python3
"""
更新用户中文名称脚本
用于批量更新用户的中文姓名
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import get_db_connection

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
                print(f"✓ 已更新用户 {username}: {user['chinese_name'] or '(空)'} -> {chinese_name}")
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
            print(f"ID: {user['id']}, 用户名: {user['username']}, 中文名: {user['chinese_name'] or '(未设置)'}")
        
    except Exception as e:
        print(f"更新过程中发生错误: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
    
    return True

if __name__ == "__main__":
    update_user_chinese_names()