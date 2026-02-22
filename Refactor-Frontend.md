# 前端页面重构规划

## 一、前端页面分类

根据现有 Vue3 前端的导航结构和页面，前端分为以下几大类：

---

## 二、页面总览

### 2.1 运营导航 (Operations)

| 页面 ID | 页面名称 | 路由 | 功能 | 后端 API | 状态 |
|---------|----------|------|------|----------|------|
| `operations-overview` | 运营总览 | `/operations-overview` | 展示运营概览数据 | `/api/toolset/operations-overview` | 待迁移 |
| `operations-nav` | 站点导航 | `/operations-nav` | 导航到各站点 | `/api/toolset/operations-nav` | 待迁移 |
| `shop-nav` | 店铺导航 | `/shop-nav` | 导航到各店铺 | `/api/toolset/shops/nav` | 待迁移 |

### 2.2 数据分析 (Data Analysis)

| 页面 ID | 页面名称 | 路由 | 功能 | 后端 API | 状态 |
|---------|----------|------|------|----------|------|
| `yumai-analysis` | 商品分析（优麦云） | `/yumai-analysis` | 优麦云数据分析 | `/api/yumai-analysis` | 待迁移 |
| `daily-report` | 销售日报 | `/daily-report` | 日报上传与展示 | `/api/dataset/daily-report` | 待迁移 |
| `monthly-report` | 财务月报 | `/monthly-report` | 月报上传与展示 | `/api/dataset/monthly-report` | 待迁移 |
| `product-analysis` | 产品分析 | `/product-analysis` | 产品多维分析 | `/api/dataset/product-analysis` | 待迁移 |

### 2.3 模板文件 (Templates)

| 页面 ID | 页面名称 | 路由 | 功能 | 后端 API | 状态 |
|---------|----------|------|------|----------|------|
| `sku-cost-table` | SKU 成本表 | `/sku-cost-table` | SKU成本管理表 | `/api/toolset/sku-cost-table` | 待开发 |
| `project-progress-table` | 项目进度表 | `/project-progress-table` | 项目进度跟踪 | `/api/toolset/project-progress-table` | 待开发 |
| `profit-calculation-table` | 利润测算表 | `/profit-calculation-table` | 利润测算工具 | `/api/toolset/profit-calculation-table` | 待开发 |

### 2.4 工具集 (Tools)

| 页面 ID | 页面名称 | 路由 | 功能 | 后端 API | 状态 |
|---------|----------|------|------|----------|------|
| `exchange-rate-display` | 汇率展示 | `/exchange-rate-display` | 实时汇率显示 | `/api/toolset/exchange-rate-display` | 待迁移 |
| `amazon-crawler` | 亚马逊前台采集 | `/amazon-crawler` | 采集亚马逊产品信息 | 待开发 | 待开发 |
| `image-resizer` | 图片尺寸调整 | `/image-resizer` | 图片尺寸处理 | 待开发 | 待开发 |
| `research-analysis` | 调研分析 | `/research-analysis` | 市场调研分析 | `/api/toolset/research-analysis` | 待迁移 |
| `ai-panel` | AI 面板 | `/ai-panel` | AI 辅助功能 | 待开发 | 待开发 |
| `excel-formula-remover` | Excel 去公式 | `/excel-formula-remover` | 清除 Excel 公式 | `/api/toolset/excel-formula-remover` | 待迁移 |
| `img-believeboy` | 图片展示 | `/img-believeboy` | 图片展示与浏览 | `/api/toolset/img-believeboy` | 待迁移 |

### 2.5 管理 (Admin)

| 页面 ID | 页面名称 | 路由 | 功能 | 后端 API | 权限 | 状态 |
|---------|----------|------|------|----------|------|------|
| `operations-info` | 运营信息 | `/operations-info` | 运营数据展示 | `/api/admin/operations-info` | - | 待迁移 |
| `update-log` | 更新日志 | `/update-log` | 版本更新记录 | 待开发 | - | 待开发 |
| `shop-management` | 信息维护 | `/shop-management` | 商店信息管理 | `/api/admin/shops` | - | 待迁移 |
| `change-password` | 更改密码 | `/change-password` | 修改个人密码 | `/api/auth/change-password` | - | 待迁移 |
| `user-management` | 用户管理 | `/user-management` | 用户 CRUD | `/api/admin/users` | Admin | 待迁移 |
| `log-management` | 日志管理 | `/log-management` | 系统日志查看 | `/api/admin/logs` | Admin | 待迁移 |

### 2.6 认证 (Auth)

| 页面 | 路由 | 功能 | 状态 |
|------|------|------|------|
| LoginView | `/login` | 用户登录 | 待优化 |
| HomeView | `/` | 首页/仪表板 | 待优化 |

---

## 三、Next.js 项目结构设计

