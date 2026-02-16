# Vue 3 前端迁移指南

本文档说明如何将彼励扶前端从原生 JavaScript + HTML 迁移到 Vue 3 + Glassmorphism 设计风格。

## 迁移进度

### ✅ 已完成阶段

- [x] 阶段 0: 环境搭建
  - Vue 3 + Vite + TypeScript 项目初始化
  - Tailwind CSS 和玻璃态设计系统配置
  - 目录结构创建
  - 基础配置文件（package.json, tsconfig.json, vite.config.ts 等）

- [x] 阶段 1: 设计系统搭建
  - Tailwind CSS 主题配置（玻璃态配色、字体、阴影等）
  - 全局样式定义（glass-card, glass-btn, glass-input 等）
  - 自定义组件类
  - 响应式断点

- [x] 阶段 2: 核心布局组件
  - Header.vue - 顶部导航栏
  - Sidebar.vue - 侧边栏（可折叠导航）
  - MainContent.vue - 主内容区域

- [x] 阶段 3: 通用组件库
  - Button.vue - 按钮（支持 primary/success/error/ghost 变体）
  - Input.vue - 输入框（支持错误状态）
  - Card.vue - 卡片（支持 hoverable 和不同尺寸）
  - Modal.vue - 模态框（带动画效果）

- [x] 阶段 4: 状态管理与路由
  - Pinia stores (auth, navigation, page)
  - Vue Router 配置（动态路由生成）
  - 路由守卫（认证和权限）

### 🔄 进行中阶段

- [ ] 阶段 5: 页面迁移
  - 占位视图已创建，实际业务逻辑待迁移

### 📋 待完成阶段

- [ ] 阶段 6: Flask 集成
- [ ] 阶段 7: 完整页面实现
- [ ] 阶段 8: 测试与优化
- [ ] 阶段 9: 部署上线

---

## 项目结构对比

### 旧结构（原生 JavaScript）

```
static/
├── css/
│   ├── core.css
│   ├── components.css
│   ├── layouts.css
│   ├── themes.css
│   ├── responsive.css
│   └── file-upload.css
├── js/
│   ├── core/
│   │   ├── utils.js
│   │   ├── api.js
│   │   ├── config.js
│   │   ├── navigation.js
│   │   ├── app.js
│   │   └── ...
│   └── components/
│       ├── dashboard.js
│       ├── file-upload.js
│       ├── shop-management.js
│       └── ...
└── images/

templates/
├── index.html
├── login.html
├── admin/
│   ├── change_password_embed.html
│   ├── users_embed.html
│   └── ...
├── data-analysis/
│   ├── daily_report.html
│   ├── monthly_report.html
│   └── ...
└── tools/
    └── ...
```

### 新结构（Vue 3）

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Card.vue
│   │   │   └── Modal.vue
│   │   └── layout/
│   │       ├── Header.vue
│   │       ├── Sidebar.vue
│   │       └── MainContent.vue
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── navigation.ts
│   │   └── page.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── router/
│   │   └── index.ts
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── ChangePasswordView.vue
│   │   └── ... (其他页面)
│   ├── types/
│   │   └── index.ts
│   ├── style.css
│   ├── App.vue
│   └── main.ts
├── index.html
├ vite.config.ts
├ tailwind.config.js
└── package.json
```

---

## 使用指南

### 本地开发

1. **安装依赖**:
```bash
cd frontend
npm install
```

2. **启动开发服务器**:
```bash
npm run dev
```
   访问: http://localhost:3000

3. **构建生产版本**:
```bash
npm run build
```
   输出目录: `../static/dist`

### 与 Flask 集成

#### 开发环境

Vite 配置了代理，`/api` 请求自动转发到 Flask 后端：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true
      }
    }
  }
})
```

#### 生产环境

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 修改 Flask 模板引用构建后的文件：

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>彼励扶运营中心</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='dist/assets/index-xxx.css') }}">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="{{ url_for('static', filename='dist/assets/index-xxx.js') }}"></script>
</body>
</html>
```

3. 构建 CSS 文件名包含哈希值，每次构建后会变化，需要使用脚本自动更新模板。

---

## 设计系统使用

### 玻璃态组件类

#### 卡片
```vue
<div class="glass-card">
  内容
</div>

<!-- 带悬浮效果 -->
<div class="glass-card hoverable">
  内容
</div>

<!-- 不同尺寸 -->
<div class="glass-card size-sm">小卡片</div>
<div class="glass-card size-md">中卡片</div>
<div class="glass-card size-lg">大卡片</div>
<div class="glass-card size-xl">超大卡片</div>
```

#### 按钮
```vue
<button class="glass-btn">默认按钮</button>
<button class="glass-btn primary">主按钮</button>
<button class="glass-btn success">成功按钮</button>
<button class="glass-btn error">错误按钮</button>
<button class="glass-btn ghost">幽灵按钮</button>

<!-- 不同尺寸 -->
<button class="glass-btn size-sm">小按钮</button>
<button class="glass-btn size-lg">大按钮</button>

