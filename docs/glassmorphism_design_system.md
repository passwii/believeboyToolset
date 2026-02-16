# 玻璃态设计系统（Glassmorphism Design System）

**项目**: 彼励扶工具集前端重构
**文档创建日期**: 2026-02-16
**版本**: v1.0

---

## 一、设计理念

### 1.1 玻璃态风格定义

玻璃态（Glassmorphism）是一种模仿毛玻璃效果的设计风格，具有以下特征：
- **半透明背景**: 背景具有低透明度
- **模糊效果**: 使用 `backdrop-filter: blur()` 模糊背景
- **微妙边框**: 1px 宽的半透明边框
- **柔和阴影**: 多层阴影营造层次感
- **高对比度内容**: 确保文字和图标清晰可读

### 1.2 设计原则

- **层次清晰**: 通过透明度和模糊程度区分层次
- **对比保证**: 确保文字对比度达到 WCAG AA 标准（4.5:1）
- **动效适度**: 减少过度动画，保留必要交互反馈
- **响应式优先**: 移动端性能优化，避免过度模糊

---

## 二、配色方案

### 2.1 主色调（Primary Colors）

```css
/* 主蓝色 - 主要操作按钮、链接 */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;    /* 主色 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### 2.2 辅助色调（Accent Colors）

```css
/* 紫色 - 渐变点缀 */
--accent-purple-400: #c084fc;
--accent-purple-500: #a855f7;
--accent-purple-600: #9333ea;

/* 绿色 - 成功状态 */
--success-green-400: #4ade80;
--success-green-500: #22c55e;
--success-green-600: #16a34a;

/* 红色 - 错误、警告 */
--error-red-400: #f87171;
--error-red-500: #ef4444;
--error-red-600: #dc2626;

/* 警告 - 黄色 */
--warning-yellow-400: #fbbf24;
--warning-yellow-500: #f59e0b;
--warning-yellow-600: #d97706;
```

### 2.3 玻璃态背景色（Glass Backgrounds）

```css
/* 深色背景 - 更好的对比度 */
--glass-dark-50: rgba(15, 23, 42, 0.40);
--glass-dark-100: rgba(15, 23, 42, 0.60);
--glass-dark-150: rgba(15, 23, 42, 0.80);

/* 浅色背景 - 可选的浅色主题 */
--glass-light-50: rgba(255, 255, 255, 0.40);
--glass-light-100: rgba(255, 255, 255, 0.60);
--glass-light-150: rgba(255, 255, 255, 0.80);
```

### 2.4 背景渐变（Background Gradients）

```css
/* 页面背景 - 柔和渐变 */
--bg-gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--bg-gradient-2: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
--bg-gradient-3: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* 深色渐变 - 默认背景 */
--bg-dark-gradient-1: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e293b 100%);
--bg-dark-gradient-2: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);

/* 元素渐变 - 按钮等 */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
--gradient-success: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
--gradient-error: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

---

## 三、Typography（字体）

### 3.1 字体家族

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
               'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
--font-mono: 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono',
               'Courier New', monospace;
```

### 3.2 字体大小

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 3.3 字重

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 3.4 行高

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

---

## 四、间距（Spacing）

### 4.1 基础间距单位（4px 基准）

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

### 4.2 常用间距

```css
--gap-sm: var(--space-2);    /* 8px */
--gap-md: var(--space-4);    /* 16px */
--gap-lg: var(--space-6);    /* 24px */
--gap-xl: var(--space-8);    /* 32px */

--padding-sm: var(--space-2);   /* 8px */
--padding-md: var(--space-4);   /* 16px */
--padding-lg: var(--space-6);   /* 24px */
--padding-xl: var(--space-8);   /* 32px */

--margin-sm: var(--space-2);   /* 8px */
--margin-md: var(--space-4);   /* 16px */
--margin-lg: var(--space-6);   /* 24px */
```

---

## 五、阴影（Shadows）

### 5.1 默认阴影

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 5.2 玻璃态阴影

```css
/* 多层阴影营造层次感 */
--glass-shadow-sm:
  0 2px 4px 0 rgba(0, 0, 0, 0.1),
  0 4px 8px 0 rgba(0, 0, 0, 0.05);

--glass-shadow-md:
  0 4px 8px 0 rgba(0, 0, 0, 0.12),
  0 8px 16px 0 rgba(0, 0, 0, 0.08);

--glass-shadow-lg:
  0 8px 16px 0 rgba(0, 0, 0, 0.15),
  0 16px 32px 0 rgba(0, 0, 0, 0.1);

--glass-shadow-xl:
  0 16px 32px 0 rgba(0, 0, 0, 0.18),
  0 32px 64px 0 rgba(0, 0, 0, 0.12);
