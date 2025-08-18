import os

# 应用配置
APP_CONFIG = {
    'host': '0.0.0.0',
    'port': 8800,
    'debug': True
}

# 文件路径配置
PATH_CONFIG = {
    'pdf_output': 'pdf/output',
    'pdf_upload': 'pdf/upload',
    'project_data': 'project'
}

# 安全配置
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')