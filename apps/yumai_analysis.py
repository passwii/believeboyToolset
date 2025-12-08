from flask import Blueprint, request, send_file, jsonify, render_template
import io
import os
import csv
import pandas as pd

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
    
    1. 读取Excel文件
    2. 保留指定列
    3. 调整列顺序
    4. 增加汇总行
    """
    # 读取Excel文件
    df = pd.read_excel(file, engine='openpyxl')
    
    # 需要保留的列
    keep_columns = ['ASIN', 'SKU', '币种', '销量', '销售额', '可售', '广告花费', '广告曝光量', '广告点击量', '广告点击率', 'ACoAS']
    
    # 验证必需列是否存在
    missing_columns = [col for col in keep_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"上传文件缺少必需列: {', '.join(missing_columns)}")
    
    # 只保留指定列
    df = df[keep_columns]
    
    # 重命名列
    df = df.rename(columns={'ACoAS': '广告占比'})
    
    # 调整列顺序: SKU, ASIN, 币种, 销量, 销售额, 广告花费, 广告曝光量, 广告点击量, 广告占比
    ordered_columns = ['SKU', 'ASIN', '币种', '销量', '销售额', '广告花费', '广告曝光量', '广告点击量', '广告占比']
    df = df[ordered_columns]
    
    # 计算汇总行
    summary_row = {
        'SKU': '汇总',
        'ASIN': '',
        '币种': '',
        '销量': df['销量'].sum() if df['销量'].dtype in ['int64', 'float64'] else '',
        '销售额': df['销售额'].sum() if df['销售额'].dtype in ['int64', 'float64'] else '',
        '广告花费': df['广告花费'].sum() if df['广告花费'].dtype in ['int64', 'float64'] else '',
        '广告曝光量': df['广告曝光量'].sum() if df['广告曝光量'].dtype in ['int64', 'float64'] else '',
        '广告点击量': df['广告点击量'].sum() if df['广告点击量'].dtype in ['int64', 'float64'] else '',
        'ACoAS': ''  # ACoAS需要重新计算
    }
    
    # 如果有销售额和广告花费，计算汇总的ACoAS
    if summary_row['销售额'] and summary_row['广告花费'] and summary_row['销售额'] != 0:
        summary_row['ACoAS'] = round(summary_row['广告花费'] / summary_row['销售额'] * 100, 2)
    
    # 添加汇总行
    summary_df = pd.DataFrame([summary_row])
    df = pd.concat([df, summary_df], ignore_index=True)
    
    return df


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
        result_df = process_yumai_data(file)
        
        # 将结果转换为Excel文件
        output = io.BytesIO()
        result_df.to_excel(output, index=False, engine='openpyxl')
        output.seek(0)
        
        return send_file(
            output,
            as_attachment=True,
            download_name='yumai_analysis_result.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'处理过程中发生错误: {str(e)}'}), 500