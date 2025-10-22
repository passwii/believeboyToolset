# 数据库北京时间解决方案

本解决方案确保您的SQLite数据库中所有时间字段默认使用北京时间（UTC+8），避免每次创建新表时都需要手动设置时区。

## 问题背景

在SQLite中，默认的时间函数`datetime('now')`返回UTC时间，这导致：
- 需要在每个时间字段手动添加`+8 hours`
- 容易遗漏某些表或字段
- 代码重复，维护困难

## 解决方案概述

我们实现了一套完整的时区管理方案，包括：

1. **核心配置模块** (`core/database_config.py`)
2. **修改的数据库模块** (`core/database.py`)
3. **时区设置脚本** (`app/db_init/set_beijing_timezone_default.py`)
4. **验证脚本** (`app/db_init/verify_timezone.py`)
5. **使用指南** (`app/db_init/beijing_timezone_guide.md`)

## 快速开始

### 1. 首次设置

对于现有数据库，运行：
```bash
python app/db_init/set_beijing_timezone_default.py
```

### 2. 验证设置

检查时区是否正确设置：
```bash
python app/db_init/verify_timezone.py
```

### 3. 启动应用

正常启动应用，时区设置会自动生效：
```bash
python app.py
```

## 文件说明

### 核心文件

#### `core/database_config.py`
- 提供全局时区配置
- 包含`get_db_connection()`函数，自动设置时区偏移
- 提供创建表和添加列的辅助函数

#### `core/database.py`（已修改）
- 导入并使用新的数据库配置
- 修改了`init_db()`函数，使用北京时间初始化
- 更新了`update_shop()`和`clean_old_logs()`函数

### 工具脚本

#### `app/db_init/set_beijing_timezone_default.py`
- 更新现有表结构，设置北京时间默认值
- 保留所有现有数据
- 提供创建新表和添加列的辅助函数

#### `app/db_init/verify_timezone.py`
- 验证数据库时区设置
- 检查所有表的时间字段默认值
- 显示最近数据记录的时间戳

### 文档

#### `app/db_init/beijing_timezone_guide.md`
- 详细的使用指南
- 代码示例和最佳实践
- 常见问题解答

## 主要优势

1. **一次性设置**：运行一次脚本，所有表都使用北京时间
2. **自动维护**：新创建的表自动使用北京时间
3. **向后兼容**：不影响现有数据和功能
4. **易于验证**：提供验证脚本确认设置正确
5. **完整文档**：详细的使用指南和示例

## 技术实现

### SQLite时区处理
在SQLite中，我们使用以下方法处理时区：
```sql
-- 使用UTC+8小时偏移获取北京时间
datetime('now', '+8 hours')
```

### Python代码集成
```python
# 获取配置了北京时间的数据库连接
from core.database_config import get_db_connection

conn = get_db_connection()
# 所有时间操作都会使用北京时间
```

## 使用示例

### 创建新表
```python
from app.db_init.set_beijing_timezone_default import create_new_table_with_beijing_time

columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name TEXT NOT NULL",
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
]

create_new_table_with_beijing_time("my_table", columns)
```

### 添加时间字段
```python
from app.db_init.set_beijing_timezone_default import add_time_column_with_beijing_default

add_time_column_with_beijing_default("existing_table", "new_time_column")
```

### 常规数据库操作
```python
from core.database import get_db_connection, add_log

# 获取连接（已配置北京时间）
conn = get_db_connection()

# 添加日志（时间戳自动使用北京时间）
add_log(user_id=1, username="test", action="测试操作")
```

## 验证清单

设置完成后，验证以下几点：

- [ ] 运行`verify_timezone.py`显示所有时间字段有正确的默认值
- [ ] 新插入的记录时间戳是北京时间
- [ ] 现有应用功能正常工作
- [ ] 查询结果显示正确的时间

## 故障排除

### 问题：时间仍然是UTC时间
**解决方案**：
1. 确保使用`core.database_config.get_db_connection()`
2. 检查表结构是否包含`+8 hours`
3. 运行时区设置脚本

### 问题：脚本执行失败
**解决方案**：
1. 检查数据库文件权限
2. 确保数据库未被其他进程锁定
3. 备份数据库后重试

## 最佳实践

1. **定期验证**：定期运行验证脚本确保时区设置正确
2. **代码规范**：始终使用提供的辅助函数创建表
3. **文档更新**：更新团队文档，说明时区处理方式
4. **测试覆盖**：为新的时间相关功能添加测试

## 维护说明

这个解决方案设计为"设置后无需维护"，但建议：

1. 每次添加新表时使用提供的辅助函数
2. 定期运行验证脚本
3. 在应用启动时检查时区设置（已在app.py中实现）

## 总结

通过这个解决方案，您不再需要为每个新表或时间字段担心时区问题。所有时间操作都会自动使用北京时间，大大简化了开发工作并避免了时区相关的错误。