```
frontend/
├── app/                         # App Router
│   ├── (auth)/                  # 认证路由组
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/             # 仪表板路由组
│   │   ├── layout.tsx          # 共享布局（侧边栏、Header）
│   │   ├── page.tsx           # 首页 /
│   │   ├── operations/        # 运营导航
│   │   │   ├── overview/
│   │   │   │   └── page.tsx
│   │   │   ├── sites/
│   │   │   │   └── page.tsx
│   │   │   └── shops/
│   │   │       └── page.tsx
│   │   ├── analysis/          # 数据分析
│   │   │   ├── daily/
│   │   │   │   └── page.tsx
│   │   │   ├── monthly/
│   │   │   │   └── page.tsx
│   │   │   ├── product/
│   │   │   │   └── page.tsx
│   │   │   └── yumai/
│   │   │       └── page.tsx
│   │   ├── templates/         # 模板文件
│   │   │   ├── sku-cost/
│   │   │   │   └── page.tsx
│   │   │   ├── progress/
│   │   │   │   └── page.tsx
│   │   │   └── profit/
│   │   │       └── page.tsx
│   │   ├── tools/             # 工具集
│   │   │   ├── exchange/
│   │   │   │   └── page.tsx
│   │   │   ├── research/
│   │   │   │   └── page.tsx
│   │   │   ├── excel/
│   │   │   │   └── page.tsx
│   │   │   └── ...
│   │   ├── admin/             # 管理
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── shops/
│   │   │   │   └── page.tsx
│   │   │   ├── logs/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── profile/           # 个人中心
│   │       └── password/
│   │           └── page.tsx
│   ├── api/                   # API 代理（可选）
│   │   └── auth/
│   │       └── [...nextauth].ts
│   ├── layout.tsx             # 根布局
│   ├── globals.css            # 全局样式
│   └── not-found.tsx          # 404 页面
├── components/
│   ├── ui/                   # 基础 UI 组件（shadcn/ui）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── modal.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/               # 布局组件
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── theme-provider.tsx
│   ├── forms/               # 表单组件
│   │   ├── login-form.tsx
│   │   ├── file-upload.tsx
│   │   └── ...
│   ├── data/                # 数据展示组件
│   │   ├── data-table.tsx
│   │   ├── chart.tsx
│   │   └── ...
│   └── common/              # 通用组件
│       ├── loading.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── api.ts               # API 客户端（Axios/Fetch）
│   ├── auth.ts              # 认证工具
│   ├── utils.ts             # 通用工具
│   └── constants.ts         # 常量
├── hooks/                   # React Hooks
│   ├── use-auth.ts
│   ├── use-file-upload.ts
│   └── ...
├── stores/                  # 状态管理（Zustand）
│   ├── auth-store.ts
│   └── ui-store.ts
├── types/                   # TypeScript 类型
│   ├── user.ts
│   ├── shop.ts
│   ├── report.ts
│   └── api.ts
├── public/                  # 静态资源
│   └── images/
├── .env.local               # 环境变量
├── next.config.js           # Next.js 配置
├── tailwind.config.ts       # Tailwind 配置
├── tsconfig.json
└── package.json
```

---

## 四、组件映射

### 4.1 现有 Vue 组件 → Next.js

| Vue 组件 | React 组件 | 说明 |
|----------|------------|------|
| Button.vue | Button.tsx | 按钮 |
| Input.vue | Input.tsx | 输入框 |
| Card.vue | Card.tsx | 卡片 |
| Modal.vue | Dialog.tsx | 模态框 |
| Header.vue | Header.tsx | 顶部导航 |
| Sidebar.vue | Sidebar.tsx | 侧边栏 |

### 4.2 新增 React 组件

| 组件 | 用途 |
|------|------|
| FileUpload | 文件上传（支持拖拽） |
| DataTable | 数据表格（支持分页） |
| DataChart | 图表展示 |
| PageHeader | 页面标题 |
| StatCard | 统计卡片 |
| SearchBar | 搜索栏 |
| FilterBar | 筛选栏 |

---

## 五、页面布局设计

### 5.1 认证页面布局

```
┌─────────────────────────────┐
│         Logo                │
├─────────────────────────────┤
│                             │
│      [登录表单区域]          │
│                             │
│                             │
└─────────────────────────────┘
```

### 5.2 仪表板布局

```
┌─────────────────────────────────────────┐
│  Header (用户信息、主题切换)               │
├────────┬────────────────────────────────┤
│        │                                │
│  Side  │       Main Content              │
│  bar   │       (页面内容区域)             │
│        │                                │
│        │                                │
└────────┴────────────────────────────────┘
```

---

## 六、API 客户端设计

### 6.1 API 实例配置

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 Token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转登录
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 6.2 API 调用示例

```typescript
// 获取用户信息
const { data } = await api.get<User>('/auth/me')

// 登录
const { data } = await api.post<AuthResponse>('/auth/login', {
  username,
  password,
})

// 上传文件
const formData = new FormData()
formData.append('file', file)
const { data } = await api.upload<FileResponse>('/reports/upload', formData)
```

---

## 七、认证流程

### 7.1 NextAuth.js 方案

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const response = await fetch(`${process.env.API_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        return response.json()
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 5 * 60 * 60, // 5小时
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    }
  }
}
```

---

## 八、状态管理

### 8.1 Zustand Store

```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

---

## 九、样式设计

### 9.1 Tailwind + shadcn/ui

- 使用 Tailwind CSS 作为基础样式
- 使用 shadcn/ui 组件库
- 保持现有的 Glassmorphism 设计风格

### 9.2 主题配置

```typescript
// tailwind.config.ts
export default {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.05)',
          100: 'rgba(255, 255, 255, 0.1)',
          // ...
        }
      }
    }
  }
}
```

---

## 十、迁移顺序建议

### 第一批（核心功能）

1. **登录页面** - `/login`
2. **首页** - `/`
3. **运营导航** - 3个页面

### 第二批（业务功能）

4. **数据分析** - 4个页面
5. **工具集** - 7个页面

### 第三批（管理功能）

6. **管理面板** - 6个页面

### 第四批（模板）

7. **模板文件** - 3个页面

---

## 十一、下一步行动

1. 确认页面分类是否完整
2. 确定优先迁移的页面
3. 开始搭建 Next.js 项目

---

*最后更新：2026-02-21*
