from flask import Blueprint, render_template, request, send_file, redirect, flash, url_for
import os
import io
import pandas as pd
from core.log_service import LogService

yumai_analysis_bp = Blueprint('yumai_analysis', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'xlsx'}

def process_yumai_analysis(project_name, report_start_date, report_end_date, data_file_path):
    """处理优麦云商品分析数据"""
    try:
        # 读取上传的xlsx文件
        df = pd.read_excel(data_file_path, engine='openpyxl')
        
        # 验证必需列存在
        required_columns = ['ASIN', 'SKU', '销量', '销售额', '可售', '广告花费', '广告曝光量', '广告点击量', '广告点击率']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"上传文件缺少必需列: {', '.join(missing_columns)}")
        
        # 这里可以添加更多的数据处理逻辑，比如计算指标、生成报告等
        # 例如：计算利润率、转化率等
        
        # 返回处理后的DataFrame或生成报告
        return df[required_columns]
        
    except Exception as e:
        LogService.log(
            action="处理优麦云分析数据失败",
            resource="优麦云商品分析",
            details=f"错误: {str(e)}",
            log_type="user",
            level="error"
        )
        raise

@yumai_analysis_bp.route('/yumai-analysis', methods=['GET', 'POST'])
def yumai_analysis_page():
    if request.method == 'POST':
        try:
            project_name = request.form.get('project_name')
            report_start_date = request.form.get('report_start_date')
            report_end_date = request.form.get('report_end_date')
            file = request.files.get('file')
            
            if not project_name:
                flash('请选择项目名称')
                return redirect(url_for('yumai_analysis.yumai_analysis_page'))
            
            if file and allowed_file(file.filename):
                # 保存上传文件
                upload_folder = os.path.join(os.getcwd(), 'project', project_name, 'uploaded_files')
                os.makedirs(upload_folder, exist_ok=True)
                
                filename = file.filename
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                
                # 处理数据
                result_df = process_yumai_analysis(project_name, report_start_date, report_end_date, file_path)
                
                # 将结果转换为Excel文件
                output = io.BytesIO()
                result_df.to_excel(output, index=False, engine='openpyxl')
                output.seek(0)
                
                # 记录日志
                LogService.log(
                    action="生成优麦云商品分析报告",
                    resource="优麦云商品分析",
                    details=f"项目: {project_name}, 文件: {filename}",
                    log_type="user",
                    level="info"
                )
                
                return send_file(
                    output,
                    as_attachment=True,
                    download_name=f"{project_name}_yumai_analysis_{report_start_date}_{report_end_date}.xlsx",
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
            else:
                flash('无效的文件类型，请上传.xlsx文件')
                return redirect(url_for('yumai_analysis.yumai_analysis_page'))
                
        except Exception as e:
            LogService.log(
                action="生成优麦云商品分析报告失败",
                resource="优麦云商品分析",
                details=f"项目: {project_name}, 错误: {str(e)}",
                log_type="user",
                level="error"
            )
            flash(f'处理过程中发生错误: {str(e)}')
            return redirect(url_for('yumai_analysis.yumai_analysis_page'))
    
    # 读取项目列表从CSV文件（相对当前文件路径）
    import os
    import csv
    
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
                    for row in reader:
                        if row and row[0].strip():
                            projects.append(row[0])
        else:
            projects = []
    except Exception as e:
        print(f"读取项目列表失败: {e}")
        projects = []
    
    return render_template('data-analysis/product_analysis_yumai.html', projects=projects)