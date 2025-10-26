"""
店铺模型
处理店铺相关的业务逻辑
"""

from core.database import get_db_connection, add_shop, get_all_shops, get_shop_by_id, update_shop, delete_shop
from datetime import datetime

class Shop:
    def __init__(self, id=None, shop_name=None, brand_name=None, shop_url=None, operator=None, shop_type=None, created_at=None, updated_at=None, created_by=None):
        self.id = id
        self.shop_name = shop_name
        self.brand_name = brand_name
        self.shop_url = shop_url
        self.operator = operator
        self.shop_type = shop_type
        self.created_at = created_at
        self.updated_at = updated_at
        self.created_by = created_by
    
    @classmethod
    def create(cls, shop_name, brand_name=None, shop_url=None, operator=None, shop_type="自有", created_by=None):
        """创建新店铺"""
        if not shop_name or not shop_url:
            return None
        
        # 检查店铺名称是否已存在
        if cls.shop_name_exists(shop_name):
            return None
        
        shop_id = add_shop(shop_name, brand_name, shop_url, operator, shop_type, created_by)
        if shop_id:
            return cls.get_by_id(shop_id)
        return None
    
    @classmethod
    def get_by_id(cls, shop_id):
        """根据ID获取店铺"""
        shop_data = get_shop_by_id(shop_id)
        if shop_data:
            return cls(
                id=shop_data['id'],
                shop_name=shop_data['shop_name'],
                brand_name=shop_data['brand_name'] if shop_data['brand_name'] else None,
                shop_url=shop_data['shop_url'],
                operator=shop_data['operator'] if shop_data['operator'] else None,
                shop_type=shop_data['shop_type'] if shop_data['shop_type'] else '自有',
                created_at=shop_data['created_at'],
                updated_at=shop_data['updated_at'],
                created_by=shop_data['created_by']
            )
        return None
    
    @classmethod
    def get_all(cls):
        """获取所有店铺"""
        shops_data = get_all_shops()
        shops = []
        for shop_data in shops_data:
            shops.append(cls(
                id=shop_data['id'],
                shop_name=shop_data['shop_name'],
                brand_name=shop_data['brand_name'] if shop_data['brand_name'] else None,
                shop_url=shop_data['shop_url'],
                operator=shop_data['operator'] if shop_data['operator'] else None,
                shop_type=shop_data['shop_type'] if shop_data['shop_type'] else '自有',
                created_at=shop_data['created_at'],
                updated_at=shop_data['updated_at'],
                created_by=shop_data['created_by']
            ))
        return shops
    
    @classmethod
    def get_by_type(cls, shop_type):
        """根据类型获取店铺"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM shops WHERE shop_type = ?", (shop_type,))
            shops_data = cursor.fetchall()
            shops = []
            for shop_data in shops_data:
                shops.append(cls(
                    id=shop_data['id'],
                    shop_name=shop_data['shop_name'],
                    brand_name=shop_data['brand_name'] if shop_data['brand_name'] else None,
                    shop_url=shop_data['shop_url'],
                    operator=shop_data['operator'] if shop_data['operator'] else None,
                    shop_type=shop_data['shop_type'] if shop_data['shop_type'] else '自有',
                    created_at=shop_data['created_at'],
                    updated_at=shop_data['updated_at'],
                    created_by=shop_data['created_by']
                ))
            return shops
        except Exception as e:
            print(f"根据类型获取店铺失败: {e}")
            return []
        finally:
            conn.close()
    
    @classmethod
    def get_by_user_permission(cls, username, chinese_name=None, is_admin=False):
        """根据用户权限获取店铺"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            shops = []
            
            if is_admin:
                # 管理员可以看到所有店铺
                cursor.execute("SELECT * FROM shops ORDER BY shop_type, shop_name")
            else:
                # 普通用户只能看到自己负责的店铺（自有和竞品）
                # 使用中文名称匹配
                if chinese_name:
                    cursor.execute("""
                        SELECT * FROM shops
                        WHERE operator = ?
                        ORDER BY shop_type, shop_name
                    """, (chinese_name,))
                else:
                    # 如果没有中文名称，看不到任何店铺
                    pass  # 返回空列表
            
            shops_data = cursor.fetchall()
            for shop_data in shops_data:
                shops.append(cls(
                    id=shop_data['id'],
                    shop_name=shop_data['shop_name'],
                    brand_name=shop_data['brand_name'] if shop_data['brand_name'] else None,
                    shop_url=shop_data['shop_url'],
                    operator=shop_data['operator'] if shop_data['operator'] else None,
                    shop_type=shop_data['shop_type'] if shop_data['shop_type'] else '自有',
                    created_at=shop_data['created_at'],
                    updated_at=shop_data['updated_at'],
                    created_by=shop_data['created_by']
                ))
            return shops
        except Exception as e:
            print(f"根据用户权限获取店铺失败: {e}")
            return []
        finally:
            conn.close()
    
    @classmethod
    def get_shops_by_user_permission(cls, username, chinese_name=None, is_admin=False):
        """根据用户权限获取分类店铺（自有和竞品分开）"""
        all_shops = cls.get_by_user_permission(username, chinese_name, is_admin)
        
        own_shops = []
        competitor_shops = []
        
        for shop in all_shops:
            if shop.shop_type == '自有':
                own_shops.append(shop)
            elif shop.shop_type == '竞品':
                competitor_shops.append(shop)
        
        return {
            'own_shops': own_shops,
            'competitor_shops': competitor_shops
        }
    
    def update(self, shop_name=None, brand_name=None, shop_url=None, operator=None, shop_type=None):
        """更新店铺信息"""
        # 如果要更新店铺名称，检查是否与其他店铺重复
        if shop_name and shop_name != self.shop_name:
            if self.shop_name_exists(shop_name, exclude_id=self.id):
                return False
        
        if shop_name:
            self.shop_name = shop_name
        if brand_name is not None:
            self.brand_name = brand_name
        if shop_url:
            self.shop_url = shop_url
        if operator is not None:
            self.operator = operator
        if shop_type is not None:
            self.shop_type = shop_type
        
        success = update_shop(self.id, self.shop_name, self.brand_name, self.shop_url, self.operator, self.shop_type)
        if success:
            # 重新获取更新后的数据
            updated_shop = self.get_by_id(self.id)
            if updated_shop:
                self.updated_at = updated_shop.updated_at
        return success
    
    def delete(self):
        """删除店铺"""
        return delete_shop(self.id)
    
    def to_dict(self):
        """将店铺对象转换为字典"""
        return {
            'id': self.id,
            'shop_name': self.shop_name,
            'brand_name': self.brand_name,
            'shop_url': self.shop_url,
            'operator': self.operator,
            'shop_type': self.shop_type,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'created_by': self.created_by
        }
    
    @staticmethod
    def validate_shop_url(url):
        """验证店铺URL格式"""
        if not url:
            return False
        
        # 简单的URL验证，确保以http://或https://开头
        return url.startswith('http://') or url.startswith('https://')
    
    @staticmethod
    def shop_name_exists(shop_name, exclude_id=None):
        """检查店铺名称是否已存在"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            if exclude_id:
                cursor.execute("SELECT id FROM shops WHERE shop_name = ? AND id != ?", (shop_name, exclude_id))
            else:
                cursor.execute("SELECT id FROM shops WHERE shop_name = ?", (shop_name,))
            
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"检查店铺名称是否存在失败: {e}")
            return False
        finally:
            conn.close()