<!-- 禁用状态 -->
<button class="glass-btn" disabled>禁用按钮</button>
```

#### 输入框
```vue
<input class="glass-input" placeholder="请输入..." />
<input class="glass-input error" placeholder="错误状态" />
<input class="glass-input" disabled placeholder="禁用状态" />
```

#### 模态框
```vue
<Modal :is-open="showModal" title="标题" @close="showModal = false">
  内容
  <template #footer>
    <button @click="showModal = false">关闭</button>
  </template>
</Modal>
```

---

## 迁移现有页面

### 步骤概述

1. **创建 Vue 组件**
2. **从 HTML 提取结构**
3. **转换为 Vue 模板语法**
4. **迁移 JavaScript 逻辑到 Composition API**
5. **使用玻璃态组件替换原生样式**
6. **测试功能完整性**

### 示例：更改密码页面

#### 原版（HTML）
```html
<!-- templates/admin/change_password_embed.html -->
<div class="change-password-embed">
  <div class="embed-header">
    <h2><i class="fas fa-key"></i> 更改密码</h2>
  </div>
  <form method="POST" action="/auth/change-password">
    <div class="form-group">
      <label>当前密码:</label>
      <input type="password" name="current_password" required>
    </div>
    <!-- ... -->
  </form>
</div>
```

#### 新版（Vue）
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

const authStore = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    await api.post('/auth/change-password', {
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })
    alert('密码修改成功')
  } catch (err: any) {
    error.value = err.message || '修改失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="glass-card max-w-md mx-auto p-8">
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-white">
        <i class="fas fa-key mr-2"></i>更改密码
      </h2>
      <p class="mt-2 text-white/70">为了账户安全，请定期更新密码</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="form-group">
        <label class="form-label">当前密码</label>
        <Input
          v-model="currentPassword"
          type="password"
          placeholder="请输入当前密码"
        />
      </div>

      <div class="form-group">
        <label class="form-label">新密码</label>
        <Input
          v-model="newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          :error="error ? ' ' : ''"
        />
        <p class="text-sm text-white/50 mt-1">密码长度至少为6位</p>
      </div>

      <div class="form-group">
        <label class="form-label">确认密码</label>
        <Input
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          :error="error ? ' ' : ''"
        />
      </div>

      <div v-if="error" class="notification error inline-block">
        <i class="fas fa-exclamation-circle mr-2"></i>
        {{ error }}
      </div>

      <Button
        type="submit"
        variant="primary"
        :loading="loading"
        class="w-full"
      >
        <i class="fas fa-save mr-2"></i>
        修改密码
      </Button>
    </form>
  </div>
</template>
```

---

## API 调用

### 使用 Axios 客户端

```typescript
import api from '@/lib/api'

// GET 请求
const data = await api.get('/endpoint')

// POST 请求
const response = await api.post('/endpoint', { key: 'value' })

// 错误处理
try {
  await api.post('/auth/login', { username, password })
} catch (error) {
  console.error('登录失败:', error.message)
}
```

### Flask 后端适配

Flask 路由无需修改，Vite 代理会自动处理 CORS 和请求转发。

---

## 下一步工作

### 高优先级（关键功能）

1. **实现核心页面**
   - [ ] 更改密码页面（ChangePasswordView.vue）
   - [ ] 商店管理页面（ShopManagementView.vue）
   - [ ] 用户管理页面（UserManagementView.vue）
   - [ ] 数据分析页面（DailyReportView, MonthlyReportView, ProductAnalysisView）

2. **Flask 集成**
   - [ ] Session 认证集成
   - [ ] 文件上传功能适配
   - [ ] 自动构建脚本

3. **基础组件增强**
   - [ ]文件上传组件（支持玻璃态设计）
   - [ ] 表格组件
   - [ ] 表单验证组件

### 中优先级（用户体验）

4. **完善导航**
   - [ ] 面包屑导航
   - [ ] 页面过渡动画
   - [ ] 键盘快捷键

5. **通知系统**
   - [ ] 全局 Toast 通知
   - [ ] 错误处理统一

### 低优先级（优化）

6. **性能优化**
   - [ ] 路由懒加载优化
   - [ ] 图片懒加载
   - [ ] 打包优化

7. **可访问性**
   - [ ] ARIA 标签完善
   - [ ] 键盘导航支持
   - [ ] 屏幕阅读器优化

---

## 常见问题

### Q: 如何处理 Session 认证？

A: 开发环境使用 Cookie 自动传递，生产环境 Flask 后端使用 `session` 机制保持认证状态。

### Q: 如何迁移现有的 JavaScript 逻辑？

A: 将纯 JavaScript 逻辑迁移到 Vue 的 Composition API，使用 `ref`、`computed` 等响应式 API。

### Q: 玻璃态效果在旧浏览器中不生效怎么办？

A: `backdrop-filter` 需要现代浏览器支持，可以添加降级样式：

```css
@supports not (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(15, 23, 42, 0.9);
  }
}
```

### Q: 如何调试构建问题？

A: 使用 `npm run build` 查看构建日志，检查是否有类型错误或资源缺失。

---

## 参考资料

- [Vue 3 官方文档](https://vuejs.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vite.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)

---

**文档创建日期**: 2026-02-16
**最后更新**: 2026-02-16
