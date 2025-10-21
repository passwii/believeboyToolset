"""
统计服务模块
提供报告生成统计和数据分析功能
"""

import sqlite3
from datetime import datetime, timedelta
from core.database import get_db_connection

class StatisticsService:
    
    @staticmethod
    def get_report_statistics(days=7):
        """
        获取报告生成统计数据
        
        参数:
            days: 统计天数，默认7天
            
        返回:
            dict: 包含各类报告统计数据的字典
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # 计算日期范围
            end_date = datetime.utcnow() + timedelta(hours=8)  # 北京时间
            start_date = end_date - timedelta(days=days)
            
            # 格式化日期
            start_date_str = start_date.strftime('%Y-%m-%d 00:00:00')
            end_date_str = end_date.strftime('%Y-%m-%d 23:59:59')
            
            # 首先获取所有包含"生成"的日志，看看有哪些报告类型
            cursor.execute("""
                SELECT DISTINCT action FROM logs
                WHERE action LIKE '%生成%'
                ORDER BY action
            """)
            all_report_actions = cursor.fetchall()
            all_actions = [action['action'] for action in all_report_actions]
            print("所有报告生成操作:", all_actions)
            
            # 根据实际日志中的操作类型构建报告类型映射
            report_types = {
                'daily': '生成日报',
                'weekly': '生成周报',
                'monthly': '生成月报',
                'product_analysis': '生成产品分析报告'
            }
            
            # 检查是否有其他报告类型需要添加
            for action in all_actions:
                if '日报' in action and '生成日报' not in report_types.values():
                    report_types['daily'] = action
                elif '周报' in action and '生成周报' not in report_types.values():
                    report_types['weekly'] = action
                elif '月报' in action and '生成月报' not in report_types.values():
                    report_types['monthly'] = action
                elif '产品分析' in action and '生成产品分析报告' not in report_types.values():
                    report_types['product_analysis'] = action
            
            statistics = {
                'daily': {'today': 0, 'week': 0, 'month': 0},
                'weekly': {'week': 0, 'month': 0},
                'monthly': {'month': 0, 'quarter': 0},
                'product_analysis': {'week': 0, 'month': 0},
                'trend_data': [],
                'recent_activities': []
            }
            
            # 获取今日数据
            today_start = end_date.strftime('%Y-%m-%d 00:00:00')
            today_end = end_date_str
            
            # 获取本周数据（周一到今天）
            week_start = (end_date - timedelta(days=end_date.weekday())).strftime('%Y-%m-%d 00:00:00')
            
            # 获取本月数据
            month_start = end_date.replace(day=1).strftime('%Y-%m-%d 00:00:00')
            
            # 获取本季度数据
            quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
            quarter_start = end_date.replace(month=quarter_start_month, day=1).strftime('%Y-%m-%d 00:00:00')
            
            # 统计各类报告数量
            for report_key, action_name in report_types.items():
                # 今日统计
                cursor.execute("""
                    SELECT COUNT(*) FROM logs 
                    WHERE action = ? AND timestamp BETWEEN ? AND ?
                """, (action_name, today_start, today_end))
                count = cursor.fetchone()[0]
                
                if report_key == 'daily':
                    statistics['daily']['today'] = count
                
                # 本周统计
                cursor.execute("""
                    SELECT COUNT(*) FROM logs 
                    WHERE action = ? AND timestamp BETWEEN ? AND ?
                """, (action_name, week_start, today_end))
                count = cursor.fetchone()[0]
                
                if report_key == 'daily':
                    statistics['daily']['week'] = count
                elif report_key == 'weekly':
                    statistics['weekly']['week'] = count
                elif report_key == 'product_analysis':
                    statistics['product_analysis']['week'] = count
                
                # 本月统计
                cursor.execute("""
                    SELECT COUNT(*) FROM logs 
                    WHERE action = ? AND timestamp BETWEEN ? AND ?
                """, (action_name, month_start, today_end))
                count = cursor.fetchone()[0]
                
                if report_key == 'daily':
                    statistics['daily']['month'] = count
                elif report_key == 'weekly':
                    statistics['weekly']['month'] = count
                elif report_key == 'monthly':
                    statistics['monthly']['month'] = count
                elif report_key == 'product_analysis':
                    statistics['product_analysis']['month'] = count
                
                # 本季度统计（仅月报）
                if report_key == 'monthly':
                    cursor.execute("""
                        SELECT COUNT(*) FROM logs 
                        WHERE action = ? AND timestamp BETWEEN ? AND ?
                    """, (action_name, quarter_start, today_end))
                    count = cursor.fetchone()[0]
                    statistics['monthly']['quarter'] = count
            
            # 获取趋势数据（最近7天）
            for i in range(days):
                date = end_date - timedelta(days=i)
                date_start = date.strftime('%Y-%m-%d 00:00:00')
                date_end = date.strftime('%Y-%m-%d 23:59:59')
                date_str = date.strftime('%Y-%m-%d')
                
                day_stats = {'date': date_str}
                
                for report_key, action_name in report_types.items():
                    cursor.execute("""
                        SELECT COUNT(*) FROM logs 
                        WHERE action = ? AND timestamp BETWEEN ? AND ?
                    """, (action_name, date_start, date_end))
                    count = cursor.fetchone()[0]
                    day_stats[report_key] = count
                
                statistics['trend_data'].append(day_stats)
            
            # 反转趋势数据，使日期从早到晚
            statistics['trend_data'] = statistics['trend_data'][::-1]
            
            # 获取最近活动
            cursor.execute("""
                SELECT action, resource, username, timestamp, details
                FROM logs 
                WHERE action LIKE '%生成%'
                ORDER BY timestamp DESC 
                LIMIT 10
            """)
            
            activities = cursor.fetchall()
            for activity in activities:
                statistics['recent_activities'].append({
                    'action': activity['action'],
                    'resource': activity['resource'],
                    'username': activity['username'],
                    'timestamp': activity['timestamp'],
                    'details': activity['details']
                })
            
            return statistics
            
        except Exception as e:
            print(f"获取统计数据失败: {e}")
            return {
                'daily': {'today': 0, 'week': 0, 'month': 0},
                'weekly': {'week': 0, 'month': 0},
                'monthly': {'month': 0, 'quarter': 0},
                'product_analysis': {'week': 0, 'month': 0},
                'trend_data': [],
                'recent_activities': []
            }
        finally:
            conn.close()
    
    @staticmethod
    def get_system_status():
        """
        获取系统状态信息
        
        返回:
            dict: 包含系统状态的字典
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # 检查数据库连接
            cursor.execute("SELECT 1")
            db_status = "正常" if cursor.fetchone()[0] == 1 else "异常"
            
            # 获取用户总数
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            # 获取日志总数
            cursor.execute("SELECT COUNT(*) FROM logs")
            log_count = cursor.fetchone()[0]
            
            # 获取最近登录时间
            cursor.execute("""
                SELECT timestamp, username FROM logs 
                WHERE action = '登录成功' 
                ORDER BY timestamp DESC 
                LIMIT 1
            """)
            last_login = cursor.fetchone()
            
            conn.close()
            
            return {
                'database_status': db_status,
                'user_count': user_count,
                'log_count': log_count,
                'last_login': {
                    'timestamp': last_login['timestamp'] if last_login else None,
                    'username': last_login['username'] if last_login else None
                },
                'system_time': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            print(f"获取系统状态失败: {e}")
            return {
                'database_status': '异常',
                'user_count': 0,
                'log_count': 0,
                'last_login': None,
                'system_time': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }