import sqlite3
import os
from datetime import datetime, timedelta
from .database_config import get_db_connection, init_db_with_beijing_time, DB_PATH

# 数据库文件路径 - 从database_config导入
# DB_PATH = 'users.db'

def update_password(user_id, new_password_hash):
    """更新用户密码"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_password_hash, user_id))
        conn.commit()
        return cursor.rowcount > 0  # 返回是否成功更新
    except Exception as e:
        print(f"更新密码失败: {e}")
        return False
    finally:
        conn.close()

def init_db():
    """初始化数据库，创建用户表和日志表"""
    # 使用新的初始化函数，自动设置北京时间
    init_db_with_beijing_time()

# get_db_connection 函数已从 database_config 导入

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
        # 使用数据库的默认时间设置（已经是北京时间）
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
        # 使用简化的时间计算，数据库已经设置为北京时间
        cursor.execute(
            "DELETE FROM logs WHERE timestamp < datetime('now', '-{} days')".format(days_to_keep)
        )
        conn.commit()
        deleted_count = cursor.rowcount
        print(f"成功清理了 {deleted_count} 条旧日志")
        return deleted_count
    except Exception as e:
        print(f"清理旧日志失败: {e}")
        return 0
    finally:
        conn.close()

def get_all_logs():
    """获取所有日志记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC")
        logs = cursor.fetchall()
        return logs
    except Exception as e:
        print(f"获取所有日志失败: {e}")
        return []
    finally:
        conn.close()

def delete_all_logs():
    """删除所有日志记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 首先获取日志数量
        cursor.execute("SELECT COUNT(*) FROM logs")
        count = cursor.fetchone()[0]
        
        # 然后删除所有日志
        cursor.execute("DELETE FROM logs")
        conn.commit()
        
        print(f"成功删除了 {count} 条日志记录")
        return count
    except Exception as e:
        print(f"删除所有日志失败: {e}")
        return 0
    finally:
        conn.close()

# 店铺相关操作函数
def add_shop(shop_name, brand_name=None, shop_url=None, operator=None, shop_type="自有", created_by=None):
    """添加新店铺"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO shops (shop_name, brand_name, shop_url, operator, shop_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            (shop_name, brand_name, shop_url, operator, shop_type, created_by)
        )
        conn.commit()
        return cursor.lastrowid  # 返回新插入记录的ID
    except Exception as e:
        print(f"添加店铺失败: {e}")
        return False
    finally:
        conn.close()

def get_all_shops():
    """获取所有店铺"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM shops ORDER BY created_at DESC')
        rows = cursor.fetchall()
        # 将tuple转换为字典格式
        shops = []
        for row in rows:
            shop_dict = {
                'id': row[0],
                'shop_name': row[1],
                'brand_name': row[2],
                'shop_url': row[3],
                'operator': row[4],
                'shop_type': row[5],
                'created_at': row[6],
                'updated_at': row[7],
                'created_by': row[8]
            }
            shops.append(shop_dict)
        return shops
    except Exception as e:
        print(f"获取店铺列表失败: {e}")
        return []
    finally:
        conn.close()

def get_shop_by_id(shop_id):
    """根据ID获取店铺信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM shops WHERE id = ?', (shop_id,))
        row = cursor.fetchone()
        if row:
            # 将tuple转换为字典格式
            shop_dict = {
                'id': row[0],
                'shop_name': row[1],
                'brand_name': row[2],
                'shop_url': row[3],
                'operator': row[4],
                'shop_type': row[5],
                'created_at': row[6],
                'updated_at': row[7],
                'created_by': row[8]
            }
            return shop_dict
        return None
    except Exception as e:
        print(f"获取店铺信息失败: {e}")
        return None
    finally:
        conn.close()

def update_shop(shop_id, shop_name, brand_name=None, shop_url=None, operator=None, shop_type=None):
    """更新店铺信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            '''UPDATE shops SET shop_name = ?, brand_name = ?, shop_url = ?, operator = ?, shop_type = ?, updated_at = (datetime('now', '+8 hours'))
               WHERE id = ?''',
            (shop_name, brand_name, shop_url, operator, shop_type, shop_id)
        )
        conn.commit()
        return cursor.rowcount > 0  # 返回是否成功更新
    except Exception as e:
        print(f"更新店铺信息失败: {e}")
        return False
    finally:
        conn.close()

def delete_shop(shop_id):
    """删除店铺"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM shops WHERE id = ?', (shop_id,))
        conn.commit()
        return cursor.rowcount > 0  # 返回是否成功删除
    except Exception as e:
        print(f"删除店铺失败: {e}")
        return False
    finally:
        conn.close()

# 初始化数据库
if not os.path.exists(DB_PATH):
    init_db()