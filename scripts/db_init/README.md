# 数据库初始化脚本

这个文件夹包含了数据库初始化和迁移相关的脚本。这些脚本主要用于：

1. 初始化数据库结构
2. 修复数据库问题
3. 执行数据库迁移

## 文件说明

- `add_unique_constraint.py`: 添加店铺名称唯一性约束的迁移脚本
- `fix_database.py`: 修复数据库脚本，添加缺失的logs表
- `migrate_shop_table.py`: 店铺表迁移脚本，添加品牌名称、运营者和店铺属性字段

## 使用说明

这些脚本主要用于项目初始化阶段，在数据库结构确定后，通常不再需要重复运行。

### 运行方式

```bash
# 在项目根目录下运行
python scripts/db_init/add_unique_constraint.py
python scripts/db_init/fix_database.py
python scripts/db_init/migrate_shop_table.py
```

## 注意事项

- 运行前请确保数据库文件(users.db)存在于项目根目录
- 这些脚本通常只需要运行一次
- 在生产环境运行前请备份数据库