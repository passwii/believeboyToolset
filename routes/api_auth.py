from flask import Blueprint, request, jsonify, session
from core.user_model import User
from core.log_service import log_login_attempt, LogService

api_auth_bp = Blueprint("api_auth", __name__)


@api_auth_bp.route("/login", methods=["POST"])
def api_login():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "用户名和密码不能为空"}), 400

    if User.verify_password(username, password):
        session.permanent = True
        session["username"] = username

        log_login_attempt(username, True)

        user = User.get_user_by_username(username)

        return jsonify(
            {
                "success": True,
                "message": "登录成功",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "chineseName": user.chinese_name,
                    "role": "admin" if username == "damonrock" else "user",
                },
            }
        )

    log_login_attempt(username, False)

    return jsonify({"success": False, "message": "用户名或密码错误"}), 401


@api_auth_bp.route("/logout", methods=["POST"])
def api_logout():
    username = session.get("username", "unknown")
    session.pop("username", None)

    LogService.log(
        action="用户登出",
        resource="认证",
        details=f"用户名: {username}",
        log_type="user",
        level="info",
    )

    return jsonify({"success": True, "message": "登出成功"})


@api_auth_bp.route("/me", methods=["GET"])
def api_get_current_user():
    username = session.get("username")

    if not username:
        return jsonify({"success": False, "message": "未登录"}), 401

    user = User.get_user_by_username(username)

    return jsonify(
        {
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "chineseName": user.chinese_name,
                "role": "admin" if username == "damonrock" else "user",
            },
        }
    )


@api_auth_bp.route("/change-password", methods=["POST"])
def api_change_password():
    username = session.get("username")

    if not username:
        return jsonify({"success": False, "message": "未登录"}), 401

    current_password = request.json.get("current_password")
    new_password = request.json.get("new_password")
    confirm_password = request.json.get("confirm_password")

    if not current_password or not new_password or not confirm_password:
        return jsonify({"success": False, "message": "请填写所有字段"}), 400

    user = User.get_user_by_username(username)

    if not User.verify_password(username, current_password):
        LogService.log(
            action="修改密码失败",
            resource="用户账户",
            details=f"用户 {username} 当前密码验证失败",
            log_type="security",
            level="warning",
        )
        return jsonify({"success": False, "message": "当前密码不正确"}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "message": "新密码长度不能少于6位"}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "message": "两次输入的新密码不一致"}), 400

    result = User.change_password(user.id, new_password)

    if result:
        LogService.log(
            action="修改密码成功",
            resource="用户账户",
            details=f"用户 {username} 成功修改密码",
            log_type="security",
            level="info",
        )
        return jsonify({"success": True, "message": "密码修改成功，请重新登录"})

    LogService.log(
        action="修改密码失败",
        resource="用户账户",
        details=f"用户 {username} 密码更新失败",
        log_type="security",
        level="error",
    )

    return jsonify({"success": False, "message": "密码修改失败，请重试"}), 500
