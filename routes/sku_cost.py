"""
SKU 成本表管理路由
提供 CSV 文件的读取和更新功能
"""

from flask import Blueprint, jsonify, request, render_template, make_response
from core.auth import login_required
from core.log_service import LogService
import csv
import os

sku_cost_bp = Blueprint("sku_cost", __name__)

# CSV 文件路径
CSV_FILE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 
    "..", "apps", "model_file", "BLF_Basic_Info.csv"
)


def read_csv_data():
    """读取 CSV 文件数据"""
    data = []
    headers = []
    
    if not os.path.exists(CSV_FILE_PATH):
        return [], []
    
    try:
        with open(CSV_FILE_PATH, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = next(reader, [])
            for row in reader:
                if row:  # 跳过空行
                    data.append(row)
    except Exception as e:
        print(f"读取 CSV 文件失败: {e}")
        raise
    
    return headers, data


def write_csv_data(headers, data):
    """写入 CSV 文件数据"""
    try:
        with open(CSV_FILE_PATH, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)
    except Exception as e:
        print(f"写入 CSV 文件失败: {e}")
        raise


@sku_cost_bp.route("/sku-cost", methods=["GET"])
@login_required
def get_sku_cost():
    """获取 SKU 成本表数据"""
    try:
        headers, data = read_csv_data()
        
        # 将数据转换为字典列表
        result = []
        for row in data:
            row_dict = {}
            for i, header in enumerate(headers):
                row_dict[header] = row[i] if i < len(row) else ""
            result.append(row_dict)
        
        # 记录访问日志
        LogService.log(
            action="查看 SKU 成本表",
            resource="SKU 成本表管理",
            log_type="user",
            level="info",
            details={"record_count": len(result)}
        )
        
        return jsonify({
            "success": True,
            "headers": headers,
            "data": result
        })
        
    except Exception as e:
        print(f"获取 SKU 成本表数据失败: {e}")
        return jsonify({
            "success": False,
            "message": f"获取数据失败: {str(e)}"
        }), 500


@sku_cost_bp.route("/sku-cost", methods=["POST"])
@login_required
def update_sku_cost():
    """更新 SKU 成本表数据"""
    try:
        request_data = request.get_json()
        if not request_data or "data" not in request_data:
            return jsonify({
                "success": False,
                "message": "请求数据格式错误"
            }), 400
        
        new_data = request_data["data"]
        
        # 读取原始数据获取表头
        headers, _ = read_csv_data()
        if not headers:
            headers = ["project_name", "SKU", "ASIN", "头程单价", "FOB单价"]
        
        # 将字典列表转换为 CSV 行数据
        csv_rows = []
        for row_dict in new_data:
            row = []
            for header in headers:
                row.append(str(row_dict.get(header, "")))
            csv_rows.append(row)
        
        # 写入 CSV 文件
        write_csv_data(headers, csv_rows)
        
        # 记录更新日志
        LogService.log(
            action="更新 SKU 成本表",
            resource="SKU 成本表管理",
            log_type="user",
            level="info",
            details={"updated_count": len(new_data)}
        )
        
        return jsonify({
            "success": True,
            "message": "数据保存成功"
        })
        
    except Exception as e:
        print(f"更新 SKU 成本表数据失败: {e}")
        return jsonify({
            "success": False,
            "message": f"保存数据失败: {str(e)}"
        }), 500


@sku_cost_bp.route("/sku-cost-manager")
@login_required
def sku_cost_manager():
    """SKU 成本表管理页面"""
    # 获取 embed 参数
    is_embed = request.args.get("embed", "false").lower() == "true"
    
    # 记录访问日志
    LogService.log(
        action="访问 SKU 成本表管理页面",
        resource="SKU 成本表管理",
        log_type="user",
        level="info",
        details={"embed": is_embed}
    )
    
    # 渲染模板（sku_cost_manager.html 本身是一个 HTML 片段）
    html_content = render_template("tools/sku_cost_manager.html")
    
    # 无论 embed 模式与否，都返回 HTML 片段
    # 因为该模板本身就不包含 html/head/body 标签
    response = make_response(html_content)
    response.headers['Content-Type'] = 'text/html; charset=utf-8'
    return response


@sku_cost_bp.route("/sku-cost/item", methods=["POST"])
@login_required
def add_sku_item():
    """添加单个 SKU 成本条目"""
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                "success": False,
                "message": "请求数据不能为空"
            }), 400
        
        # 验证必填字段
        sku = request_data.get("SKU", "").strip()
        if not sku:
            return jsonify({
                "success": False,
                "message": "SKU 不能为空"
            }), 400
        
        # 读取现有数据
        headers, data = read_csv_data()
        if not headers:
            headers = ["project_name", "SKU", "ASIN", "头程单价", "FOB单价"]
        
        # 检查 SKU 是否已存在
        existing_skus = set(row[headers.index("SKU")] for row in data if len(row) > headers.index("SKU"))
        if sku in existing_skus:
            return jsonify({
                "success": False,
                "message": f"SKU '{sku}' 已存在"
            }), 409
        
        # 构建新行数据
        new_row = []
        for header in headers:
            new_row.append(str(request_data.get(header, "")))
        
        # 追加到数据列表
        data.append(new_row)
        
        # 写入 CSV 文件
        write_csv_data(headers, data)
        
        # 构建返回数据字典
        row_dict = {}
        for i, header in enumerate(headers):
            row_dict[header] = new_row[i] if i < len(new_row) else ""
        
        # 记录操作日志
        LogService.log(
            action="添加 SKU 成本条目",
            resource="SKU 成本表管理",
            log_type="user",
            level="info",
            details={"sku": sku, "project_name": request_data.get("project_name", "")}
        )
        
        return jsonify({
            "success": True,
            "message": "添加成功",
            "data": row_dict
        })
        
    except Exception as e:
        print(f"添加 SKU 条目失败: {e}")
        return jsonify({
            "success": False,
            "message": f"添加失败: {str(e)}"
        }), 500


