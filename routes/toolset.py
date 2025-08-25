from flask import Blueprint, render_template
from auth import login_required

toolset_bp = Blueprint('toolset', __name__)

@toolset_bp.route('/update-log')
@login_required
def update_log():
    return render_template('toolset/timeline.html')
