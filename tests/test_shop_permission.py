#!/usr/bin/env python3
"""
测试店铺权限控制功能
验证用户只能看到自己负责的自有店铺和竞品店铺
"""

import sys
import os

# 添加项目根目录到 sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.shop_model import Shop
from core.user_model import User
from core.database_config import get_db_connection

def setup_test_data():
    """设置测试数据"""
    print("=== 设置测试数据 ===\n")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 创建测试用户
    test_users = [
        ('youshuai', 'password123', '尤帅'),
        ('other_user', 'password123', '其他用户'),
        ('zhangsan', 'password123', '张三'),  # 添加张三用户
        ('test_user', 'password123', None),  # 无中文名用户
    ]
    
    for username, password, chinese_name in test_users:
        # 检查用户是否已存在
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if not cursor.fetchone():
            password_hash = User.hash_password(password)
            cursor.execute(
                "INSERT INTO users (username, password_hash, chinese_name) VALUES (?, ?, ?)",
                (username, password_hash, chinese_name)
            )
            print(f"✓ 创建用户: {username} (中文名: {chinese_name})")
        else:
            print(f"- 用户已存在: {username}")
    
    # 获取用户ID
    cursor.execute("SELECT id, chinese_name FROM users WHERE username IN ('youshuai', 'damonrock')")
    users = cursor.fetchall()
    youshuai_id = None
    admin_id = None
    
    for user_id, chinese_name in users:
        if chinese_name == '尤帅':
            youshuai_id = user_id
        elif chinese_name == None and user_id:  # damonrock用户
            admin_id = user_id
    
    # 创建测试店铺
    test_shops = [
        ('尤帅的自有店铺1', '品牌A', 'https://shop1.example.com', '尤帅', '自有'),
        ('尤帅的自有店铺2', '品牌B', 'https://shop2.example.com', '尤帅', '自有'),
        ('其他人的自有店铺', '品牌C', 'https://shop3.example.com', '张三', '自有'),
        ('尤帅的竞品店铺1', '竞品品牌A', 'https://competitor1.example.com', '尤帅', '竞品'),
        ('张三的竞品店铺2', '竞品品牌B', 'https://competitor2.example.com', '张三', '竞品'),
        ('无负责人的竞品店铺', '竞品品牌C', 'https://competitor3.example.com', None, '竞品'),
    ]
    
    for shop_name, brand_name, shop_url, operator, shop_type in test_shops:
        # 检查店铺是否已存在
        cursor.execute("SELECT id FROM shops WHERE shop_name = ?", (shop_name,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO shops (shop_name, brand_name, shop_url, operator, shop_type, created_by) VALUES (?, ?, ?, ?, ?, ?)",
                (shop_name, brand_name, shop_url, operator, shop_type, youshuai_id if youshuai_id else admin_id)
            )
            print(f"✓ 创建店铺: {shop_name} (类型: {shop_type}, 负责人: {operator})")
        else:
            print(f"- 店铺已存在: {shop_name}")
    
    conn.commit()
    conn.close()
    print("\n测试数据设置完成！\n")

def test_shop_permission():
    """测试店铺权限控制"""
    print("=== 店铺权限控制测试 ===\n")
    
    # 测试1: 尤帅用户权限
    print("测试1: 尤帅用户权限")
    shops_data = Shop.get_shops_by_user_permission('youshuai', '尤帅', is_admin=False)
    
    print(f"  自有店铺数量: {len(shops_data['own_shops'])}")
    for shop in shops_data['own_shops']:
        print(f"    - {shop.shop_name} (负责人: {shop.operator})")
    
    print(f"  竞品店铺数量: {len(shops_data['competitor_shops'])}")
    for shop in shops_data['competitor_shops']:
        print(f"    - {shop.shop_name}")
    
    youshuai_expected_own = 3  # 尤帅应该看到3个自有店铺
    youshuai_expected_competitor = 1  # 尤帅应该看到1个自己负责的竞品店铺
    
    if len(shops_data['own_shops']) == youshuai_expected_own and len(shops_data['competitor_shops']) == youshuai_expected_competitor:
        print("  ✓ 尤帅用户权限正常")
    else:
        print("  ✗ 尤帅用户权限异常")
    print()
    
    # 测试2: 管理员权限
    print("测试2: 管理员权限 (damonrock)")
    shops_data = Shop.get_shops_by_user_permission('damonrock', None, is_admin=True)
    
    print(f"  自有店铺数量: {len(shops_data['own_shops'])}")
    for shop in shops_data['own_shops']:
        print(f"    - {shop.shop_name} (负责人: {shop.operator})")
    
    print(f"  竞品店铺数量: {len(shops_data['competitor_shops'])}")
    for shop in shops_data['competitor_shops']:
        print(f"    - {shop.shop_name}")
    
    admin_own = len(shops_data['own_shops'])
    admin_competitor = len(shops_data['competitor_shops'])
    
    if admin_own >= 3 and admin_competitor >= 3:  # 管理员应该看到所有店铺（包括无负责人的）
        print("  ✓ 管理员权限正常")
    else:
        print("  ✗ 管理员权限异常")
    print()
    
    # 测试3: 无中文名用户权限
    print("测试3: 无中文名用户权限")
    shops_data = Shop.get_shops_by_user_permission('test_user', None, is_admin=False)
    
    print(f"  自有店铺数量: {len(shops_data['own_shops'])}")
    print(f"  竞品店铺数量: {len(shops_data['competitor_shops'])}")
    
    if len(shops_data['own_shops']) == 0 and len(shops_data['competitor_shops']) == 0:
        print("  ✓ 无中文名用户权限正常（看不到任何店铺）")
    else:
        print("  ✗ 无中文名用户权限异常")
    print()
    
    # 测试4: 张三用户权限
    print("测试4: 张三用户权限")
    shops_data = Shop.get_shops_by_user_permission('zhangsan', '张三', is_admin=False)
    
    print(f"  自有店铺数量: {len(shops_data['own_shops'])}")
    for shop in shops_data['own_shops']:
        print(f"    - {shop.shop_name} (负责人: {shop.operator})")
    
    print(f"  竞品店铺数量: {len(shops_data['competitor_shops'])}")
    for shop in shops_data['competitor_shops']:
        print(f"    - {shop.shop_name} (负责人: {shop.operator})")
    
    if len(shops_data['own_shops']) == 1 and len(shops_data['competitor_shops']) == 1:
        print("  ✓ 张三用户权限正常（可以看到自己负责的店铺）")
    else:
        print("  ✗ 张三用户权限异常")
    print()

def show_current_shops():
    """显示当前所有店铺信息"""
    print("=== 当前店铺信息 ===\n")
    
    all_shops = Shop.get_all()
    print(f"总店铺数量: {len(all_shops)}\n")
    
    for shop in all_shops:
        print(f"店铺: {shop.shop_name}")
        print(f"  类型: {shop.shop_type}")
        print(f"  负责人: {shop.operator or '无'}")
        print(f"  品牌: {shop.brand_name or '无'}")
        print(f"  链接: {shop.shop_url}")
        print()

if __name__ == "__main__":
    # 显示当前店铺信息
    show_current_shops()
    
    # 设置测试数据
    setup_test_data()
    
    # 测试权限控制
    test_shop_permission()
    
    print("=== 测试完成 ===")