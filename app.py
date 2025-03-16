from flask import Flask
from routes import init_app
from config import APP_CONFIG

app = Flask(__name__, static_folder='./statics', template_folder='./templates')

# 初始化路由
init_app(app)

if __name__ == '__main__':
    app.run(
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port'],
        debug=APP_CONFIG['debug']
    )
