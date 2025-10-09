#!/usr/bin/env python3
"""
测试日志功能脚本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import add_log, get_logs
from core.log_service import LogService, LogLevel, LogType

def test_basic_log_functionality():
    """测试基本日志功能"""
    print("测试基本日志功能...")
    
    # 测试直接添加日志
    result = add_log(
        user_id=1,
        username="test_user",
        action="测试操作",
        resource="测试资源",
        details="这是一个测试日志",
        log_type="test",
        level="info"
    )
    
    if result:
        print("✓ 直接添加日志成功")
    else:
        print("✗ 直接添加日志失败")
        return False
    
    # 测试获取日志
    logs = get_logs(limit=5)
    if logs:
        print(f"✓ 获取日志成功，共 {len(logs)} 条记录")
        for log in logs:
            print(f"  - ID: {log['id']}, 用户: {log['username']}, 操作: {log['action']}")
    else:
        print("✗ 获取日志失败")
        return False
    
    return True

def test_log_service():
    """测试日志服务"""
    print("\n测试日志服务...")
    
    try:
        # 测试 LogService.log 方法
        LogService.log(
            action="服务测试",
            resource="测试模块",
            details="使用 LogService 记录的测试日志",
            log_type=LogType.SYSTEM,
            level=LogLevel.INFO,
            user_id=1,
            username="test_user"
        )
        print("✓ LogService.log 成功")
        
        # 再次获取日志，验证新记录
        logs = get_logs(limit=5)
        found_test_log = False
        for log in logs:
            if log['action'] == "服务测试":
                found_test_log = True
                print(f"✓ LogService.log 记录验证成功，ID: {log['id']}")
                break
        
        if not found_test_log:
            print("✗ LogService.log 记录验证失败")
            print("最近的日志记录:")
            for log in logs:
                print(f"  - ID: {log['id']}, 操作: {log['action']}, 类型: {log['log_type']}")
            return False
            
    except Exception as e:
        print(f"✗ LogService 测试失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("开始测试日志功能...\n")
    
    success = True
    success &= test_basic_log_functionality()
    success &= test_log_service()
    
    if success:
        print("\n🎉 所有测试通过！日志功能正常工作。")
    else:
        print("\n❌ 测试失败！日志功能存在问题。")