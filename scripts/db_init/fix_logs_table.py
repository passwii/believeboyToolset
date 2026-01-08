#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
专门修复logs表的时区设置
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

def fix_logs_table():
    """修复logs表的时区设置"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("正在修复logs表...")
        
        # 临时禁用外键约束
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # 创建新的logs表结构
        cursor.execute('''
            CREATE TABLE logs_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT (datetime('now', '+8 hours')),
                user_id INTEGER,
                username VARCHAR(50),
                action VARCHAR(100) NOT NULL,
                resource VARCHAR(100),
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                log_type VARCHAR(20) DEFAULT 'user',
                level VARCHAR(10) DEFAULT 'info',
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # 复制数据
        cursor.execute('''
            INSERT INTO logs_new 
            SELECT id, timestamp, user_id, username, action, resource, details, ip_address, user_agent, log_type, level 
            FROM logs
        ''')
        
        # 删除原表
        cursor.execute("DROP TABLE logs")
        
        # 重命名新表
        cursor.execute("ALTER TABLE logs_new RENAME TO logs")
        
        # 重新启用外键约束
        cursor.execute("PRAGMA foreign_keys = ON")
        
        conn.commit()
        print("logs表修复完成")
        return True
        
    except Exception as e:
        print(f"修复logs表失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=== logs表时区修复脚本 ===")
    success = fix_logs_table()
    if success:
        print("修复成功！")
    else:
        print("修复失败！")