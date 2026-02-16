# 项目结构迁移说明

## 当前状态

### 目录结构对比

```
/Users/damon/PycharmProjects/believeboyToolset/
├── frontend/                    # 新：Vue 3 前端项目
│   ├── src/
│   │   ├── components/          # Vue 组件
│   │   ├── views/               # 页面视图（已创建占位）
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── router/              # Vue Router
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── templates/                   # 旧：Jinja2 HTML 模板
│   ├── index.html              # 主页入口
│   ├── login.html              # 登录页
│   ├── admin/                  # 管理页面嵌入模板
│   ├── data-analysis/          # 数据分析页面
│   └── ...
│
├── static/                      # 静态资源
│   ├── css/                    # 旧 CSS 文件
│   ├── js/                     # 旧 JavaScript 文件
│   ├── images/                 # 图片资源
│   └── dist/                   # 新：Vue 构建输出目录
│
├── routes/                      # Flask 路由
│   ├── __init__.py
│   ├── admin.py
│   ├── dataset.py
│   └── ...
│
├── apps/                        # 业务逻辑
│   └── ...
│
├── docs/                        # 文档
│   ├── frontend_design.md      # 重构设计方案
│   ├── glassmorphism_design_system.md  # 设计系统规范
│   ├── frontend_migration_guide.md     # 迁移指南
│   └── project_structure_migration.md  # 本文件
│
└── ...
```

## 迁移目标

### 完全替换策略

根据用户选择，采用**激进方案：完全替换**，具体实施如下：

1. **Vue 3 前端完全替换旧前端**
   - 保留 `templates/` 作为临时备用
   - 所有业务逻辑迁移到 Vue 3 组件
   - 最终删除旧模板

2. **Flask 后端改造**
   - 从渲染模板改为提供 REST API
   - Session 认证机制保持不变
   - 文件上传逻辑适配 Vue 前端

3. **静态资源迁移**
   - `frontend/src/assets/` - 存放 Vue 项目资源
   - `static/dist/` - Vue 构建输出
   - `static/images/` - 共享图片资源（可选保留）

## 目录作用说明

### `/frontend/`

**新 Vue 3 项目目录**

- **用途**: 现代化前端应用
- **技术栈**: Vue 3 + TypeScript + Tailwind CSS + Pinia
- **构建输出**: `../static/dist/`
- **开发服务器**: `http://localhost:3000`

**关键子目录**:
- `src/views/` - 页面组件（已创建 30+ 占位页面）
- `src/components/` - 可复用组件
- `src/stores/` - 状态管理
- `src/router/` - 路由配置

### `/templates/`

**旧 Jinja2 模板目录（临时保留）**

- **用途**: Flask 后端渲染 HTML 模板
- **状态**: 将逐步废弃，最终删除
- **当前页面**:
  - `index.html` - 主页框架（Header + Sidebar + MainContent）
  - `login.html` - 登录页
  - `admin/*` - 管理页面嵌入模板
  - `data-analysis/*` - 数据分析页面

**迁移策略**:
1. 开发阶段：新旧前端并行，用于对比验证
2. 测试阶段：功能验证通过后，逐步替换路由
3. 上线阶段：完全切换到 Vue 前端，删除旧模板

### `/static/`

**静态资源目录**

**当前结构**:
```
static/
├── css/                    # 旧 CSS 文件（待废弃）
│   ├── core.css
│   ├── components.css
│   └── ...
├── js/                     # 旧 JavaScript 文件（待废弃）
│   ├── core/
│   └── components/
├── images/                 # 图片资源（保留共享）
│   ├── logo-big.webp
│   └── ...
└── dist/                   # Vue 构建输出（新）
    ├── assets/
    │   ├── index-xxx.js
    │   ├── index-xxx.css
    │   └── ...
    └── index.html
```

**资源管理策略**:
1. **CSS/JS**: 旧文件保留到完全迁移后删除
2. **Images**: 可保留在 `static/images/`，Vue 通过 `/static/images/` 路径引用
3. **Dist**: Vue 构建自动输出到 `static/dist/`

### `/routes/`

**Flask 路由/蓝图目录**

**当前结构**:
```
routes/
├── __init__.py             # 主蓝图注册和首页路由
├── admin.py                # 管理相关路由
├── dataset.py              # 数据分析路由
├── help.py                 # 帮助页面路由
└── toolset.py              # 工具集路由
```

