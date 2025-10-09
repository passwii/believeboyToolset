from core.user_model import User

class AuthService:
    """认证服务类"""
    
    @staticmethod
    def authenticate_user(username, password):
        """验证用户身份"""
        return User.verify_password(username, password)
    
    @staticmethod
    def create_user(username, password, chinese_name=None):
        """创建新用户"""
        return User.create_user(username, password, chinese_name)
    
    @staticmethod
    def get_user(username):
        """获取用户信息"""
        return User.get_user_by_username(username)
    
    @staticmethod
    def get_all_users():
        """获取所有用户"""
        return User.get_all_users()