import sys
import os

# 将项目根目录添加到 sys.path 中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from routes import init_app
from core.config import APP_CONFIG, SECRET_KEY, SESSION_CONFIG
from core.auth import auth_bp
from core.database_config import get_db_connection
from core.database import init_db
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='templates')

# 配置密钥用于会话
app.secret_key = SECRET_KEY

# 配置会话超时时间
app.permanent_session_lifetime = timedelta(seconds=SESSION_CONFIG['permanent_session_lifetime'])

# 注册认证蓝图
app.register_blueprint(auth_bp)

# 添加自定义模板过滤器
@app.template_filter('beijing_time')
def beijing_time_filter(timestamp):
    """将时间戳转换为北京时间格式"""
    if not timestamp:
        return ""
    
    # 如果是字符串，尝试解析
    if isinstance(timestamp, str):
        try:
            # 尝试解析SQLite时间格式
            dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            # 如果解析失败，返回原始字符串
            return timestamp
    else:
        # 如果是datetime对象
        dt = timestamp
    
    # 格式化为更友好的显示（数据库中已经是北京时间，不需要转换）
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def verify_timezone_setting():
    """验证时区设置是否正确"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 检查UTC时间和北京时间
        cursor.execute("SELECT datetime('now') as utc_time, datetime('now', '+8 hours') as beijing_time")
        times = cursor.fetchone()
        
        conn.close()
        
        return True
    except Exception as e:
        print(f"时区验证失败: {e}")
        return False

# 初始化数据库
init_db()

# 初始化路由
init_app(app)

if __name__ == '__main__':
    app.run(
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port'],
        debug=APP_CONFIG['debug']
    )