**改造方案**:

**当前模式**（渲染模板）:
```python
@main.route('/')
@login_required
def home():
    return render_template('index.html', chinese_name=chinese_name)
```

**目标模式**（提供 API）:
```python
@main.route('/api/user')
@login_required
def get_user():
    return jsonify({
        'success': True,
        'data': {
            'username': session.get('username'),
            'chinese_name': user.chinese_name
        }
    })
```

**过渡策略**:
1. 并行期：保持原有模板路由，新增 `/api/*` 路由
2. 验证期：Vue 前端调用新 API，旧模板备用
3. 切换期：删除旧模板路由，前端完全接管

## 工作流程

### 开发流程

1. **启动 Flask 后端**:
   ```bash
   # 项目根目录
   python app.py
   # 后端运行在 http://localhost:8800
   ```

2. **启动 Vue 前端**:
   ```bash
   cd frontend
   npm install  # 首次运行
   npm run dev
   # 前端运行在 http://localhost:3000
   # API 请求自动代理到 http://localhost:8800
   ```

3. **开发新功能**:
   - 在 `frontend/src/views/` 创建页面组件
   - 在 `frontend/src/components/` 创建可复用组件
   - 在 Flask 路由中添加 API 端点

### 构建部署流程

1. **构建前端**:
   ```bash
   cd frontend
   npm run build
   # 输出到 ../static/dist/
   ```

2. **修改 Flask 模板**:
   编辑 `templates/index.html`，引用构建后的资源：
   ```html
   <!DOCTYPE html>
   <html lang="zh">
   <head>
       <link rel="stylesheet" href="{{ url_for('static', filename='dist/assets/index-xxx.css') }}">
   </head>
   <body>
       <div id="app"></div>
       <script type="module" src="{{ url_for('static', filename='dist/assets/index-xxx.js') }}"></script>
   </body>
   </html>
   ```

3. **部署**:
   - 部署 Flask 应用到服务器
   - 确保 `static/dist/` 目录包含构建文件

## 关键注意事项

### 1. Session 认证

Flask 使用服务器端 Session，Vue 前端需要正确处理：

**正确做法**:
- Axios 配置 `withCredentials: true`（已在 `api.ts` 中配置）
- 浏览器自动处理 Cookie
- 不需要手动管理 token

**在 `frontend/src/lib/api.ts` 中**:
```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,  // 关键：携带 Cookie
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### 2. 文件上传

Vue 前端上传文件到 Flask 后端：

**前端**:
```vue
<template>
  <input type="file" @change="handleFileChange" />
</template>

<script setup>
import api from '@/lib/api'

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  await api.post('/dataset/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
</script>
```

**Flask 后端**: 保持不变，继续接收文件并处理

### 3. 路径引用

**Vue 前端引用静态资源**:

```vue
<!-- 引用 static/images/ 下的图片 -->
<img src="/static/images/logo-big.webp" />

<!-- 引用 public/ 下的资源 -->
<img src="/favicon.ico" />
```

**注意**: Vue 开发服务器自动代理 `/static` 到 Flask 后端。

### 4. 构建输出哈希

生产构建后文件名包含哈希值（如 `index-a1b2c3.js`），需要动态获取：

**解决方案 1**: 使用 manifest 文件
```python
# Flask 读取 manifest.json
import json

with open('static/dist/manifest.json') as f:
    manifest = json.load(f)
    js_file = manifest['index.html']['file']
```

**解决方案 2**: 使用模板变量
```html
<!-- 在 Flask 中扫描 dist 目录获取最新文件 -->
<script src="{{ url_for('static', filename=latest_js_file) }}"></script>
```

**解决方案 3**: 使用固定文件名（推荐用于简单项目）
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
```

## 总结

- ✅ **frontend/** - 新的 Vue 3 项目，包含完整基础架构
- ⚠️ **templates/** - 旧 Jinja2 模板，将逐步废弃
- ⚠️ **static/css/, static/js/** - 旧静态文件，待废弃
- ✅ **static/dist/** - Vue 构建输出
- ✅ **static/images/** - 共享图片资源（可保留）

**下一步**:
1. 实现核心业务页面（更改密码、商店管理、数据分析等）
2. Flask 后端新增 API 路由
3. 测试完整的端到端流程
4. 部署上线并废弃旧模板
