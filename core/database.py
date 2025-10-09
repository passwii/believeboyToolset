import sqlite3
import os

# 数据库文件路径
DB_PATH = 'users.db'

def init_db():
    """初始化数据库，创建用户表和日志表"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            chinese_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建日志表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    
    conn.commit()
    conn.close()

def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 使结果可以通过列名访问
    return conn

def add_user(username, password_hash, chinese_name=None):
    """添加新用户"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO users (username, password_hash, chinese_name) VALUES (?, ?, ?)',
            (username, password_hash, chinese_name)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        # 用户名已存在
        return False
    finally:
        conn.close()

def get_user(username):
    """根据用户名获取用户信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    
    conn.close()
    return user

def get_all_users():
    """获取所有用户"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    
    conn.close()
    return users

def get_user_by_id(user_id):
    """根据用户ID获取用户信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    conn.close()
    return user

def delete_user(user_id):
    """根据用户ID删除用户"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0  # 返回是否成功删除
    except Exception as e:
        return False
    finally:
        conn.close()

def add_log(user_id, username, action, resource=None, details=None,
           ip_address=None, user_agent=None, log_type='user', level='info'):
    """添加日志记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            '''INSERT INTO logs
               (user_id, username, action, resource, details, ip_address, user_agent, log_type, level)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (user_id, username, action, resource, details, ip_address, user_agent, log_type, level)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"添加日志失败: {e}")
        return False
    finally:
        conn.close()

def get_logs(limit=100, log_type=None, level=None, user_id=None):
    """获取日志记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM logs WHERE 1=1"
    params = []
    
    if log_type:
        query += " AND log_type = ?"
        params.append(log_type)
    
    if level:
        query += " AND level = ?"
        params.append(level)
    
    if user_id:
        query += " AND user_id = ?"
        params.append(user_id)
    
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    try:
        cursor.execute(query, params)
        logs = cursor.fetchall()
        return logs
    except Exception as e:
        print(f"获取日志失败: {e}")
        return []
    finally:
        conn.close()

def get_log_count(log_type=None, level=None, user_id=None):
    """获取日志总数"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT COUNT(*) FROM logs WHERE 1=1"
    params = []
    
    if log_type:
        query += " AND log_type = ?"
        params.append(log_type)
    
    if level:
        query += " AND level = ?"
        params.append(level)
    
    if user_id:
        query += " AND user_id = ?"
        params.append(user_id)
    
    try:
        cursor.execute(query, params)
        count = cursor.fetchone()[0]
        return count
    except Exception as e:
        print(f"获取日志总数失败: {e}")
        return 0
    finally:
        conn.close()

def clean_old_logs(days_to_keep=30):
    """清理指定天数之前的日志"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM logs WHERE timestamp < datetime('now', '-{} days')".format(days_to_keep)
        )
        conn.commit()
        return cursor.rowcount
    except Exception as e:
        print(f"清理旧日志失败: {e}")
        return 0
    finally:
        conn.close()

# 初始化数据库
if not os.path.exists(DB_PATH):
    init_db()