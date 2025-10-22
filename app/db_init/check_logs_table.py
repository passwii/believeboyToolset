#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查logs表结构
"""

import sqlite3
import os
import sys

# 设置输出编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def check_table_structure(table_name):
    """检查表结构"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print(f"=== 表 {table_name} 结构 ===")
        
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        for col in columns:
            print(f"列: {col[1]}, 类型: {col[2]}, 非空: {col[3]}, 默认值: {col[4]}, 主键: {col[5]}")
        
        # 获取创建表的SQL
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        create_sql = cursor.fetchone()
        
        if create_sql:
            print(f"\n创建SQL:\n{create_sql[0]}")
        
    except Exception as e:
        print(f"检查表结构失败: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_table_structure("logs")