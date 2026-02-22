# 后端模块重构规划

## 一、后端模块分类

根据现有 Flask 后端的路由和模块，后端 API 分为以下几大类：

---

## 二、API 端点总览

### 2.1 认证系统 (Auth)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/auth/login` | POST | 用户登录 | 待迁移 |
| `/api/auth/logout` | POST | 用户登出 | 待迁移 |
| `/api/auth/me` | GET | 获取当前用户 | 待迁移 |
| `/api/auth/change-password` | POST | 修改密码 | 待迁移 |

### 2.2 用户管理 (Users)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/admin/users` | GET | 获取用户列表 | 待迁移 |
| `/api/admin/users/add` | POST | 添加用户 | 待迁移 |
| `/api/admin/users/<id>` | DELETE | 删除用户 | 待迁移 |
| `/api/admin/change-password` | GET/POST | 管理员修改密码 | 待迁移 |

### 2.3 商店管理 (Shops)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/admin/shops` | GET | 商店列表页面 | 待迁移 |
| `/api/admin/shops/list` | GET | 获取商店列表 | 待迁移 |
| `/api/admin/shops/add` | POST | 添加商店 | 待迁移 |
| `/api/admin/shops/update/<id>` | POST | 更新商店 | 待迁移 |
| `/api/admin/shops/delete/<id>` | DELETE | 删除商店 | 待迁移 |
| `/api/admin/shops/check-name` | POST | 检查商店名称 | 待迁移 |
| `/api/toolset/shops/list` | GET | 运营 - 商店列表 | 待迁移 |
| `/api/toolset/shops/nav` | GET | 商店导航数据 | 待迁移 |

### 2.4 日志管理 (Logs)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/admin/logs` | GET | 日志列表页面 | 待迁移 |
| `/api/admin/logs/clear` | POST | 清空日志 | 待迁移 |
| `/api/admin/logs/download` | GET | 下载日志 | 待迁移 |
| `/api/admin/logs/delete-all` | POST | 删除所有日志 | 待迁移 |

### 2.5 数据分析 (Data Analysis) - 报表处理

| 端点 | 方法 | 功能 | 模块 |
|------|------|------|------|
| `/api/dataset/daily-report/upload-file` | POST | 日报 - 上传文件 | daily_report.py |
| `/api/dataset/daily-report/` | GET/POST | 日报 - 处理/展示 | daily_report.py |
| `/api/dataset/monthly-report/upload-file` | POST | 月报 - 上传文件 | monthly_report.py |
| `/api/dataset/monthly-report/` | GET/POST | 月报 - 处理/展示 | monthly_report.py |
| `/api/dataset/product-analysis/upload-file` | POST | 产品分析 - 上传文件 | product_analysis.py |
| `/api/dataset/product-analysis/submit` | POST | 产品分析 - 提交处理 | product_analysis.py |
| `/api/yumai-analysis` | GET | 优麦云分析页面 | yumai_analysis.py |
| `/api/yumai-analysis/upload-file` | POST | 优麦云 - 上传文件 | yumai_analysis.py |
| `/api/yumai-analysis/submit` | POST | 优麦云 - 提交处理 | yumai_analysis.py |
| `/api/dataset/timeline` | GET | 时间线页面 | 待迁移 |

### 2.6 工具集 (Tools)

| 端点 | 方法 | 功能 | 模块 |
|------|------|------|------|
| `/api/toolset/exchange-rate-display` | GET | 汇率展示 | 待开发 |
| `/api/toolset/research-analysis` | GET | 调研分析页面 | research_analysis.py |
| `/api/toolset/research-analysis/upload` | POST | 调研分析 - 上传 | research_analysis.py |
| `/api/toolset/research-analysis/download/<filename>` | GET | 调研分析 - 下载 | research_analysis.py |
| `/api/toolset/research-analysis/cleanup` | POST | 调研分析 - 清理 | research_analysis.py |
| `/api/toolset/excel-formula-remover` | GET/POST | Excel去公式 | excel_formula_remover.py |
| `/api/toolset/img-believeboy` | GET | 图片展示页面 | 待迁移 |
| `/api/toolset/proxy-img-believeboy` | GET | 图片代理 | 待迁移 |

### 2.7 运营相关 (Operations)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/toolset/operations-overview` | GET | 运营总览页面 | 待迁移 |
| `/api/toolset/operations-nav` | GET | 运营导航数据 | 待迁移 |
| `/api/admin/operations-info` | GET | 运营信息页面 | 待迁移 |

### 2.8 模板文件 (Templates)

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/toolset/sku-cost-table` | GET | SKU成本表页面 | 待开发 |
| `/api/toolset/project-progress-table` | GET | 项目进度表页面 | 待开发 |
| `/api/toolset/profit-calculation-table` | GET | 利润测算表页面 | 待开发 |

### 2.9 统计与健康检查

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/statistics` | GET | 获取统计数据 | 待迁移 |
| `/health` | GET | 健康检查 | 待迁移 |

---

## 三、业务模块详细说明

### 3.1 modules/dataset/ - 数据分析模块

