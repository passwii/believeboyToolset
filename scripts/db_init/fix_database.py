#!/usr/bin/env python3
"""
修复数据库脚本 - 添加缺失的 logs 表
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..'))
from core.database import init_db, get_db_connection
import sqlite3

def check_logs_table():
    """检查 logs 表是否存在"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='logs'")
        result = cursor.fetchone()
        return result is not None
    finally:
        conn.close()

def fix_database():
    """修复数据库，添加缺失的表"""
    print("检查数据库状态...")
    
    # 检查 logs 表是否存在
    if check_logs_table():
        print("logs 表已存在，无需修复。")
        return True
    
    print("logs 表不存在，正在创建...")
    
    try:
        # 初始化数据库（这会创建缺失的表）
        init_db()
        
        # 再次检查
        if check_logs_table():
            print("logs 表创建成功！")
            return True
        else:
            print("logs 表创建失败！")
            return False
    except Exception as e:
        print(f"修复数据库时出错: {e}")
        return False

if __name__ == "__main__":
    if fix_database():
        print("数据库修复完成！")
    else:
        print("数据库修复失败！")