# 项目重构规划 - Refactor.md

## 一、项目现状分析

### 1.1 技术栈概览

| 层级 | 当前技术 | 描述 |
|------|---------|------|
| 前端框架 | Vue 3 + Vite | 已有现代化前端基础 |
| 前端 UI | Tailwind CSS + Glassmorphism | 设计风格现代化 |
| 前端状态 | Pinia | 官方推荐状态管理 |
| 后端框架 | Flask | 传统单体应用 |
| 数据库 | SQLite | 轻量级数据库 |
| 部署模式 | 混合部署 | 前端构建后放入 static/dist |

### 1.2 现有功能模块

#### 后端 API 路由（routes/）

| 蓝图 | 前缀 | 功能 |
|------|------|------|
| main | / | 统计、健康检查 |
| toolset | /api/toolset | 工具集（汇率、图片处理、研究分析等） |
| dataset | /api/dataset | 数据集（日报、月报、产品分析、时间线） |
| help | /api/help | 帮助文档（付款、广告、订单、FBA等） |
| admin | /api/admin | 管理面板（用户、日志、商店） |
| api_auth | /api/auth | API 认证（登录、登出、修改密码） |
| auth | / | HTML页面认证 |
| yumai_analysis | / | 优麦云分析 |

#### 业务模块（modules/）

