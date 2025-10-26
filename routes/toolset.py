from flask import Blueprint, render_template, jsonify, session
from core.auth import login_required
from core.log_service import LogService

toolset_bp = Blueprint('toolset', __name__)

@toolset_bp.route('/operations-nav')
@login_required
def operations_nav():
    """运营导航页面"""
    LogService.log(
        action="访问运营导航",
        resource="运营导航",
        log_type="user",
        level="info"
    )
    return render_template('toolset/operations_nav.html')

@toolset_bp.route('/shop-nav')
@login_required
def shop_nav():
    """店铺导航页面"""
    # 记录访问店铺导航页面日志
    LogService.log(
        action="访问店铺导航",
        resource="店铺导航",
        log_type="user",
        level="info"
    )
    
    # 获取当前用户信息
    from core.user_model import User
    username = session.get('username')
    user = User.get_user_by_username(username)
    chinese_name = user.chinese_name if user and user.chinese_name else username
    
    # 判断是否为管理员
    is_admin = username == 'damonrock'
    
    # 根据权限获取店铺数据
    from core.shop_model import Shop
    shops_data = Shop.get_shops_by_user_permission(username, chinese_name, is_admin)
    
    return render_template('toolset/shop_nav_embed.html',
                          chinese_name=chinese_name,
                          own_shops=shops_data['own_shops'],
                          competitor_shops=shops_data['competitor_shops'])

@toolset_bp.route('/shops/list')
@login_required
def list_shops():
    """获取店铺列表API"""
    from core.shop_model import Shop
    
    try:
        shops = Shop.get_all()
        shops_data = [shop.to_dict() for shop in shops]
        return jsonify({'success': True, 'shops': shops_data})
    except Exception as e:
        print(f"获取店铺列表失败: {e}")
        return jsonify({'success': False, 'message': '获取店铺列表失败'})