@sku_cost_bp.route("/sku-cost/batch", methods=["POST"])
@login_required
def add_sku_batch():
    """批量添加 SKU 成本条目"""
    try:
        request_data = request.get_json()
        if not request_data or not isinstance(request_data, list):
            return jsonify({
                "success": False,
                "message": "请求数据格式错误，期望是数组格式"
            }), 400
        
        if len(request_data) == 0:
            return jsonify({
                "success": False,
                "message": "批量添加数据不能为空"
            }), 400
        
        # 读取现有数据
        headers, data = read_csv_data()
        if not headers:
            headers = ["project_name", "SKU", "ASIN", "头程单价", "FOB单价"]
        
        # 获取已存在的 SKU 集合
        sku_index = headers.index("SKU") if "SKU" in headers else -1
        existing_skus = set(row[sku_index] for row in data if sku_index >= 0 and len(row) > sku_index)
        
        # 处理批量添加
        success_items = []
        failed_items = []
        added_count = 0
        
        for item in request_data:
            sku = str(item.get("SKU", "")).strip()
            
            # 验证必填字段
            if not sku:
                failed_items.append({
                    "data": item,
                    "reason": "SKU 不能为空"
                })
                continue
            
            # 检查 SKU 是否已存在
            if sku in existing_skus:
                failed_items.append({
                    "data": item,
                    "reason": f"SKU '{sku}' 已存在"
                })
                continue
            
            # 构建新行数据
            new_row = []
            for header in headers:
                new_row.append(str(item.get(header, "")))
            
            # 追加到数据列表
            data.append(new_row)
            existing_skus.add(sku)
            added_count += 1
            
            # 构建返回数据字典
            row_dict = {}
            for i, header in enumerate(headers):
                row_dict[header] = new_row[i] if i < len(new_row) else ""
            success_items.append(row_dict)
        
        # 如果有成功添加的数据，写入 CSV 文件
        if added_count > 0:
            write_csv_data(headers, data)
        
        # 记录操作日志
        LogService.log(
            action="批量添加 SKU 成本条目",
            resource="SKU 成本表管理",
            log_type="user",
            level="info",
            details={
                "total": len(request_data),
                "success": added_count,
                "failed": len(failed_items)
            }
        )
        
        # 构建响应
        result = {
            "success": True,
            "message": f"批量添加完成，成功 {added_count} 条，失败 {len(failed_items)} 条",
            "added_count": added_count,
            "failed_count": len(failed_items)
        }
        
        if success_items:
            result["data"] = success_items
        if failed_items:
            result["failed_items"] = failed_items
        
        return jsonify(result)
        
    except Exception as e:
        print(f"批量添加 SKU 条目失败: {e}")
        return jsonify({
            "success": False,
            "message": f"批量添加失败: {str(e)}"
        }), 500


@sku_cost_bp.route("/sku-cost/item/<string:sku>", methods=["DELETE"])
@login_required
def delete_sku_item(sku):
    """删除 SKU 成本条目"""
    try:
        if not sku or not sku.strip():
            return jsonify({
                "success": False,
                "message": "SKU 不能为空"
            }), 400
        
        sku = sku.strip()
        
        # 读取现有数据
        headers, data = read_csv_data()
        if not headers or not data:
            return jsonify({
                "success": False,
                "message": "数据文件为空或不存在"
            }), 404
        
        # 查找 SKU 索引
        sku_index = headers.index("SKU") if "SKU" in headers else -1
        if sku_index < 0:
            return jsonify({
                "success": False,
                "message": "CSV 文件中找不到 SKU 列"
            }), 500
        
        # 查找并删除指定 SKU 的行
        deleted_row = None
        new_data = []
        found = False
        
        for row in data:
            if len(row) > sku_index and row[sku_index] == sku:
                deleted_row = row
                found = True
                continue  # 跳过该行（即删除）
            new_data.append(row)
        
        if not found:
            return jsonify({
                "success": False,
                "message": f"找不到 SKU '{sku}'"
            }), 404
        
        # 写入更新后的数据
        write_csv_data(headers, new_data)
        
        # 构建删除的数据字典
        deleted_dict = {}
        for i, header in enumerate(headers):
            deleted_dict[header] = deleted_row[i] if i < len(deleted_row) else ""
        
        # 记录操作日志
        LogService.log(
            action="删除 SKU 成本条目",
            resource="SKU 成本表管理",
            log_type="user",
            level="info",
            details={"sku": sku, "deleted_data": deleted_dict}
        )
        
        return jsonify({
            "success": True,
            "message": f"SKU '{sku}' 删除成功",
            "data": deleted_dict
        })
        
    except Exception as e:
        print(f"删除 SKU 条目失败: {e}")
        return jsonify({
            "success": False,
            "message": f"删除失败: {str(e)}"
        }), 500