- **dataset/** - 数据分析
  - daily_report.py - 日报处理
  - monthly_report.py - 月报处理
  - product_analysis.py - 产品分析
  - yumai_analysis.py - 优麦云分析

- **toolset/** - 工具集
  - excel_formula_remover.py - Excel公式移除
  - monthly_report_code_original.py - 月报代码
  - research_analysis.py - 研究分析

### 1.3 数据库模型

- **User** - 用户（id, username, password_hash, chinese_name, created_at）
- **Shop** - 商店（id, name, created_at）
- **Log** - 日志（id, action, details, created_at）
- **Report** - 报告记录（各种报表的元数据）

### 1.4 前端页面（views/）

已有 20+ 个页面：
- LoginView - 登录
- OperationsOverviewView - 运营概览
- OperationsInfoView - 运营信息
- ShopNavigationView - 商店导航
- DailyReportView - 日报
- MonthlyReportView - 月报
- ProductAnalysisView - 产品分析
- YumaiAnalysisView - 优麦云分析（开发中）
- ExcelFormulaRemoverView - Excel工具
- ImageResizerView - 图片处理
- ShopManagementView - 商店管理
- UserManagementView - 用户管理
- LogView - 日志查看
- UpdateLogView - 更新日志
- 等等...

---

## 二、重构目标

### 2.1 架构目标

```
┌─────────────────────────────────────────────────────────────┐
│                     部署层（Vercel）                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────┐         │
│   │   Next.js       │  <--->  │   Python API    │         │
│   │   前端应用       │  REST   │   (FastAPI)    │         │
│   │                 │  GraphQL│                 │         │
│   └─────────────────┘         └─────────────────┘         │
│           │                             │                   │
│           │                             │                   │
│           ▼                             ▼                   │
│   ┌─────────────────┐         ┌─────────────────┐         │
│   │   静态资源       │         │   SQLite        │         │
│   │   (CDN)         │         │   数据库         │         │
│   └─────────────────┘         └─────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 功能目标

1. **前端现代化** - 使用最新前端框架，提升开发体验和用户体验
2. **后端 API 化** - 彻底分离前后端，后端只负责 API
3. **部署简化** - 前端部署到 Vercel，后端可选部署
4. **代码可维护** - 清晰的目录结构，模块化设计
5. **功能保留** - 保留所有现有业务功能

---

## 三、前端框架选型

### 3.1 推荐方案：Next.js (App Router)

#### 理由

| 因素 | 评估 |
|------|------|
| Vercel 原生支持 | ⭐⭐⭐⭐⭐ 最佳集成，开箱即用 |
| SSR/SSG | ⭐⭐⭐⭐⭐ 支持服务器端渲染和静态生成 |
| SEO | ⭐⭐⭐⭐⭐ 对公开页面友好 |
| API Routes | ⭐⭐⭐⭐⭐ 内置 API 功能，可替代部分后端 |
| 生态 | ⭐⭐⭐⭐⭐ 庞大的社区和库支持 |
| TypeScript | ⭐⭐⭐⭐⭐ 原生支持 |
| Vercel 免费额度 | ⭐⭐⭐⭐⭐ 个人项目基本免费 |

#### 备选方案

| 框架 | 优点 | 缺点 |
|------|------|------|
| **Nuxt (Vue)** | 延续 Vue 技术栈 | Vercel 支持不如 Next.js |
| **Astro** | 性能极佳 | 动态应用支持一般 |
| **Remix** | 现代全栈框架 | 生态较小 |

### 3.2 Next.js 项目结构

```
frontend-next/
├── app/                    # App Router
│   ├── (auth)/            # 认证路由组
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/       # 仪表板路由组
│   │   ├── operations/
│   │   ├── reports/
│   │   ├── tools/
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── api/               # API 代理（可选）
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件（使用 shadcn/ui）
│   ├── forms/           # 表单组件
│   ├── charts/          # 图表组件
│   └── layouts/         # 布局组件
├── lib/                  # 工具函数
│   ├── api.ts           # API 客户端
│   ├── auth.ts          # 认证逻辑
│   └── utils.ts         # 通用工具
├── stores/               # 状态管理（Zustand）
├── types/                # TypeScript 类型
├── public/               # 静态资源
├── .env.local            # 环境变量
├── next.config.js        # Next.js 配置
└── package.json
```

### 3.3 UI 组件库推荐

#### shadcn/ui + Tailwind CSS（推荐）

- **优点**：高度可定制、代码开源、现代化设计、TypeScript 原生
- **风格**：简洁专业，与 Vercel 生态完美契合
- **组件**：Button, Input, Card, Modal, Table, Form 等 50+ 组件

#### 替代方案

| 组件库 | 特点 |
|--------|------|
| Radix UI + Tailwind | 无样式组件库，可完全自定义 |
| Mantine | 功能丰富，内置 hooks |
| DaisyUI | 轻量级，主题丰富 |

---

## 四、后端重构方案

### 4.1 推荐：FastAPI

#### 理由

| 因素 | 评估 |
|------|------|
| 性能 | ⭐⭐⭐⭐⭐ 异步高性能 |
| Python 原生 | ⭐⭐⭐⭐⭐ 易于与现有代码整合 |
| 自动文档 | ⭐⭐⭐⭐⭐ Swagger UI 自动生成 |
| 类型支持 | ⭐⭐⭐⭐⭐ Pydantic 原生支持 |
| 与前端对接 | ⭐⭐⭐⭐⭐ 轻松构建 REST API |

#### 架构设计

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI 应用入口
│   ├── config.py         # 配置管理
│   └── constants.py     # 常量
├── api/                  # API 路由
│   ├── v1/
│   │   ├── auth.py      # 认证 API
│   │   ├── users.py     # 用户管理
│   │   ├── shops.py     # 商店管理
│   │   ├── reports.py   # 报表 API
│   │   ├── tools.py     # 工具 API
│   │   └── admin.py     # 管理 API
│   └── dependencies.py  # 依赖注入
├── core/                 # 核心功能
│   ├── security.py      # 安全（JWT、密码哈希）
│   ├── database.py      # 数据库连接
│   └── exceptions.py    # 自定义异常
├── models/              # SQLAlchemy 模型
│   ├── user.py
│   ├── shop.py
│   └── log.py
├── schemas/             # Pydantic 模型
│   ├── user.py
│   ├── auth.py
│   └── ...
├── services/           # 业务逻辑（可复用原模块）
│   ├── auth_service.py
│   ├── report_service.py
│   └── ...
└── main.py             # 入口文件
```

### 4.2 数据库

- **SQLite** - 保留（轻量、简单、无需配置）
- **可选升级** - PostgreSQL（如果需要生产级部署）

### 4.3 认证方案

| 方案 | 描述 |
|------|------|
| JWT | 无状态认证，适合 API |
| HttpOnly Cookie | 兼容现有 session 模式 |
| 建议 | **JWT** - 前后端分离更自然 |

---

## 五、部署方案

### 5.1 Vercel 部署前端

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 部署
cd frontend-next
vercel

# 或通过 GitHub 集成
# Push 到 GitHub → Vercel 自动部署
```

#### vercel.json 配置

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.com/:path*"
    }
  ]
}
```

### 5.2 后端部署选项

#### 选项 A：Vercel Serverless Functions

- 适合轻量 API
- 免费额度：100GB-hours/月

#### 选项 B：Railway / Render / Fly.io

- 专用 Python 服务
- 价格适中

#### 选项 C：本地/私有服务器

- 保持现有模式
- 需要公网暴露

#### 建议：初期使用 **Railway** 或 **Render** 部署 FastAPI

### 5.3 环境变量

```bash
# 前端 (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=BelieveBoy

# 后端
DATABASE_URL=sqlite:///./believeboy.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

---

## 六、重构步骤规划

### 阶段一：准备工作（1-2天）

- [ ] 创建新分支 `refactor/backend-api`
- [ ] 创建新分支 `refactor/frontend-nextjs`
- [ ] 分析并记录所有现有 API 端点
- [ ] 设计新的 API 接口规范（OpenAPI）

### 阶段二：后端重构（3-5天）

- [ ] 搭建 FastAPI 项目骨架
- [ ] 实现用户认证（JWT）
- [ ] 迁移数据库模型
- [ ] 迁移现有 API 端点
  - [ ] 认证 API（登录、登出）
  - [ ] 用户管理 API
  - [ ] 商店管理 API
  - [ ] 报表处理 API
  - [ ] 工具 API
  - [ ] 管理 API
- [ ] 保留原有业务逻辑（modules/）

### 阶段三：前端重构（5-7天）

- [ ] 搭建 Next.js 项目
- [ ] 配置 Tailwind CSS + shadcn/ui
- [ ] 实现认证页面（登录、注册）
- [ ] 实现仪表板布局
- [ ] 迁移现有页面
  - [ ] 首页/运营概览
  - [ ] 日报/月报
  - [ ] 产品分析
  - [ ] 工具集
  - [ ] 管理面板
- [ ] 集成 API 客户端

### 阶段四：测试与部署（2-3天）

- [ ] 前后端联调
- [ ] 功能测试
- [ ] 部署到 Vercel
- [ ] 部署后端（Railway/Render）
- [ ] 监控和修复问题

### 阶段五：清理（1天）

- [ ] 删除旧 Flask 代码
- [ ] 归档旧前端代码
- [ ] 更新文档

---

## 七、原有代码处理

### 7.1 需要保留（移动到 backend/）

```
backend/
├── services/           # 业务逻辑服务
│   ├── auth_service.py
│   ├── log_service.py
│   └── statistics_service.py
├── models/             # 数据模型（改为 SQLAlchemy）
│   ├── user_model.py
│   └── shop_model.py
└── modules/            # 业务处理模块（待迁移）
    ├── dataset/
    └── toolset/
```

### 7.2 需要删除

- `app.py` - Flask 应用入口
- `routes/` - 旧路由蓝图（功能迁移到 api/）
- `backend/auth.py` - 旧认证逻辑（迁移到 core/security.py）
- `backend/manage_users.py` - 用户管理工具
- `frontend/` - 旧 Vue3 前端（迁移到 frontend-next/）

### 7.3 需要归档

```
archive/
├── old_flask_backend/  # 旧的 Flask 后端
│   ├── app.py
│   ├── routes/
│   └── backend/
└── old_vue_frontend/   # 旧的 Vue 前端
    └── frontend/
```

---

## 八、风险与注意事项

### 8.1 技术风险

| 风险 | 缓解措施 |
|------|----------|
| 业务逻辑丢失 | 仔细迁移 modules/ 中的所有功能 |
| API 兼容性问题 | 保留原有 API 路径或做好重定向 |
| 数据库迁移 | 先保留 SQLite，逐步迁移 |

### 8.2 功能风险

| 风险 | 缓解措施 |
|------|----------|
| 文件上传/处理 | 考虑使用对象存储（AWS S3 等）或保留本地处理 |
| 大文件处理 | Serverless 有超时限制，考虑独立服务 |
| 报表生成 | 原有逻辑可能较重，需要测试性能 |

### 8.3 部署风险

| 风险 | 缓解措施 |
|------|----------|
| CORS 问题 | 正确配置跨域资源共享 |
| 环境变量 | 使用 Vercel 和后端平台的环境变量 |
| 免费额度 | 监控使用量，避免超额 |

---

## 九、推荐技术栈总结

| 层级 | 推荐技术 |
|------|----------|
| 前端框架 | **Next.js 14+ (App Router)** |
| UI 组件 | **shadcn/ui + Tailwind CSS** |
| 状态管理 | **Zustand** 或 **React Query** |
| 后端框架 | **FastAPI** |
| 数据库 | **SQLite** (保留) |
| 认证 | **JWT** |
| 部署前端 | **Vercel** |
| 部署后端 | **Railway** 或 **Render** |

---

## 十、接下来行动

1. **确认方案** - 是否同意以上技术选型？
2. **创建分支** - 开始后端还是前端？
3. **优先功能** - 哪些功能需要优先保留？

---

*文档创建日期：2026-02-21*
*最后更新：2026-02-21*