| 文件 | 功能 | 输入 | 输出 |
|------|------|------|------|
| `daily_report.py` | 销售日报处理 | CSV文件 | HTML表格 |
| `monthly_report.py` | 财务月报处理 | CSV/Excel文件 | HTML表格 |
| `product_analysis.py` | 产品分析 | 3个报表文件 | 分析结果 |
| `yumai_analysis.py` | 优麦云分析 | 数据文件 | 分析结果 |

#### 原有逻辑迁移要点：

**daily_report.py**
- 文件上传处理
- CSV 解析
- 数据处理逻辑

**monthly_report.py**
- 财务月报生成
- 多文件处理

**product_analysis.py**
- 业务报告解析
- 付款报告解析
- 广告报表解析
- 多维度数据分析

**yumai_analysis.py**
- 优麦云数据对接

### 3.2 modules/toolset/ - 工具模块

| 文件 | 功能 | 状态 |
|------|------|------|
| `excel_formula_remover.py` | Excel去公式 | 待迁移 |
| `research_analysis.py` | 调研分析 | 待迁移 |
| `monthly_report_code_original.py` | 月报代码原始版 | 归档 |

### 3.3 services/ - 服务层

| 文件 | 功能 |
|------|------|
| `auth_service.py` | 认证服务 |
| `log_service.py` | 日志服务 |
| `statistics_service.py` | 统计服务 |

---

## 四、FastAPI 项目结构设计

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口
│   └── config.py               # 配置
├── api/
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── auth.py            # 认证 API
│   │   ├── users.py           # 用户管理 API
│   │   ├── shops.py           # 商店管理 API
│   │   ├── logs.py            # 日志管理 API
│   │   ├── reports/           # 报表 API
│   │   │   ├── __init__.py
│   │   │   ├── daily.py       # 日报
│   │   │   ├── monthly.py     # 月报
│   │   │   ├── product.py     # 产品分析
│   │   │   └── yumai.py       # 优麦云
│   │   ├── tools/             # 工具 API
│   │   │   ├── __init__.py
│   │   │   ├── exchange.py    # 汇率
│   │   │   ├── research.py    # 调研分析
│   │   │   ├── excel.py       # Excel工具
│   │   │   └── image.py       # 图片处理
│   │   ├── operations.py      # 运营 API
│   │   ├── templates.py       # 模板 API
│   │   └── statistics.py      # 统计 API
│   └── dependencies.py        # 依赖注入
├── core/
│   ├── __init__.py
│   ├── security.py            # JWT、密码哈希
│   ├── database.py            # 数据库连接
│   └── exceptions.py          # 自定义异常
├── models/                    # SQLAlchemy 模型
│   ├── __init__.py
│   ├── user.py
│   ├── shop.py
│   ├── log.py
│   └── report.py
├── schemas/                   # Pydantic 模型
│   ├── __init__.py
│   ├── user.py
│   ├── auth.py
│   ├── shop.py
│   ├── report.py
│   └── tool.py
├── services/                  # 业务逻辑（复用现有）
│   ├── auth_service.py
│   ├── log_service.py
│   └── statistics_service.py
├── modules/                   # 原有业务模块（待迁移）
│   ├── dataset/
│   │   ├── daily_report.py
│   │   ├── monthly_report.py
│   │   ├── product_analysis.py
│   │   └── yumai_analysis.py
│   └── toolset/
│       ├── excel_formula_remover.py
│       └── research_analysis.py
├── utils/
│   ├── __init__.py
│   ├── file_handler.py        # 文件处理
│   └── data_processor.py      # 数据处理
├── data/                      # 数据目录
│   ├── uploads/               # 上传文件
│   ├── outputs/               # 输出文件
│   └── projects/              # 项目数据
└── requirements.txt
```

---

## 五、API 响应格式设计

### 5.1 标准响应

```json
// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 5.2 分页响应

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

### 5.3 文件上传响应

```json
{
  "success": true,
  "data": {
    "filename": "file.csv",
    "size": 1024,
    "uploaded_at": "2026-02-21T12:00:00Z"
  }
}
```

---

## 六、认证设计

### 6.1 JWT Token

```python
# Token 载荷
{
  "sub": "username",
  "user_id": 1,
  "role": "admin",
  "exp": 1800000000
}
```

### 6.2 Token 配置

- 过期时间：5 小时（与原 session 一致）
- 刷新机制：可选 refresh token

---

## 七、文件处理设计

### 7.1 上传目录

```
backend/data/
├── uploads/
│   ├── daily/          # 日报上传
│   ├── monthly/       # 月报上传
│   ├── product/       # 产品分析上传
│   ├── yumai/         # 优麦云上传
│   └── research/      # 调研分析上传
└── outputs/
    ├── reports/       # 生成的报表
    └── downloads/    # 下载文件
```

### 7.2 文件大小限制

- 默认：50MB
- 可配置

---

## 八、下一步行动

1. 确认 API 设计是否合理
2. 确定优先迁移的模块顺序
3. 开始搭建 FastAPI 骨架

---

*最后更新：2026-02-21*
