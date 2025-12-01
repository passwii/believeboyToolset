from flask import Blueprint, render_template, request, jsonify
import pandas as pd
import numpy as np
import io
from core.auth import login_required
from core.log_service import LogService

inventory_analysis_bp = Blueprint('inventory_analysis', __name__)

@inventory_analysis_bp.route('/', methods=['GET'])
@login_required
def inventory_page():
    LogService.log(
        action="访问库存分析页面",
        resource="库存分析",
        log_type="user",
        level="info"
    )
    return render_template('data-analysis/inventory_analysis.html')

@inventory_analysis_bp.route('/analyze', methods=['POST'])
@login_required
def analyze_inventory():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '未选择文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': '未选择文件'}), 400
        
        # 读取CSV，处理BOM
        df = pd.read_csv(io.BytesIO(file.read()), encoding='utf-8-sig')
        
        # 数值列列表（基于CSV头部）
        numeric_cols = [
            'available', 'pending-removal-quantity',
            'inv-age-0-to-90-days', 'inv-age-91-to-180-days', 'inv-age-181-to-270-days',
            'inv-age-271-to-365-days', 'inv-age-365-plus-days',
            'units-shipped-t7', 'units-shipped-t30', 'units-shipped-t60', 'units-shipped-t90',
            'sales-shipped-last-7-days', 'sales-shipped-last-30-days',
            'sales-shipped-last-60-days', 'sales-shipped-last-90-days',
            'estimated-storage-cost-next-month', 'storage-volume',
            'days-of-supply', 'weeks-of-cover-t30', 'weeks-of-cover-t90',
            'estimated-excess-quantity'
        ]
        # 转数值
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # 1. 库存健康汇总
        health_cols = 'fba-inventory-level-health-status'
        if health_cols in df.columns:
            health_summary = df.groupby(health_cols)['available'].agg(
                total_available='sum',
                count='size'
            ).round(2).to_dict()
        else:
            health_summary = {}
        
        # 2. 老库存汇总
        old_inv_cols = [col for col in df.columns if 'inv-age-' in col and '365' in col]
        total_old_inv = df[old_inv_cols].sum().sum() if old_inv_cols else 0
        
        # 3. 销售趋势 (T7/T30/T60/T90)
        sales_trend_cols = ['units-shipped-t7', 'units-shipped-t30', 'units-shipped-t60', 'units-shipped-t90']
        sales_trend = {col: float(df[col].sum()) for col in sales_trend_cols if col in df.columns}
        
        # 4. 存储成本
        total_storage_cost = float(df.get('estimated-storage-cost-next-month', 0).sum())
        
        # 5. 推荐行动统计
        rec_action = df['recommended-action'].value_counts().to_dict() if 'recommended-action' in df.columns else {}
        
        # 6. 总体统计
        totals = {
            'total_available': int(df['available'].sum()),
            'total_skus': len(df),
            'low_stock_skus': len(df[df['available'] < 30]),
            'excess_skus': len(df[df.get('fba-inventory-level-health-status', '') == 'Excess'])
        }
        
        # 7. Top 5 高风险SKU (老库存多)
        df['total_old_age'] = df[old_inv_cols].sum(axis=1) if old_inv_cols else 0
        top_risk_skus = df.nlargest(5, 'total_old_age')[['sku', 'total_old_age', 'available']].to_dict('records')
        
        data = {
            'health_summary': health_summary,
            'total_old_inventory': float(total_old_inv),
            'sales_trend': sales_trend,
            'total_storage_cost': total_storage_cost,
            'recommended_actions': rec_action,
            'totals': totals,
            'top_risk_skus': top_risk_skus,
            'total_rows': len(df)
        }
        
        LogService.log(
            action="库存数据分析",
            resource="库存分析",
            details=f"分析 {len(df)} 行数据，总可用库存: {totals['total_available']}",
            log_type="user",
            level="info"
        )
        
        return jsonify({'success': True, 'data': data})
    
    except Exception as e:
        LogService.log(
            action="库存分析失败",
            resource="库存分析",
            details=str(e),
            log_type="user",
            level="error"
        )
        return jsonify({'success': False, 'error': str(e)}), 500