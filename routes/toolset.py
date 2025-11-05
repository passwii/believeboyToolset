from flask import Blueprint, render_template, jsonify, session, request, send_file
from core.auth import login_required
from core.log_service import LogService
import os
import sys
import uuid
from datetime import datetime
import traceback

# 添加apps目录到路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'apps'))

try:
    from research_analysis import ResearchAnalyzer
except ImportError:
    ResearchAnalyzer = None

try:
    from product_label_processor import quick_process_pdf
except ImportError:
    quick_process_pdf = None

try:
    from pricing_calculator import PricingCalculator
except ImportError:
    PricingCalculator = None

toolset_bp = Blueprint('toolset', __name__)

@toolset_bp.route('/operations-overview')
@login_required
def operations_overview():
    """运营总览页面"""
    LogService.log(
        action="访问运营总览",
        resource="运营总览",
        log_type="user",
        level="info"
    )
    return render_template('operations/operations_overview.html')

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
    return render_template('operations/operations_nav.html')

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
    
    return render_template('operations/shop_nav_embed.html',
                          chinese_name=chinese_name,
                          own_shops=shops_data['own_shops'],
                          competitor_shops=shops_data['competitor_shops'])

@toolset_bp.route('/research-analysis')
@login_required
def research_analysis():
    """调研分析页面"""
    # 记录访问调研分析页面日志
    LogService.log(
        action="访问调研分析",
        resource="调研分析",
        log_type="user",
        level="info"
    )
    
    return render_template('tools/research_analysis.html')

@toolset_bp.route('/research-analysis/upload', methods=['POST'])
@login_required
def upload_research_file():
    """处理Excel文件上传并进行数据分析"""
    if ResearchAnalyzer is None:
        return jsonify({
            'success': False,
            'message': '研究分析模块未正确加载'
        })

    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': '没有选择文件'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': '没有选择文件'})

        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'success': False, 'message': '只支持Excel文件格式(.xlsx, .xls)'})

        # 获取分析参数
        analysis_type = request.form.get('analysis_type', 'basic')
        output_format = request.form.get('output_format', 'excel')
        notes = request.form.get('notes', '')

        # 创建临时目录
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # 保存上传的文件
        filename = f"research_{uuid.uuid4().hex}_{file.filename}"
        filepath = os.path.join(temp_dir, filename)
        file.save(filepath)

        # 创建分析器实例
        analyzer = ResearchAnalyzer(filepath)

        # 运行分析
        if not analyzer.run_all_analysis():
            # 清理临时文件
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'success': False, 'message': '数据分析失败，请检查文件格式'})

        # 获取分析结果
        results = analyzer.get_results()

        # 根据输出格式生成结果
        if output_format == 'excel':
            # 生成Excel报告
            result_filename = f"analysis_{uuid.uuid4().hex}.xlsx"
            result_filepath = os.path.join(temp_dir, result_filename)

            if analyzer.save_results_to_excel(result_filepath):
                # 记录上传和分析日志
                LogService.log(
                    action="执行调研分析",
                    resource=f"调研分析: {file.filename}",
                    log_type="user",
                    level="info",
                    details={
                        'analysis_type': analysis_type,
                        'output_format': output_format,
                        'notes': notes,
                        'filename': result_filename
                    }
                )

                return jsonify({
                    'success': True,
                    'message': '分析完成',
                    'filename': result_filename,
                    'original_filename': file.filename,
                    'results': results,
                    'download_url': f'/toolset/research-analysis/download/{result_filename}'
                })
            else:
                # 清理临时文件
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({'success': False, 'message': '生成分析报告失败'})

        elif output_format == 'json':
            # 返回JSON格式结果
            result_filename = f"analysis_{uuid.uuid4().hex}.json"
            result_filepath = os.path.join(temp_dir, result_filename)

            import json
            with open(result_filepath, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2, default=str)

            LogService.log(
                action="执行调研分析",
                resource=f"调研分析: {file.filename}",
                log_type="user",
                level="info",
                details={
                    'analysis_type': analysis_type,
                    'output_format': output_format,
                    'notes': notes,
                    'filename': result_filename
                }
            )

            return jsonify({
                'success': True,
                'message': '分析完成',
                'filename': result_filename,
                'original_filename': file.filename,
                'results': results,
                'download_url': f'/toolset/research-analysis/download/{result_filename}'
            })

        else:
            # 清理临时文件
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'success': False, 'message': '不支持的输出格式'})

    except Exception as e:
        print(f"文件上传和分析失败: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'处理失败: {str(e)}'})


@toolset_bp.route('/research-analysis/download/<filename>')
@login_required
def download_analysis_result(filename):
    """下载分析结果文件"""
    try:
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')
        filepath = os.path.join(temp_dir, filename)

        if not os.path.exists(filepath):
            return jsonify({'success': False, 'message': '文件不存在或已过期'}), 404

        # 记录下载日志
        LogService.log(
            action="下载分析结果",
            resource=f"调研分析结果: {filename}",
            log_type="user",
            level="info"
        )

        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        print(f"下载文件失败: {e}")
        return jsonify({'success': False, 'message': f'下载失败: {str(e)}'}), 500


@toolset_bp.route('/research-analysis/cleanup', methods=['POST'])
@login_required
def cleanup_temp_files():
    """清理临时文件"""
    try:
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')

        if not os.path.exists(temp_dir):
            return jsonify({'success': True, 'message': '没有临时文件需要清理'})

        # 删除24小时前的文件
        import time
        current_time = time.time()
        cutoff_time = current_time - (24 * 60 * 60)  # 24小时前

        cleaned_count = 0
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)
            if os.path.isfile(filepath):
                file_mtime = os.path.getmtime(filepath)
                if file_mtime < cutoff_time:
                    os.remove(filepath)
                    cleaned_count += 1

        LogService.log(
            action="清理临时文件",
            resource="调研分析",
            log_type="user",
            level="info",
            details={'cleaned_files': cleaned_count}
        )

        return jsonify({
            'success': True,
            'message': f'已清理 {cleaned_count} 个临时文件'
        })

    except Exception as e:
        print(f"清理临时文件失败: {e}")
        return jsonify({'success': False, 'message': f'清理失败: {str(e)}'})

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


