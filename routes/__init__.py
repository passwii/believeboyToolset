from flask import Blueprint, render_template

from .toolset import toolset_bp
from .dataset import dataset_bp
from .help import help_bp

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index.html')
def home():
    return render_template('index.html')

# 注册子蓝图
def init_app(app):
    app.register_blueprint(main)
    app.register_blueprint(toolset_bp, url_prefix='/toolset')
    app.register_blueprint(dataset_bp, url_prefix='/dataset')
    app.register_blueprint(help_bp, url_prefix='/help')