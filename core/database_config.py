"""
数据库时区配置模块
提供全局时区设置，确保所有时间字段默认使用北京时间
"""

import sqlite3
import os
from datetime import datetime

# 数据库文件路径
DB_PATH = 'users.db'

# 北京时间偏移量（+8小时）
BEIJING_TIME_OFFSET = '+8 hours'

def get_db_connection():
    """获取数据库连接，设置全局时区偏移"""
    conn = sqlite3.connect(DB_PATH)
    
    # 设置SQLite的全局时区偏移为北京时间
    conn.execute(f"PRAGMA temp_store = 2")  # 使用临时内存存储
    conn.execute("PRAGMA journal_mode = WAL")  # 使用WAL模式提高并发性能
    
    # 创建自定义函数处理北京时间
    def beijing_now():
        """返回当前北京时间"""
        return datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S')
    
    # 注册自定义函数
    conn.create_function("beijing_now", 0, beijing_now)
    
    conn.row_factory = sqlite3.Row  # 使结果可以通过列名访问
    return conn

def init_db_with_beijing_time():
    """初始化数据库，创建表时使用北京时间作为默认值"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            chinese_name TEXT,
            created_at TIMESTAMP DEFAULT (datetime('now', '+8 hours'))
        )
    ''')
    
    # 创建日志表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
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
    
    # 创建店铺表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_name TEXT NOT NULL,
            brand_name TEXT,
            shop_url TEXT NOT NULL,
            operator TEXT,
            shop_type TEXT DEFAULT "自有",
            created_at TIMESTAMP DEFAULT (datetime('now', '+8 hours')),
            updated_at TIMESTAMP DEFAULT (datetime('now', '+8 hours')),
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')
    
    # 检查并添加缺失的字段（用于更新现有数据库）
    cursor.execute("PRAGMA table_info(shops)")
    existing_columns = [column[1] for column in cursor.fetchall()]
    
    # 添加brand_name字段（如果不存在）
    if 'brand_name' not in existing_columns:
        cursor.execute('ALTER TABLE shops ADD COLUMN brand_name TEXT')
    
    # 添加operator字段（如果不存在）
    if 'operator' not in existing_columns:
        cursor.execute('ALTER TABLE shops ADD COLUMN operator TEXT')
    
    # 添加shop_type字段（如果不存在）
    if 'shop_type' not in existing_columns:
        cursor.execute('ALTER TABLE shops ADD COLUMN shop_type TEXT DEFAULT "自有"')
    
    conn.commit()
    conn.close()

def create_table_with_beijing_time(create_table_sql):
    """
    创建新表时使用北京时间作为默认值
    
    Args:
        create_table_sql (str): CREATE TABLE SQL语句，应包含时间字段
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 确保SQL语句中的时间字段使用北京时间
    modified_sql = create_table_sql.replace(
        "DEFAULT CURRENT_TIMESTAMP", 
        "DEFAULT (datetime('now', '+8 hours'))"
    ).replace(
        "DEFAULT (datetime('now'))", 
        "DEFAULT (datetime('now', '+8 hours'))"
    )
    
    cursor.execute(modified_sql)
    conn.commit()
    conn.close()

def add_column_with_beijing_time(table_name, column_name, column_type="TIMESTAMP"):
    """
    为现有表添加时间字段，使用北京时间作为默认值
    
    Args:
        table_name (str): 表名
        column_name (str): 列名
        column_type (str): 列类型，默认为TIMESTAMP
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 添加带北京时间默认值的列
    cursor.execute(
        f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} DEFAULT (datetime('now', '+8 hours'))"
    )
    
    conn.commit()
    conn.close()

# 初始化数据库
if not os.path.exists(DB_PATH):
    init_db_with_beijing_time()