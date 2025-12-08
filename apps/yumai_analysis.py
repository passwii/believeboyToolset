from flask import Blueprint, request, send_file, jsonify, render_template
import io
import os
import csv
import openpyxl
from copy import copy
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

yumai_analysis_bp = Blueprint('yumai_analysis', __name__)


@yumai_analysis_bp.route('/yumai-analysis', methods=['GET'])
def yumai_analysis_page():
    """渲染优麦云商品分析页面"""
    # 获取当前文件的目录
    current_dir = os.path.dirname(__file__)
    # 构建projects.csv的路径
    projects_csv_path = os.path.join(current_dir, 'model_file', 'projects.csv')
    
    projects = []
    try:
        if os.path.exists(projects_csv_path):
            with open(projects_csv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                # 跳过标题行（如果存在）
                header = next(reader, None)
                if header and header[0] == '项目名称':
                    for row in reader:
                        if row and row[0].strip():
                            projects.append(row[0])
                else:
                    # 如果第一行不是标题行，也加入项目列表
                    if header and header[0].strip():
                        projects.append(header[0])
                    for row in reader:
                        if row and row[0].strip():
                            projects.append(row[0])
    except Exception as e:
        print(f"读取项目列表失败: {e}")
        projects = []
    
    return render_template('data-analysis/product_analysis_yumai.html', projects=projects)


def allowed_file(filename):
    """检查文件是否为允许的xlsx格式"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'xlsx'}


def process_yumai_data(file):
    """处理优麦云数据
    
    1. 使用openpyxl读取Excel文件以保留样式
    2. 创建新工作表以按指定顺序写入数据
    3. 复制所需列的数据和样式
    4. 增加汇总行
    5. 返回处理后的工作簿对象
    """
    wb = openpyxl.load_workbook(file)
    ws = wb.active

    # Get header and column indices from the original sheet
    try:
        header = {cell.value: cell.column for cell in ws[1]}
    except IndexError:
        raise ValueError("无法读取文件头部，请确保文件格式正确且至少有一行。")

    # Columns to keep, with original names
    source_columns = ['SKU', 'ASIN', '币种', '销量', '销售额', '广告花费', '广告曝光量', '广告点击量', 'ACoAS']
    
    # Check for missing columns
    missing = [col for col in source_columns if col not in header]
    if missing:
        raise ValueError(f"上传文件缺少必需列: {', '.join(missing)}")

    # Desired order and new names
    ordered_columns = ['SKU', 'ASIN', '币种', '销量', '销售额', '广告花费', '广告曝光量', '广告点击量', '广告占比']

    # Create a new sheet for output
    new_ws = wb.create_sheet(title="Processed_Data_Temp")

    # Write new header to the new sheet
    header_font = Font(bold=True, color="FFFFFF")
    header_alignment = Alignment(horizontal="center", vertical="center")
    header_fill = PatternFill(fill_type="solid", fgColor="7A6AFF")
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    for i, col_name in enumerate(ordered_columns, 1):
        cell = new_ws.cell(row=1, column=i, value=col_name)
        cell.font = copy(header_font)
        cell.alignment = copy(header_alignment)
        cell.fill = copy(header_fill)
        cell.border = border

    # Map source column names to their original index
    source_col_indices = {name: header[name] for name in source_columns}

    # Map source column names to their new index in the new sheet
    # The order is given by `source_columns` which matches `ordered_columns` except for the last name.
    new_col_indices = {name: i + 1 for i, name in enumerate(source_columns)}

    # To calculate summary
    summary = {
        '销量': 0, '销售额': 0, '广告花费': 0, '广告曝光量': 0, '广告点击量': 0,
    }
    numeric_cols = ['销量', '销售额', '广告花费', '广告曝光量', '广告点击量']

    # Copy data and styles
    for row_idx in range(2, ws.max_row + 1):
        for col_name in source_columns:
            old_col_idx = source_col_indices[col_name]
            new_col_idx = new_col_indices[col_name]
            
            old_cell = ws.cell(row=row_idx, column=old_col_idx)
            new_cell = new_ws.cell(row=row_idx, column=new_col_idx, value=old_cell.value)
            new_cell.alignment = Alignment(horizontal="center", vertical="center")

            new_cell.border = border
            if old_cell.has_style:
                new_cell.font = copy(old_cell.font)
                new_cell.fill = copy(old_cell.fill)
                new_cell.number_format = old_cell.number_format
                new_cell.protection = copy(old_cell.protection)

        # Accumulate for summary
        for col_name in numeric_cols:
            val = ws.cell(row=row_idx, column=source_col_indices[col_name]).value
            if isinstance(val, (int, float)):
                summary[col_name] += val

    # Add summary row
    summary_row_idx = new_ws.max_row + 1
    summary_row_data = {
        'SKU': '汇总',
        'ASIN': '',
        '币种': '',
        '销量': summary['销量'],
        '销售额': summary['销售额'],
        '广告花费': summary['广告花费'],
        '广告曝光量': summary['广告曝光量'],
        '广告点击量': summary['广告点击量'],
        '广告占比': ''
    }
    
    if summary['销售额'] is not None and summary['广告花费'] is not None and summary['销售额'] != 0:
        summary_row_data['广告占比'] = f"{round(summary['广告花费'] / summary['销售额'] * 100, 2)}%"
    
    summary_font = Font(bold=True)
    summary_alignment = Alignment(horizontal="center", vertical="center")
    for i, col_name in enumerate(ordered_columns, 1):
        cell = new_ws.cell(row=summary_row_idx, column=i, value=summary_row_data.get(col_name))
        cell.font = copy(summary_font)
        cell.alignment = copy(summary_alignment)
        cell.border = border

    # Remove original sheet and rename the new one
    original_sheet_title = ws.title
    wb.remove(ws)
    new_ws.title = original_sheet_title

    return wb


@yumai_analysis_bp.route('/yumai-analysis/process', methods=['POST'])
def process_file():
    """处理上传的Excel文件"""
    try:
        # 获取上传的文件
        file = request.files.get('file')
        
        if not file:
            return jsonify({'error': '请上传文件'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '无效的文件类型，请上传.xlsx文件'}), 400
        
        # 处理数据
        result_wb = process_yumai_data(file)
        
        # 将结果转换为Excel文件
        output = io.BytesIO()
        result_wb.save(output)
        output.seek(0)
        
        return send_file(
            output,
            as_attachment=True,
            download_name=os.path.splitext(file.filename)[0] + "_Processed.xlsx",
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'处理过程中发生错误: {str(e)}'}), 500