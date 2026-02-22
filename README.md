# BelieveBoy 工具集 - 重构版

彼励扶工具集的现代化重构版本，采用 Next.js + FastAPI 架构。

## 技术栈

### 前端

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (玻璃态设计风格）
- **Zustand** (状态管理)
- **Axios** (HTTP 客户端)

### 后端

- **FastAPI** (Python 异步框架)
- **SQLAlchemy** (ORM)
- **SQLite** (数据库)
- **JWT** (认证)
- **Pydantic** (数据验证)

## 项目结构

```
believeboyToolset/
├── frontend/            # Next.js 前端应用
│   ├── src/
│   │   ├── app/         # App Router 页面
│   │   ├── components/  # React 组件
│   │   ├── lib/         # 工具函数
│   │   ├── stores/      # Zustand 状态
│   │   └── types/       # TypeScript 类型
│   └── package.json
│
├── backend/             # FastAPI 后端应用
│   ├── app/
│   │   ├── api/v1/     # API 路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # SQLAlchemy 模型
│   │   └── schemas/     # Pydantic 模型
│   └── requirements.txt
│
├── data/               # 数据目录
│   ├── database.db      # SQLite 数据库
│   ├── uploads/         # 上传文件
│   └── outputs/         # 生成文件
│
├── archive/            # 归档（旧代码备份）
├── Refactor.md         # 重构总规划
├── Refactor-Frontend.md # 前端规划
└── Refactor-Backend.md  # 后端规划
```

## 快速开始

### 后端启动

```bash
cd backend

# 安装依赖
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 初始化数据库
python init_db.py

# 启动服务
uvicorn app.main:app --reload --port 8000
```

后端将在 http://localhost:8000 启动

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:3000 启动

## 默认用户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| damonrock | jrway2012 | admin
| user | user123 | user |

## 功能模块

### 运营导航

- 运营总览
- 站点导航
- 店铺导航

### 数据分析

- 销售日报
- 财务月报
- 产品分析
- 优麦云分析

### 工具集

- 汇率展示
- Excel 去公式
- 调研分析
- 图片处理
- 亚马逊前台采集
- AI 面板

### 管理

- 用户管理 (仅管理员)
- 商店管理 (仅管理员)
- 日志管理 (仅管理员)
- 密码修改

## API 文档

启动后端后，访问自动生成的 API 文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 开发说明

### 前端开发

- 组件使用 TypeScript 编写
- 遵循 Vue 3 Composition API 规范
- 使用 Tailwind CSS 进行样式设计
- API 调用使用 Axios 配置在 `lib/api.ts`

### 后端开发

- 遵循 FastAPI 最佳实践
- 使用 Pydantic 进行数据验证
- 遵循 RESTful API 设计
- 使用 SQLAlchemy ORM 操作数据库

## 部署

### 前端部署 (Vercel)

```bash
cd frontend
npm run build
vercel
```

### 后端部署 (Railway/Render)

```bash
cd backend
# 按照平台要求部署
```

## 许可证

MIT

## 更新日志

### v2.0.0 (2026-02-22)

- 完全重构：Next.js + FastAPI 架构
- 前后端分离
- 现代化 UI 设计（玻璃态）
- JWT 认证系统
- RESTful API 设计

### v3.1.0 (旧版 - 已归档)

- Flask + Vue.js 单体应用
- 已归档到 archive/backup-20260222/

## 版本更新历史

### V3.1 功能更新 (2025-10-21)
- 添加商店模型和管理功能
- 新增管理员密码修改界面
- 完善商店导航和操作界面
- 更新路由配置和数据库结构
- 优化前端工具和样式

## 功能特性

- 工具集：汇率转换、图片处理等
- 数据分析：日报、月报、产品分析等
- 模板文件：各种业务模板
- 产品分析：支持Amazon业务报告、付款报告、广告报表的智能分析

### 产品分析功能
- **分次上传**：支持分批次上传3个必需文件（业务报告.csv、付款报告.csv、广告报表.xlsx）
- **智能识别**：根据文件名自动识别文件类型
- **文件替换**：已上传的文件可以被新文件替换
- **实时状态**：每个文件的上传状态实时显示
- **灵活操作**：无需一次性上传所有文件

## 安装和运行

1. 安装依赖：
   ```
   pip install -r requirements.txt
   ```

2. 运行应用：
   ```
   python app.py
   ```

3. 访问应用：
   打开浏览器访问 http://localhost:8800

## 登录信息

应用现在需要登录才能访问。默认提供了两个用户：

- 用户名: `admin` 密码: `admin123`
- 用户名: `user` 密码: `user123`

## 开发说明

### 项目结构

```
.
├── app.py                      # Flask应用入口
├── requirements.txt            # Python依赖
├── README.md
│
├── backend/                    # 后端代码
│   ├── config.py              # 配置文件
│   ├── auth.py                # 认证蓝图
│   ├── manage_users.py        # 用户管理工具
│   ├── models/                # 数据库模型
│   │   ├── user_model.py
│   │   └── shop_model.py
│   ├── services/              # 业务服务
│   │   ├── auth_service.py
│   │   ├── log_service.py
│   │   └── statistics_service.py
│   ├── utils/                 # 工具类
│   │   └── exceptions.py
│   └── database/              # 数据库相关
│       ├── database.py
│       └── database_config.py
│
├── routes/                     # API路由
│   ├── __init__.py
│   ├── admin.py              # 管理员路由
│   ├── api_auth.py           # API认证
│   ├── dataset.py            # 数据集路由
│   ├── help.py               # 帮助路由
│   └── toolset.py            # 工具集路由
│
├── modules/                    # 业务模块
│   ├── dataset/               # 数据分析模块
│   │   ├── daily_report.py
│   │   ├── monthly_report.py
│   │   ├── product_analysis.py
│   │   └── yumai_analysis.py
│   └── toolset/               # 工具模块
│       ├── excel_formula_remover.py
│       ├── monthly_report_code_original.py
│       └── research_analysis.py
│
├── frontend/                   # Vue/TypeScript前端
│   ├── src/
│   ├── public/
│   └── package.json
│
├── data/                       # 运行时数据 (gitignored)
│   ├── database/              # 数据库文件
│   ├── uploads/               # 上传文件
│   └── projects/             # 项目数据
│
├── tests/                      # 测试文件
├── docs/                       # 文档
├── scripts/                    # 脚本工具
├── migrations/                 # 数据库迁移
└── archive/                    # 归档文件
```

### 添加新功能

1. 在`routes/`目录下创建新的路由文件
2. 在`templates/`目录下创建对应的HTML模板
3. 在`statics/`目录下添加需要的CSS/JS文件
4. 在`routes/__init__.py`中注册新的蓝图

### 认证系统

认证系统基于Flask的session机制实现：

- 使用`@login_required`装饰器保护需要登录的路由
- 用户信息存储在session中
- 密码使用SHA256哈希存储

### 部署说明

在生产环境中，请务必：

1. 更改`config.py`中的`SECRET_KEY`
2. 使用强密码替换默认用户密码
3. 配置HTTPS
4. 设置适当的服务器安全策略
