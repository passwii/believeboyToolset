#!/usr/bin/env python3
"""
清除所有日志数据脚本
删除数据库中的所有日志记录
"""

import sqlite3
import os

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def clear_all_logs():
    """清除所有日志数据"""
    if not os.path.exists(DB_PATH):
        print(f"数据库文件不存在: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("正在清除所有日志数据...")
        
        # 获取删除前的日志数量
        cursor.execute("SELECT COUNT(*) FROM logs")
        count_before = cursor.fetchone()[0]
        print(f"删除前日志总数: {count_before}")
        
        # 删除所有日志
        cursor.execute("DELETE FROM logs")
        
        # 重置自增ID（可选）
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='logs'")
        
        # 获取删除后的日志数量
        cursor.execute("SELECT COUNT(*) FROM logs")
        count_after = cursor.fetchone()[0]
        
        # 提交更改
        conn.commit()
        
        print(f"成功删除 {count_before} 条日志记录")
        print(f"删除后日志总数: {count_after}")
        print("所有日志数据已清除！")
        
        return True
        
    except Exception as e:
        print(f"清除日志失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== 清除所有日志数据脚本 ===")
    print("此脚本将删除数据库中的所有日志记录")
    print("注意: 此操作不可逆，请确保已备份数据库")
    
    confirm = input("确定要继续吗？(y/N): ")
    if confirm.lower() == 'y':
        success = clear_all_logs()
        if success:
            print("日志清除成功完成！")
        else:
            print("日志清除失败！")
    else:
        print("操作已取消")