```

### 5.3 内阴影（Inset Shadow）

```css
--inset-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.08);
```

---

## 六、圆角（Border Radius）

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.25rem;   /* 20px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* 完全圆角 */
```

---

## 七、玻璃态组件样式

### 7.1 玻璃态卡片（Glass Card）

```css
.glass-card {
  background: var(--glass-dark-50);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.125);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow-lg);
  color: rgba(255, 255, 255, 0.95);
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: var(--glass-shadow-xl);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
```

### 7.2 玻璃态按钮（Glass Button）

```css
.glass-btn {
  background: var(--glass-dark-100);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  color: rgba(255, 255, 255, 0.95);
  font-weight: var(--font-medium);
  transition: all 0.3s ease;
  cursor: pointer;
}

.glass-btn:hover {
  background: var(--primary-500);
  border-color: var(--primary-400);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.glass-btn:active {
  transform: translateY(0);
}
```

### 7.3 玻璃态输入框（Glass Input）

```css
.glass-input {
  background: var(--glass-dark-50);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  color: rgba(255, 255, 255, 0.95);
  font-size: var(--text-sm);
  transition: all 0.3s ease;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.glass-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background: var(--glass-dark-100);
}
```

### 7.4 玻璃态侧边栏（Glass Sidebar）

```css
.glass-sidebar {
  background: var(--glass-dark-100);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--glass-shadow-lg);
}

.glass-nav-item {
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.glass-nav-item:hover {
  background: var(--glass-dark-150);
  color: rgba(255, 255, 255, 0.95);
}

.glass-nav-item.active {
  background: var(--primary-500);
  color: white;
}
```

### 7.5 玻璃态模态框（Glass Modal）

```css
.glass-modal-backdrop {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.glass-modal {
  background: var(--glass-dark-150);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}

.glass-modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-6);
}

.glass-modal-body {
  padding: var(--space-6);
}

.glass-modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-6);
}
```

---

## 八、动画（Animations）

### 8.1 缓动函数（Easing）

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### 8.2 动画时长

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### 8.3 常用动画

```css
/* 淡入淡出 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 上升 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下降 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 九、可访问性（Accessibility）

### 9.1 最小对比度标准

| 元素 | 背景色 | 文本色 | 对比度 | 符合标准 |
|------|--------|--------|--------|----------|
| 主文字 | 透明或深色 | 白色 (#FFFFFF) | 高于 7:1 | ✅ AAA |
| 次要文字 | 透明或深色 | 浅白 (#F3F4F6) | 高于 4.5:1 | ✅ AA |
| 可交互元素 | 透明或深色 | 主蓝色 (#3B82F6) | 高于 4.5:1 | ✅ AA |

### 9.2 可访问性最佳实践

1. **键盘导航**: 所有可交互元素支持键盘操作
2. **ARIA 标签**: 为屏幕阅读器提供语义化标签
3. **焦点状态**: 清晰的焦点指示器
4. **动画减动**: 提供 `prefers-reduced-motion` 媒体查询支持
5. **错误提示**: 明确的错误信息和修正建议

---

## 十、Tailwind CSS 配置示例

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          dark: {
            50: 'rgba(15, 23, 42, 0.40)',
            100: 'rgba(15, 23, 42, 0.60)',
            150: 'rgba(15, 23, 42, 0.80)',
          },
          light: {
            50: 'rgba(255, 255, 255, 0.40)',
            100: 'rgba(255, 255, 255, 0.60)',
            150: 'rgba(255, 255, 255, 0.80)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: {
          sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 8px 16px 0 rgba(0, 0, 0, 0.08)',
          lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15), 0 16px 32px 0 rgba(0, 0, 0, 0.1)',
          xl: '0 16px 32px 0 rgba(0, 0, 0, 0.18), 0 32px 64px 0 rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  plugins: [],
}
```

---

## 十一、Vue 组件示例

### 11.1 GlassCard.vue

```vue
<template>
  <div
    :class="[
      'glass-card',
      {
        'card-hover': hoverable,
        [size]: size,
      },
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
  size: 'md',
})
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.125);
  border-radius: 1rem;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.15),
              0 16px 32px 0 rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card.card-hover:hover {
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 16px 32px 0 rgba(0, 0, 0, 0.18),
              0 32px 64px 0 rgba(0, 0, 0, 0.12);
}

.glass-card.sm {
  padding: 1rem;
  border-radius: 0.75rem;
}

.glass-card.md {
  padding: 1.5rem;
  border-radius: 1rem;
}

.glass-card.lg {
  padding: 2rem;
  border-radius: 1.25rem;
}

.glass-card.xl {
  padding: 2.5rem;
  border-radius: 1.5rem;
}
</style>
```

---

**文档维护者**: Frontend Team
**最后更新**: 2026-02-16
