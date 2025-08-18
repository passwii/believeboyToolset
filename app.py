from flask import Flask
from routes import init_app
from config import APP_CONFIG, SECRET_KEY
from auth import auth_bp

app = Flask(__name__, static_folder='./statics', template_folder='./templates')

# 配置密钥用于会话
app.secret_key = SECRET_KEY

# 注册认证蓝图
app.register_blueprint(auth_bp)

# 初始化路由
init_app(app)

if __name__ == '__main__':
    app.run(
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port'],
        debug=APP_CONFIG['debug']
    )
