"""
日志服务模块
提供统一的日志记录接口和装饰器
"""

import functools
from flask import request, session
from core.database import add_log, get_user
import hashlib
import time

class LogLevel:
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class LogType:
    USER = "user"
    SYSTEM = "system"
    SECURITY = "security"

class LogService:
    @staticmethod
    def log(action, resource=None, details=None, log_type=LogType.USER, level=LogLevel.INFO, user_id=None, username=None):
        """
        记录日志
        
        参数:
            action: 操作类型
            resource: 操作资源
            details: 详细信息
            log_type: 日志类型 (user, system, security)
            level: 日志级别 (debug, info, warning, error, critical)
            user_id: 用户ID (可选，默认从session获取)
            username: 用户名 (可选，默认从session获取)
        """
        try:
            # 从session获取用户信息，如果没有提供
            if not user_id and not username and 'username' in session:
                username = session['username']
                user = get_user(username)
                if user:
                    user_id = user['id']
                    # 如果有中文姓名，则在username中包含中文姓名
                    if user['chinese_name']:
                        username = f"{username}({user['chinese_name']})"
            
            # 获取请求信息
            ip_address = None
            user_agent = None
            
            if request:
                ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
                user_agent = request.headers.get('User-Agent', 'unknown')
            
            # 添加日志记录
            add_log(
                user_id=user_id,
                username=username,
                action=action,
                resource=resource,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                log_type=log_type,
                level=level
            )
        except Exception as e:
            print(f"记录日志失败: {e}")

def log_action(action, resource=None, log_type=LogType.USER, level=LogLevel.INFO):
    """
    装饰器：记录函数调用日志
    
    参数:
        action: 操作类型
        resource: 操作资源
        log_type: 日志类型
        level: 日志级别
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            result = None
            error = None
            
            try:
                result = f(*args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                # 计算执行时间
                execution_time = time.time() - start_time
                
                # 构建详细信息
                details = f"函数: {f.__name__}, 执行时间: {execution_time:.3f}秒"
                if error:
                    details += f", 错误: {error}"
                    level_to_use = LogLevel.ERROR
                else:
                    level_to_use = level
                
                # 记录日志
                LogService.log(
                    action=action,
                    resource=resource,
                    details=details,
                    log_type=log_type,
                    level=level_to_use
                )
        
        return decorated_function
    return decorator

def log_user_action(action, resource=None):
    """
    装饰器：记录用户操作日志
    
    参数:
        action: 操作类型
        resource: 操作资源
    """
    return log_action(action, resource, LogType.USER, LogLevel.INFO)

def log_security_event(action, details=None):
    """
    记录安全事件日志
    
    参数:
        action: 事件类型
        details: 详细信息
    """
    LogService.log(
        action=action,
        details=details,
        log_type=LogType.SECURITY,
        level=LogLevel.WARNING
    )

def log_system_event(action, details=None, level=LogLevel.INFO):
    """
    记录系统事件日志
    
    参数:
        action: 事件类型
        details: 详细信息
        level: 日志级别
    """
    LogService.log(
        action=action,
        details=details,
        log_type=LogType.SYSTEM,
        level=level
    )

def log_login_attempt(username, success, ip_address=None):
    """
    记录登录尝试
    
    参数:
        username: 用户名
        success: 是否成功
        ip_address: IP地址
    """
    # 获取用户的中文姓名
    user = get_user(username)
    display_name = username
    if user and user['chinese_name']:
        display_name = f"{username}({user['chinese_name']})"
    
    action = "登录成功" if success else "登录失败"
    details = f"用户名: {display_name}"
    
    LogService.log(
        action=action,
        resource="认证",
        details=details,
        log_type=LogType.SECURITY,
        level=LogLevel.INFO if success else LogLevel.WARNING
    )

def log_user_management(action, target_username, details=None):
    """
    记录用户管理操作
    
    参数:
        action: 操作类型 (创建用户, 删除用户, 修改用户)
        target_username: 目标用户名
        details: 详细信息
    """
    # 获取目标用户的中文姓名
    user = get_user(target_username)
    display_name = target_username
    if user and user['chinese_name']:
        display_name = f"{target_username}({user['chinese_name']})"
    
    if not details:
        details = f"目标用户: {display_name}"
    else:
        # 在详细信息中也使用包含中文姓名的显示名
        details = details.replace(target_username, display_name)
    
    LogService.log(
        action=action,
        resource="用户管理",
        details=details,
        log_type=LogType.USER,
        level=LogLevel.INFO
    )

def log_data_access(action, resource, details=None):
    """
    记录数据访问操作
    
    参数:
        action: 操作类型
        resource: 资源名称
        details: 详细信息
    """
    LogService.log(
        action=action,
        resource=resource,
        details=details,
        log_type=LogType.USER,
        level=LogLevel.INFO
    )