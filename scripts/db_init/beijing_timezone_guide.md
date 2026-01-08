# 数据库北京时间设置指南

本指南说明如何使用新添加的功能确保数据库中的所有时间字段默认使用北京时间（UTC+8）。

## 概述

我们已经实现了以下组件来处理时区问题：

1. **core/database_config.py** - 数据库时区配置模块
2. **scripts/db_init/set_beijing_timezone_default.py** - 时区设置脚本
3. **修改后的 core/database.py** - 使用新的时区配置

## 使用方法

### 1. 初始化新数据库

对于新数据库，系统会自动使用北京时间作为默认值。只需正常调用 `init_db()` 函数：

```python
from core.database import init_db

# 初始化数据库，所有时间字段将默认使用北京时间
init_db()
```

### 2. 更新现有数据库

对于现有数据库，运行以下脚本：

```bash
python scripts/db_init/set_beijing_timezone_default.py
```

此脚本会：
- 扫描所有表
- 重建表以设置北京时间默认值
- 保留所有现有数据

### 3. 创建新表

创建新表时，使用以下方法确保时间字段使用北京时间：

#### 方法1：使用辅助函数

```python
from scripts.db_init.set_beijing_timezone_default import create_new_table_with_beijing_time

# 定义表结构
columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TEXT NOT NULL",
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "updated_at TIMESTAMP"
]

# 创建表，时间字段会自动设置为北京时间
create_new_table_with_beijing_time("my_new_table", columns)
```

#### 方法2：手动指定北京时间

```python
import sqlite3
from core.database_config import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()

# 创建表时明确指定北京时间
cursor.execute('''
    CREATE TABLE my_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT (datetime('now', '+8 hours')),
        updated_at TIMESTAMP DEFAULT (datetime('now', '+8 hours'))
    )
''')

conn.commit()
conn.close()
```

### 4. 添加时间字段到现有表

```python
from scripts.db_init.set_beijing_timezone_default import add_time_column_with_beijing_default

# 添加时间字段，默认使用北京时间
add_time_column_with_beijing_default("existing_table", "new_time_column")
```

### 5. 在代码中使用

在您的应用代码中，只需使用修改后的数据库函数：

```python
from core.database import get_db_connection, add_log

# 获取连接（已配置北京时间）
conn = get_db_connection()

# 添加日志（时间戳会自动使用北京时间）
add_log(
    user_id=1,
    username="test_user",
    action="测试操作",
    details="这是一个测试"
)
```

## 验证时区设置

您可以使用以下SQL查询验证时区设置：

```sql
-- 查看当前UTC时间和北京时间
SELECT datetime('now') as utc_time, datetime('now', '+8 hours') as beijing_time;

-- 查看表结构
PRAGMA table_info(your_table_name);
```

## 注意事项

1. **备份重要**：在运行时区更新脚本前，请务必备份数据库
2. **现有数据**：更新脚本会保留所有现有数据，但会改变时间字段的默认值
3. **新表创建**：创建新表时，请使用提供的方法确保时间字段使用北京时间
4. **应用代码**：确保应用代码使用 `core.database_config.get_db_connection()` 获取数据库连接

## 常见问题

### Q: 为什么我的时间仍然是UTC时间？
A: 请确保您使用了 `core.database_config.get_db_connection()` 而不是直接创建SQLite连接。

### Q: 如何确保所有新表都使用北京时间？
A: 使用 `create_new_table_with_beijing_time()` 函数或手动在SQL中指定 `(datetime('now', '+8 hours'))`。

### Q: 运行更新脚本后数据会丢失吗？
A: 不会，更新脚本会保留所有现有数据，只是修改表结构和默认值。

## 最佳实践

1. 在应用启动时检查时区设置
2. 定期备份数据库
3. 为所有时间字段设置明确的默认值
4. 在文档中记录时区设置
5. 对开发团队进行时区处理培训

## 自动化建议

您可以将时区检查添加到应用的启动流程中：

```python
def verify_timezone_setting():
    """验证时区设置是否正确"""
    from core.database_config import get_db_connection
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT datetime('now', '+8 hours')")
    beijing_time = cursor.fetchone()[0]
    
    conn.close()
    
    # 检查时间是否包含正确的时区偏移
    if "+08:00" not in beijing_time:
        print("警告: 数据库时区设置可能不正确")
        return False
    
    print(f"数据库时区设置正确，当前北京时间: {beijing_time}")
    return True

# 在应用启动时调用
verify_timezone_setting()
```

通过遵循本指南，您可以确保所有数据库操作都正确使用北京时间，避免时区混淆问题。