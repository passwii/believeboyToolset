from flask import Blueprint, render_template
from auth import login_required

toolset_bp = Blueprint('toolset', __name__)

# 工具集路由可以根据需要在此添加