@toolset_bp.route('/product-label')
@login_required
def product_label():
    """产品标签处理页面"""
    LogService.log(
        action="访问产品标签处理",
        resource="产品标签处理",
        log_type="user",
        level="info"
    )
    return render_template('tools/product-label.html')

@toolset_bp.route('/package-label')
@login_required
def package_label():
    """外箱标签处理页面"""
    LogService.log(
        action="访问外箱标签处理",
        resource="外箱标签处理",
        log_type="user",
        level="info"
    )
    return render_template('tools/package-label.html')


@toolset_bp.route('/product-label/process', methods=['POST'])
@login_required
def process_product_label():
    """处理PDF文件上传和文字替换"""
    if quick_process_pdf is None:
        return jsonify({
            'success': False,
            'message': '产品标签处理模块未正确加载'
        })

    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': '没有选择文件'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': '没有选择文件'})

        if not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'message': '只支持PDF文件格式'})

        # 获取处理参数
        case_sensitive = request.form.get('case_sensitive', 'true').lower() == 'true'
        whole_word = request.form.get('whole_word', 'true').lower() == 'true'

        # 创建临时目录
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # 保存上传的文件
        input_filename = f"label_{uuid.uuid4().hex}_{file.filename}"
        input_filepath = os.path.join(temp_dir, input_filename)
        file.save(input_filepath)

        try:
            # 使用简化的PDF处理 - 固定替换"新品"为"NEW"
            result = quick_process_pdf(input_filepath)

            if result['success']:
                # 获取输出文件名
                output_filename = os.path.basename(result['output_path'])

                # 记录处理日志
                LogService.log(
                    action="处理产品标签PDF",
                    resource=f"产品标签处理: {file.filename}",
                    log_type="user",
                    level="info",
                    details={
                        'replacement_count': result['replacement_count'],
                        'output_filename': output_filename,
                        'processing_type': '新品->NEW 简化替换'
                    }
                )

                return jsonify({
                    'success': True,
                    'message': result['message'],
                    'filename': output_filename,
                    'original_filename': file.filename,
                    'replacement_count': result['replacement_count'],
                    'download_url': f'/toolset/product-label/download/{output_filename}'
                })
            else:
                return jsonify({
                    'success': False, 
                    'message': result.get('error', 'PDF处理失败')
                })

        finally:
            # 清理输入文件
            if os.path.exists(input_filepath):
                os.remove(input_filepath)

    except Exception as e:
        print(f"PDF处理失败: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'处理失败: {str(e)}'})


@toolset_bp.route('/product-label/download/<filename>')
@login_required
def download_processed_pdf(filename):
    """下载处理后的PDF文件"""
    try:
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')
        filepath = os.path.join(temp_dir, filename)

        if not os.path.exists(filepath):
            return jsonify({'success': False, 'message': '文件不存在或已过期'}), 404

        # 记录下载日志
        LogService.log(
            action="下载处理后PDF",
            resource=f"产品标签处理结果: {filename}",
            log_type="user",
            level="info"
        )

        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        print(f"下载PDF失败: {e}")
        return jsonify({'success': False, 'message': f'下载失败: {str(e)}'}), 500


@toolset_bp.route('/product-label/cleanup', methods=['POST'])
@login_required
def cleanup_pdf_temp_files():
    """清理临时PDF文件"""
    try:
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'temp')

        if not os.path.exists(temp_dir):
            return jsonify({'success': True, 'message': '没有临时文件需要清理'})

        # 删除24小时前的文件
        import time
        current_time = time.time()
        cutoff_time = current_time - (24 * 60 * 60)  # 24小时前

        cleaned_count = 0
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)
            if os.path.isfile(filepath) and (filename.startswith('processed_') or filename.startswith('label_')):
                file_mtime = os.path.getmtime(filepath)
                if file_mtime < cutoff_time:
                    os.remove(filepath)
                    cleaned_count += 1

        LogService.log(
            action="清理PDF临时文件",
            resource="产品标签处理",
            log_type="user",
            level="info",
            details={'cleaned_files': cleaned_count}
        )

        return jsonify({
            'success': True,
            'message': f'已清理 {cleaned_count} 个临时文件'
        })

    except Exception as e:
        print(f"清理临时文件失败: {e}")
        return jsonify({'success': False, 'message': f'清理失败: {str(e)}'})


@toolset_bp.route('/pricing-calculator')
@login_required
def pricing_calculator():
    """定价测算页面"""
    LogService.log(
        action="访问定价测算",
        resource="定价测算",
        log_type="user",
        level="info"
    )
    return render_template('tools/pricing-calculator.html')


@toolset_bp.route('/pricing-calculator/calculate', methods=['POST'])
@login_required
def calculate_pricing():
    """计算定价"""
    if PricingCalculator is None:
        return jsonify({
            'success': False,
            'message': '定价计算模块未正确加载'
        })

    try:
        # 获取表单数据
        data = request.get_json()
        
        # 创建计算器实例
        calculator = PricingCalculator()
        
        # 执行计算
        result = calculator.calculate_all(data)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        print(f"定价计算失败: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'计算失败: {str(e)}'
        })
