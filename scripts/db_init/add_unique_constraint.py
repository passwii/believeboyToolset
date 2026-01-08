"""
添加店铺名称唯一性约束的迁移脚本
"""

import sqlite3
import os

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def add_shop_name_unique_constraint():
    """添加店铺名称唯一性约束"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 先检查是否有重复的店铺名称
        cursor.execute("""
            SELECT shop_name, COUNT(*) as count 
            FROM shops 
            GROUP BY shop_name 
            HAVING count > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("发现重复的店铺名称:")
            for dup in duplicates:
                print(f"  - {dup[0]}: {dup[1]} 条记录")
            
            # 为重复记录添加后缀以使其唯一
            for dup in duplicates:
                shop_name = dup[0]
                cursor.execute("SELECT id FROM shops WHERE shop_name = ?", (shop_name,))
                shop_ids = [row[0] for row in cursor.fetchall()]
                
                # 保留第一个，为其他添加后缀
                for i, shop_id in enumerate(shop_ids[1:], 1):
                    new_name = f"{shop_name}_{i}"
                    cursor.execute("UPDATE shops SET shop_name = ? WHERE id = ?", (new_name, shop_id))
                    print(f"  将店铺 ID {shop_id} 的名称更改为: {new_name}")
        
        # 创建新表，包含唯一性约束
        cursor.execute("""
            CREATE TABLE shops_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shop_name TEXT NOT NULL UNIQUE,
                brand_name TEXT,
                shop_url TEXT NOT NULL,
                operator TEXT,
                shop_type TEXT DEFAULT "自有",
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        
        # 复制数据到新表
        cursor.execute("""
            INSERT INTO shops_new (id, shop_name, brand_name, shop_url, operator, shop_type, created_at, updated_at, created_by)
            SELECT id, shop_name, brand_name, shop_url, operator, shop_type, created_at, updated_at, created_by FROM shops
        """)
        
        # 删除旧表
        cursor.execute("DROP TABLE shops")
        
        # 重命名新表
        cursor.execute("ALTER TABLE shops_new RENAME TO shops")
        
        conn.commit()
        print("店铺名称唯一性约束添加成功")
        return True
    except Exception as e:
        print(f"添加店铺名称唯一性约束失败: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        add_shop_name_unique_constraint()
    else:
        print("数据库文件不存在，请先初始化数据库")