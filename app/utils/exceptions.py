"""
自定义异常模块
定义应用中使用的各种自定义异常类
"""


class AppException(Exception):
    """
    应用基础异常类
    所有应用自定义异常的基类
    """
    
    def __init__(self, message=None, code=None):
        """
        初始化异常
        
        Args:
            message: 错误消息
            code: 错误代码（可选）
        """
        self.message = message or '应用错误'
        self.code = code or 500
        super().__init__(self.message)
    
    def __str__(self):
        return self.message
    
    def to_dict(self):
        """
        将异常转换为字典格式
        
        Returns:
            dict: 包含错误信息的字典
        """
        return {
            'success': False,
            'message': self.message,
            'code': self.code
        }


class BusinessError(AppException):
    """
    业务逻辑错误
    用于处理业务规则违反的情况
    
    示例:
        raise BusinessError('库存不足', code=400)
        raise BusinessError('订单已取消', code=409)
    """
    
    def __init__(self, message, code=400):
        """
        初始化业务错误
        
        Args:
            message: 业务错误描述
            code: HTTP 状态码，默认为 400
        """
        super().__init__(message=message, code=code)


class ValidationError(AppException):
    """
    数据验证错误
    用于处理表单验证、数据校验失败的情况
    
    示例:
        raise ValidationError('用户名不能为空')
        raise ValidationError('邮箱格式不正确', field='email')
    """
    
    def __init__(self, message, field=None, code=400):
        """
        初始化验证错误
        
        Args:
            message: 验证错误描述
            field: 出错的字段名（可选）
            code: HTTP 状态码，默认为 400
        """
        super().__init__(message=message, code=code)
        self.field = field
    
    def to_dict(self):
        """
        转换为字典，包含字段信息
        
        Returns:
            dict: 包含错误信息的字典
        """
        result = super().to_dict()
        if self.field:
            result['field'] = self.field
        return result


class PermissionDenied(AppException):
    """
    权限不足错误
    用于处理用户没有足够权限访问资源的情况
    
    示例:
        raise PermissionDenied('需要管理员权限')
        raise PermissionDenied('无法访问其他用户的数据')
    """
    
    def __init__(self, message='权限不足', code=403):
        """
        初始化权限错误
        
        Args:
            message: 权限错误描述
            code: HTTP 状态码，默认为 403
        """
        super().__init__(message=message, code=code)


class ResourceNotFound(AppException):
    """
    资源未找到错误
    用于处理请求的资源不存在的情况
    
    示例:
        raise ResourceNotFound('用户不存在')
        raise ResourceNotFound('订单未找到', resource='Order')
    """
    
    def __init__(self, message='资源未找到', resource=None, code=404):
        """
        初始化资源未找到错误
        
        Args:
            message: 错误描述
            resource: 资源类型名称（可选）
            code: HTTP 状态码，默认为 404
        """
        super().__init__(message=message, code=code)
        self.resource = resource
    
    def to_dict(self):
        """
        转换为字典，包含资源类型信息
        
        Returns:
            dict: 包含错误信息的字典
        """
        result = super().to_dict()
        if self.resource:
            result['resource'] = self.resource
        return result


class AuthenticationError(AppException):
    """
    认证错误
    用于处理登录、身份验证失败的情况
    
    示例:
        raise AuthenticationError('用户名或密码错误')
        raise AuthenticationError('Token 已过期', code=401)
    """
    
    def __init__(self, message='认证失败', code=401):
        """
        初始化认证错误
        
        Args:
            message: 认证错误描述
            code: HTTP 状态码，默认为 401
        """
        super().__init__(message=message, code=code)


class ConflictError(AppException):
    """
    资源冲突错误
    用于处理资源已存在、状态冲突等情况
    
    示例:
        raise ConflictError('用户名已被使用')
        raise ConflictError('该记录已存在')
    """
    
    def __init__(self, message='资源冲突', code=409):
        """
        初始化冲突错误
        
        Args:
            message: 冲突错误描述
            code: HTTP 状态码，默认为 409
        """
        super().__init__(message=message, code=code)


class RateLimitError(AppException):
    """
    请求频率限制错误
    用于处理请求过于频繁的情况
    
    示例:
        raise RateLimitError('请求过于频繁，请稍后再试')
    """
    
    def __init__(self, message='请求过于频繁', retry_after=60, code=429):
        """
        初始化频率限制错误
        
        Args:
            message: 错误描述
            retry_after: 建议等待的秒数
            code: HTTP 状态码，默认为 429
        """
        super().__init__(message=message, code=code)
        self.retry_after = retry_after
    
    def to_dict(self):
        """
        转换为字典，包含重试时间信息
        
        Returns:
            dict: 包含错误信息的字典
        """
        result = super().to_dict()
        result['retry_after'] = self.retry_after
        return result


class ServiceUnavailableError(AppException):
    """
    服务不可用错误
    用于处理外部服务不可用、维护中等情况
    
    示例:
        raise ServiceUnavailableError('数据库连接失败')
        raise ServiceUnavailableError('第三方服务暂时不可用')
    """
    
    def __init__(self, message='服务暂时不可用', code=503):
        """
        初始化服务不可用错误
        
        Args:
            message: 错误描述
            code: HTTP 状态码，默认为 503
        """
        super().__init__(message=message, code=code)


# 便捷的异常工厂函数
def raise_if_not_found(obj, message='资源未找到', resource=None):
    """
    如果对象为空则抛出 ResourceNotFound 异常
    
    Args:
        obj: 要检查的对象
        message: 错误消息
        resource: 资源类型
    
    Raises:
        ResourceNotFound: 如果对象为 None
    """
    if obj is None:
        raise ResourceNotFound(message=message, resource=resource)


def raise_if_exists(obj, message='资源已存在'):
    """
    如果对象不为空则抛出 ConflictError 异常
    
    Args:
        obj: 要检查的对象
        message: 错误消息
    
    Raises:
        ConflictError: 如果对象不为 None
    """
    if obj is not None:
        raise ConflictError(message=message)


def raise_if_no_permission(condition, message='权限不足'):
    """
    如果条件不满足则抛出 PermissionDenied 异常
    
    Args:
        condition: 权限检查条件
        message: 错误消息
    
    Raises:
        PermissionDenied: 如果条件为 False
    """
    if not condition:
        raise PermissionDenied(message=message)
