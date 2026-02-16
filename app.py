import sys
import os

# 将项目根目录添加到 sys.path 中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory
from routes import init_app
from routes.api_auth import api_auth_bp
from core.config import APP_CONFIG, SECRET_KEY, SESSION_CONFIG
from core.auth import auth_bp
from apps.dataset.yumai_analysis import yumai_analysis_bp
from core.database import init_db
from datetime import timedelta

app = Flask(__name__, static_folder="static")


@app.route("/favicon.ico")
def favicon():
    response = app.send_static_file("images/logo-i.ico")
    response.headers["Content-Type"] = "image/x-icon"
    return response


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    dist_folder = os.path.join(app.static_folder or "static", "dist")

    if os.path.exists(dist_folder):
        if path and os.path.exists(os.path.join(dist_folder, path)):
            return send_from_directory(dist_folder, path)

        return send_from_directory(dist_folder, "index.html")

    return """
    <html>
        <head>
            <title>BelieveBoy - 开发模式</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }}
                .container {{
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }}
                h1 {{ margin: 0 0 20px 0; }}
                p {{ font-size: 18px; }}
                code {{
                    background: rgba(0, 0, 0, 0.2);
                    padding: 5px 10px;
                    border-radius: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>BelieveBoy 工具集</h1>
                <p>开发模式：前端未构建</p>
                <p>请运行 <code>cd frontend && npm run dev</code> 启动前端开发服务器</p>
                <p style="margin-top: 20px; font-size: 14px;">访问 http://localhost:3000</p>
            </div>
        </body>
    </html>
    """


app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

# 配置密钥用于会话
app.secret_key = SECRET_KEY

# 配置会话超时时间
app.permanent_session_lifetime = timedelta(
    seconds=SESSION_CONFIG["permanent_session_lifetime"]
)

# 注册认证蓝图
app.register_blueprint(auth_bp)
app.register_blueprint(yumai_analysis_bp)
app.register_blueprint(api_auth_bp, url_prefix="/api/auth")


# 初始化数据库
init_db()

# 初始化路由
init_app(app)

if __name__ == "__main__":
    app.run(host=APP_CONFIG["host"], port=APP_CONFIG["port"], debug=APP_CONFIG["debug"])
