#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
设置数据库默认时区为北京时间
此脚本会修改数据库，确保所有时间字段默认使用北京时间
"""

import sqlite3
import os
import sys
from datetime import datetime, timedelta

# 设置输出编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def set_beijing_timezone_default():
    """设置数据库默认时区为北京时间"""
    if not os.path.exists(DB_PATH):
        print(f"数据库文件不存在: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("开始设置数据库默认时区为北京时间...")
        
        # 获取所有表名
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # 排除系统表
        tables = [table for table in tables if not table.startswith('sqlite_')]
        
        updated_tables = 0
        
        for table in tables:
            print(f"\n正在处理表: {table}")
            
            # 获取表结构
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            
            # 查找时间相关的列
            time_columns = []
            for column in columns:
                col_name = column[1]
                col_type = column[2].upper()
                if 'TIME' in col_type or 'DATE' in col_type or 'TIMESTAMP' in col_type:
                    time_columns.append((col_name, col_type))
            
            if not time_columns:
                print(f"  表 {table} 中没有时间字段，跳过")
                continue
            
            # 检查是否已经有默认值为北京时间的字段
            has_beijing_default = False
            for col_name, col_type in time_columns:
                cursor.execute(f"PRAGMA table_info({table})")
                columns_info = cursor.fetchall()
                for col_info in columns_info:
                    if col_info[1] == col_name and col_info[4] and '+8 hours' in col_info[4]:
                        has_beijing_default = True
                        break
                
                if has_beijing_default:
                    break
            
            if has_beijing_default:
                print(f"  表 {table} 已经设置了北京时间默认值，跳过")
                continue
            
            # 对于SQLite，我们不能直接修改列的默认值，需要重建表
            print(f"  需要重建表 {table} 以设置北京时间默认值")
            
            # 获取创建表的SQL
            cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table}'")
            create_sql = cursor.fetchone()[0]
            
            # 修改SQL，将时间默认值改为北京时间
            modified_sql = create_sql.replace(
                "DEFAULT CURRENT_TIMESTAMP", 
                "DEFAULT (datetime('now', '+8 hours'))"
            ).replace(
                "DEFAULT (datetime('now'))", 
                "DEFAULT (datetime('now', '+8 hours'))"
            )
            
            # 创建临时表
            temp_table = f"{table}_temp_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            modified_sql = modified_sql.replace(f"CREATE TABLE {table}", f"CREATE TABLE {temp_table}")
            
            print(f"  创建临时表: {temp_table}")
            cursor.execute(modified_sql)
            
            # 复制数据
            print(f"  复制数据到临时表")
            cursor.execute(f"INSERT INTO {temp_table} SELECT * FROM {table}")
            
            # 删除原表
            print(f"  删除原表")
            cursor.execute(f"DROP TABLE {table}")
            
            # 重命名临时表
            print(f"  重命名临时表为原表名")
            cursor.execute(f"ALTER TABLE {temp_table} RENAME TO {table}")
            
            # 重新创建索引（如果有）
            cursor.execute(f"PRAGMA index_list({table})")
            indexes = cursor.fetchall()
            for index in indexes:
                index_name = index[1]
                if index_name:  # 跳过自动生成的索引
                    cursor.execute(f"PRAGMA index_info({index_name})")
                    index_info = cursor.fetchall()
                    if index_info:
                        # 重建索引
                        columns = [info[2] for info in index_info]
                        cursor.execute(f"CREATE INDEX {index_name} ON {table} ({', '.join(columns)})")
            
            updated_tables += 1
            print(f"  表 {table} 更新完成")
        
        # 提交所有更改
        conn.commit()
        print(f"\n时区设置完成！共更新了 {updated_tables} 个表")
        
        # 显示当前时区设置
        print("\n当前时区设置验证:")
        cursor.execute("SELECT datetime('now') as utc_time, datetime('now', '+8 hours') as beijing_time")
        times = cursor.fetchone()
        print(f"UTC时间: {times[0]}")
        print(f"北京时间: {times[1]}")
        
        return True
        
    except Exception as e:
        print(f"设置时区失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def create_new_table_with_beijing_time(table_name, columns):
    """
    创建新表，自动为时间字段设置北京时间默认值
    
    Args:
        table_name (str): 表名
        columns (list): 列定义列表，格式为 ["column_name TYPE", ...]
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 构建CREATE TABLE语句
        columns_sql = ", ".join(columns)
        
        # 替换时间字段的默认值
        columns_sql = columns_sql.replace(
            "DEFAULT CURRENT_TIMESTAMP", 
            "DEFAULT (datetime('now', '+8 hours'))"
        ).replace(
            "DEFAULT (datetime('now'))", 
            "DEFAULT (datetime('now', '+8 hours'))"
        )
        
        create_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns_sql})"
        
        cursor.execute(create_sql)
        conn.commit()
        
        print(f"表 {table_name} 创建成功，时间字段默认使用北京时间")
        return True
        
    except Exception as e:
        print(f"创建表失败: {e}")
        return False
    finally:
        conn.close()

def add_time_column_with_beijing_default(table_name, column_name, column_type="TIMESTAMP"):
    """
    为现有表添加时间字段，使用北京时间作为默认值
    
    Args:
        table_name (str): 表名
        column_name (str): 列名
        column_type (str): 列类型，默认为TIMESTAMP
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 添加带北京时间默认值的列
        cursor.execute(
            f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} DEFAULT (datetime('now', '+8 hours'))"
        )
        
        conn.commit()
        print(f"为表 {table_name} 添加了时间字段 {column_name}，默认使用北京时间")
        return True
        
    except Exception as e:
        print(f"添加列失败: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='设置数据库默认时区为北京时间')
    parser.add_argument('--auto', action='store_true', help='自动执行，跳过确认提示')
    args = parser.parse_args()
    
    print("=== 数据库时区设置脚本 ===")
    print("此脚本将设置数据库默认时区为北京时间")
    print("注意: 此操作会重建表，请确保已备份数据库")
    
    if args.auto:
        print("自动模式：跳过确认提示")
        proceed = True
    else:
        try:
            confirm = input("确定要继续吗？(y/N): ")
            proceed = confirm.lower() == 'y'
        except (EOFError, KeyboardInterrupt):
            print("\n检测到非交互环境，使用自动模式")
            proceed = True
    
    if proceed:
        success = set_beijing_timezone_default()
        if success:
            print("\n时区设置成功完成！")
            print("\n现在，当您创建新表或添加时间字段时，请使用以下函数:")
            print("- create_new_table_with_beijing_time() - 创建新表")
            print("- add_time_column_with_beijing_default() - 添加时间字段")
        else:
            print("\n时区设置失败！")
    else:
        print("操作已取消")