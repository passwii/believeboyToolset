"""
店铺表迁移脚本
添加品牌名称、运营者和店铺属性字段
"""

import sqlite3
import os

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def migrate_shop_table():
    """迁移店铺表，添加新字段"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查是否已经存在新字段
        cursor.execute("PRAGMA table_info(shops)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # 添加品牌名称字段
        if 'brand_name' not in columns:
            cursor.execute('ALTER TABLE shops ADD COLUMN brand_name TEXT')
            print("已添加品牌名称字段")
        
        # 添加运营者字段
        if 'operator' not in columns:
            cursor.execute('ALTER TABLE shops ADD COLUMN operator TEXT')
            print("已添加运营者字段")
        
        # 添加店铺属性字段
        if 'shop_type' not in columns:
            cursor.execute('ALTER TABLE shops ADD COLUMN shop_type TEXT DEFAULT "自有"')
            print("已添加店铺属性字段")
        
        conn.commit()
        print("店铺表迁移完成")
        return True
    except Exception as e:
        print(f"店铺表迁移失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        migrate_shop_table()
    else:
        print("数据库文件不存在，请先初始化数据库")