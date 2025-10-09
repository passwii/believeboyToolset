import hashlib
from core.database import add_user, get_user, get_all_users, delete_user, get_user_by_id

class User:
    """用户模型类"""
    
    def __init__(self, username, password_hash=None, user_id=None, chinese_name=None, created_at=None):
        self.id = user_id
        self.username = username
        self.password_hash = password_hash
        self.chinese_name = chinese_name
        self.created_at = created_at
    
    @staticmethod
    def hash_password(password):
        """对密码进行哈希处理"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(username, password):
        """验证用户名和密码"""
        user = get_user(username)
        if user:
            return user['password_hash'] == User.hash_password(password)
        return False
    
    @staticmethod
    def create_user(username, password, chinese_name=None):
        """创建新用户"""
        password_hash = User.hash_password(password)
        return add_user(username, password_hash, chinese_name)
    
    @staticmethod
    def get_user_by_username(username):
        """根据用户名获取用户"""
        user_data = get_user(username)
        if user_data:
            return User(
                username=user_data['username'],
                password_hash=user_data['password_hash'],
                user_id=user_data['id'],
                chinese_name=user_data['chinese_name'],
                created_at=user_data['created_at']
            )
        return None
    
    @staticmethod
    def get_user_by_id(user_id):
        """根据用户ID获取用户"""
        user_data = get_user_by_id(user_id)
        if user_data:
            return User(
                username=user_data['username'],
                password_hash=user_data['password_hash'],
                user_id=user_data['id'],
                chinese_name=user_data['chinese_name'],
                created_at=user_data['created_at']
            )
        return None
    
    @staticmethod
    def get_all_users():
        """获取所有用户"""
        users_data = get_all_users()
        return [
            User(
                username=user['username'],
                password_hash=user['password_hash'],
                user_id=user['id'],
                chinese_name=user['chinese_name'],
                created_at=user['created_at']
            ) for user in users_data
        ]

    @staticmethod
    def delete_user(user_id):
        """删除用户"""
        return delete_user(user_id)

# 初始化默认用户（如果数据库为空）
def init_default_users():
    """初始化默认用户"""
    users = User.get_all_users()
    if not users:
        # 添加默认用户
        User.create_user("damonrock", "jrway2012")
# 初始化默认用户
init_default_users()