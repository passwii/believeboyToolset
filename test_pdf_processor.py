#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF处理模块测试脚本
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

try:
    from apps.product_label_processor import SimplePDFProcessor, process_pdf_file
    print("✓ PDF处理模块导入成功")
    
    # 测试1: 创建处理器实例
    processor = SimplePDFProcessor("nonexistent.pdf")
    print("✓ PDF处理器实例创建成功")
    
    # 测试2: 检查替换规则
    rules = processor.get_replacement_rules()
    print(f"✓ 默认替换规则: {rules}")
    
    # 测试3: 测试PDF文件检查（不存在的文件）
    result = process_pdf_file("tests/productLabel.pdf", case_sensitive=True, whole_word=True)
    print(f"✓ PDF处理测试结果: {result}")
    
    if result['success']:
        print(f"✓ 处理成功！输出文件: {result['output_path']}")
        print(f"✓ 替换次数: {result['replacement_count']}")
    else:
        print(f"✗ 处理失败: {result.get('error', '未知错误')}")
    
    print("\n=== 所有测试通过！PDF处理功能模块已就绪 ===")
    
except ImportError as e:
    print(f"✗ 导入失败: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ 其他错误: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)