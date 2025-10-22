#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证数据库时区设置脚本
检查数据库中的时间字段是否正确使用北京时间
"""

import sqlite3
import os
import sys
from datetime import datetime

# 设置输出编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def verify_timezone():
    """验证数据库时区设置"""
    if not os.path.exists(DB_PATH):
        print(f"数据库文件不存在: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("=== 数据库时区验证 ===\n")
        
        # 1. 检查基本时区功能
        print("1. 基本时区功能检查:")
        cursor.execute("SELECT datetime('now') as utc_time, datetime('now', '+8 hours') as beijing_time")
        times = cursor.fetchone()
        print(f"   UTC时间: {times[0]}")
        print(f"   北京时间: {times[1]}")
        
        # 2. 检查所有表的时间字段默认值
        print("\n2. 表时间字段默认值检查:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # 排除系统表
        tables = [table for table in tables if not table.startswith('sqlite_')]
        
        for table in tables:
            print(f"\n   表: {table}")
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            
            time_columns = []
            for column in columns:
                col_name = column[1]
                col_type = column[2].upper()
                default_val = column[4]
                
                if 'TIME' in col_type or 'DATE' in col_type or 'TIMESTAMP' in col_type:
                    time_columns.append((col_name, col_type, default_val))
            
            if time_columns:
                for col_name, col_type, default_val in time_columns:
                    if default_val and '+8 hours' in default_val:
                        print(f"     [OK] {col_name} ({col_type}): {default_val}")
                    else:
                        print(f"     [WARNING] {col_name} ({col_type}): {default_val or '无默认值'}")
            else:
                print(f"     - 无时间字段")
        
        # 3. 检查最近的数据记录
        print("\n3. 最近数据记录检查:")
        
        # 检查日志表
        try:
            cursor.execute("SELECT timestamp FROM logs ORDER BY timestamp DESC LIMIT 3")
            logs = cursor.fetchall()
            if logs:
                print("   日志表最近3条记录:")
                for i, (timestamp,) in enumerate(logs, 1):
                    print(f"     {i}. {timestamp}")
            else:
                print("   日志表: 无数据")
        except:
            print("   日志表: 不存在或查询失败")
        
        # 检查用户表
        try:
            cursor.execute("SELECT created_at FROM users ORDER BY created_at DESC LIMIT 3")
            users = cursor.fetchall()
            if users:
                print("   用户表最近3条记录:")
                for i, (created_at,) in enumerate(users, 1):
                    print(f"     {i}. {created_at}")
            else:
                print("   用户表: 无数据")
        except:
            print("   用户表: 不存在或查询失败")
        
        # 检查店铺表
        try:
            cursor.execute("SELECT created_at, updated_at FROM shops ORDER BY created_at DESC LIMIT 3")
            shops = cursor.fetchall()
            if shops:
                print("   店铺表最近3条记录:")
                for i, (created_at, updated_at) in enumerate(shops, 1):
                    print(f"     {i}. 创建: {created_at}, 更新: {updated_at}")
            else:
                print("   店铺表: 无数据")
        except:
            print("   店铺表: 不存在或查询失败")
        
        # 4. 测试插入新记录
        print("\n4. 新记录插入测试:")
        try:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS timezone_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_time TIMESTAMP DEFAULT (datetime('now', '+8 hours'))
                )
            ''')
            
            cursor.execute("INSERT INTO timezone_test (test_time) VALUES (NULL)")
            cursor.execute("SELECT test_time FROM timezone_test ORDER BY id DESC LIMIT 1")
            test_time = cursor.fetchone()[0]
            
            print(f"   测试表插入时间: {test_time}")
            
            # 清理测试数据
            cursor.execute("DELETE FROM timezone_test WHERE id = (SELECT MAX(id) FROM timezone_test)")
            
        except Exception as e:
            print(f"   插入测试失败: {e}")
        
        print("\n=== 验证完成 ===")
        print("\n总结:")
        print("- 如果所有时间字段默认值都显示 ✓，说明时区设置正确")
        print("- 如果有 ⚠ 标记，建议运行 set_beijing_timezone_default.py 脚本")
        print("- 检查最近记录的时间戳是否符合北京时间")
        
        return True
        
    except Exception as e:
        print(f"验证过程中出错: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    verify_timezone()