# 彼励扶前端（BelieveBoy Frontend）

基于 **Vue 3** + **Tailwind CSS** + **Glassmorphism** 设计风格的现代化前端项目。

## 技术栈

- **Vue 3.5** - 渐进式 JavaScript 框架
- **Vite 6** - 下一代前端构建工具
- **TypeScript** - 类型安全的 JavaScript 超集
- **Tailwind CSS** - 原子化 CSS 框架
- **Pinia** - Vue 官方推荐的状态管理库
- **Vue Router** - Vue 官方路由
- **Axios** - HTTP 客户端

## 设计风格

采用 **Glassmorphism（玻璃态）** 设计语言，具有以下特征：

- 半透明毛玻璃背景
- 柔和的模糊效果
- 微妙的高亮边框
- 多层次阴影
- 配色方案：深色背景 + 霓虹蓝紫渐变

## 项目结构

```
frontend/
├── public/                  # 静态资源
│   └── favicon.ico
├── src/
│   ├── assets/              # 资源文件
│   │   ├── images/
│   │   └── styles/
│   ├── components/          # Vue 组件
│   │   ├── common/          # 通用组件
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Card.vue
│   │   │   └── Modal.vue
│   │   └── layout/          # 布局组件
│   │       ├── Header.vue
│   │       ├── Sidebar.vue
│   │       └── MainContent.vue
│   ├── composables/         # Composition API 逻辑复用
│   ├── lib/                 # 工具函数
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── router/              # Vue Router 配置
│   │   └── index.ts
│   ├── stores/              # Pinia 状态管理
│   │   ├── auth.ts
│   │   ├── navigation.ts
│   │   └── page.ts
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── views/               # 页面视图
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖
```

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

构建输出目录：`../static/dist`（项目根目录的 static/dist）

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 核心功能

### 认证系统
- 用户登录/登出
- 权限控制（admin/user）
- 路由守卫

### 导航系统
- 可折叠的侧边栏
- 动态路由加载
- 当前页面高亮

### 通用组件
- GlassCard - 玻璃态卡片
- GlassButton - 玻璃态按钮
- GlassInput - 玻璃态输入框
- GlassModal - 玻璃态模态框

## 设计系统

### 颜色配置

参见 `tailwind.config.js` 和玻璃态设计系统文档。

### 组件样式

所有组件使用 Tailwind CSS 的工具类，配合自定义的玻璃态样式：

- `glass-card` - 卡片组件
- `glass-btn` - 按钮组件
- `glass-input` - 输入框组件
- `glass-sidebar` - 侧边栏
- `glass-modal` - 模态框

## API 集成

API 客户端配置在 `src/lib/api.ts`，基于 Axios：

```typescript
import api from '@/lib/api'

api.get('/endpoint')
api.post('/endpoint', { data })
```

开发环境自动代理到后端：`http://localhost:8800`

## 状态管理

使用 Pinia 进行状态管理：

- `authStore` - 用户认证状态
- `navigationStore` - 导航状态
- `pageStore` - 页面加载状态

## 与 Flask 后端集成

1. 开发环境：Vite 代理配置自动将 `/api` 请求转发到 Flask
2. 生产环境：构建后的静态文件部署到 Flask 的 `static/dist` 目录
3. Session 认证：使用浏览器的 Cookie 机制

## 开发注意事项

- 使用 TypeScript 开发，保持类型安全
- 遵循 Vue 3 Composition API 规范
- 组件命名使用 PascalCase
- 使用 ESLint 和 Prettier 保持代码风格一致
- 提交前运行 `npm run lint` 和 `npm run build`

## 部署

1. 构建生产版本：`npm run build`
2. 构建输出目录：`../static/dist`
3. Flask 模板引用：`<script src="{{ url_for('static', filename='dist/assets/index-xxx.js') }}"></script>`

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT
