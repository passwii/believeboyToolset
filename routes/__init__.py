from flask import Blueprint, render_template, session, redirect, url_for

from .toolset import toolset_bp
from .dataset import dataset_bp
from .help import help_bp
from .admin import admin_bp
from core.auth import login_required
from core.log_service import LogService

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index.html')
@login_required
def home():
    # 记录访问主页日志
    LogService.log(
        action="访问主页",
        resource="主页",
        log_type="user",
        level="info"
    )
    return render_template('index.html')

# 注册子蓝图
def init_app(app):
    app.register_blueprint(main)
    app.register_blueprint(toolset_bp, url_prefix='/toolset')
    app.register_blueprint(dataset_bp, url_prefix='/dataset')
    app.register_blueprint(help_bp, url_prefix='/help')
    app.register_blueprint(admin_bp, url_prefix='/admin')