#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单时区修复脚本
直接更新表结构，设置北京时间默认值
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

def fix_table_timezone(table_name):
    """修复单个表的时区设置"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print(f"正在修复表: {table_name}")
        
        # 获取表结构
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # 构建列定义
        column_defs = []
        for col in columns:
            col_name = col[1]
            col_type = col[2]
            not_null = "NOT NULL" if col[3] else ""
            default_val = col[4]
            pk = "PRIMARY KEY" if col[5] else ""
            
            # 修改时间字段的默认值
            if 'TIME' in col_type.upper() or 'DATE' in col_type.upper():
                if default_val and 'CURRENT_TIMESTAMP' in default_val:
                    default_val = "DEFAULT (datetime('now', '+8 hours'))"
            
            # 构建列定义
            col_def = f"{col_name} {col_type}"
            if not_null:
                col_def += f" {not_null}"
            if default_val:
                col_def += f" {default_val}"
            if pk:
                col_def += f" {pk}"
            
            column_defs.append(col_def)
        
        # 创建新表
        new_table = f"{table_name}_new"
        create_sql = f"CREATE TABLE {new_table} ({', '.join(column_defs)})"
        
        # 临时禁用外键约束
        cursor.execute("PRAGMA foreign_keys = OFF")
        cursor.execute(create_sql)
        
        # 复制数据
        cursor.execute(f"INSERT INTO {new_table} SELECT * FROM {table_name}")
        
        # 删除原表
        cursor.execute(f"DROP TABLE {table_name}")
        
        # 重命名新表
        cursor.execute(f"ALTER TABLE {new_table} RENAME TO {table_name}")
        
        # 重新启用外键约束
        cursor.execute("PRAGMA foreign_keys = ON")
        
        conn.commit()
        print(f"表 {table_name} 修复完成")
        return True
        
    except Exception as e:
        print(f"修复表 {table_name} 失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """主函数"""
    if not os.path.exists(DB_PATH):
        print(f"数据库文件不存在: {DB_PATH}")
        return False
    
    print("=== 简单时区修复脚本 ===")
    print("此脚本将修复表的时区设置")
    
    # 需要修复的表
    tables_to_fix = ['logs']  # 只修复logs表，其他已经修复
    
    success_count = 0
    for table in tables_to_fix:
        if fix_table_timezone(table):
            success_count += 1
    
    print(f"\n修复完成！成功修复 {success_count}/{len(tables_to_fix)} 个表")
    return success_count == len(tables_to_fix)

if __name__ == "__main__":
    main()