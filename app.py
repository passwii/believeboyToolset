import sys
import os

# 将项目根目录添加到 sys.path 中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from routes import init_app
from core.config import APP_CONFIG, SECRET_KEY, SESSION_CONFIG
from core.auth import auth_bp
from apps.yumai_analysis import yumai_analysis_bp
from core.database_config import get_db_connection
from core.database import init_db
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/favicon.ico')
def favicon():
    response = app.send_static_file('images/logo-i.ico')
    response.headers['Content-Type'] = 'image/x-icon'
    return response

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# 配置密钥用于会话
app.secret_key = SECRET_KEY

# 配置会话超时时间
app.permanent_session_lifetime = timedelta(seconds=SESSION_CONFIG['permanent_session_lifetime'])

# 注册认证蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(yumai_analysis_bp)



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