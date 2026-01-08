#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理临时表
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

def cleanup_temp_tables():
    """清理临时表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("=== 清理临时表 ===")
        
        # 获取所有表名
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # 查找临时表
        temp_tables = [table for table in tables if 'temp' in table.lower()]
        
        if not temp_tables:
            print("没有找到临时表")
            return True
        
        print(f"找到 {len(temp_tables)} 个临时表:")
        for table in temp_tables:
            print(f"  - {table}")
        
        # 删除临时表
        for table in temp_tables:
            try:
                cursor.execute(f"DROP TABLE {table}")
                print(f"已删除临时表: {table}")
            except Exception as e:
                print(f"删除临时表 {table} 失败: {e}")
        
        conn.commit()
        print("\n清理完成")
        return True
        
    except Exception as e:
        print(f"清理失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    cleanup_temp_tables()