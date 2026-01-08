#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试新记录是否使用北京时间
"""

import sqlite3
import os
import sys
from datetime import datetime

# 设置输出编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'users.db')

def test_new_record():
    """测试新记录的时间戳"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("=== 测试新记录时间戳 ===")
        
        # 显示当前UTC和北京时间
        cursor.execute("SELECT datetime('now') as utc_time, datetime('now', '+8 hours') as beijing_time")
        times = cursor.fetchone()
        print(f"当前UTC时间: {times[0]}")
        print(f"当前北京时间: {times[1]}")
        
        # 插入测试日志记录
        print("\n插入测试日志记录...")
        cursor.execute('''
            INSERT INTO logs (user_id, username, action, details)
            VALUES (1, 'test_user', '时区测试', '测试新记录是否使用北京时间')
        ''')
        
        # 获取刚插入的记录
        cursor.execute('''
            SELECT timestamp FROM logs 
            WHERE username = 'test_user' AND action = '时区测试'
            ORDER BY id DESC LIMIT 1
        ''')
        result = cursor.fetchone()
        
        if result:
            timestamp = result[0]
            print(f"新记录时间戳: {timestamp}")
            
            # 检查时间戳是否接近北京时间
            try:
                record_time = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                beijing_time = datetime.strptime(times[1], '%Y-%m-%d %H:%M:%S')
                
                # 计算时间差
                time_diff = abs((record_time - beijing_time).total_seconds())
                
                if time_diff < 60:  # 1分钟内认为正确
                    print("✓ 新记录使用北京时间")
                else:
                    print(f"✗ 时间戳不正确，与北京时间相差 {time_diff} 秒")
                
            except ValueError as e:
                print(f"时间解析错误: {e}")
        else:
            print("✗ 未找到测试记录")
        
        # 清理测试数据
        cursor.execute("DELETE FROM logs WHERE username = 'test_user' AND action = '时区测试'")
        
        conn.commit()
        print("\n测试完成，已清理测试数据")
        
    except Exception as e:
        print(f"测试失败: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    test_new_record()