# 通用拖拽上传组件使用指南

## 概述

我已经为您创建了一个通用的文件上传组件，可以在产品标签处理、外箱标签处理、调研分析等多个页面中重复使用。

## 文件结构

```
static/js/components/file-upload.js    # 通用上传组件 JavaScript
static/css/components.css             # 组件样式文件
templates/tools/product-label.html    # 更新后的产品标签页面
templates/tools/package-label.html    # 更新后的外箱标签页面  
templates/tools/research_analysis.html # 更新后的调研分析页面
```

## 组件特性

### ✅ 已实现的功能

1. **拖拽上传**: 支持鼠标拖拽文件到指定区域
2. **点击选择**: 点击上传区域选择文件
3. **文件验证**: 
   - 文件类型检查（通过 `accept` 参数配置）
   - 文件大小限制（通过 `maxSize` 参数配置）
4. **多文件支持**: 可配置是否允许多文件选择
5. **进度显示**: 上传进度条动画
6. **文件列表**: 显示已选择的文件，支持移除操作
7. **错误处理**: 友好的错误提示和异常处理
8. **响应式设计**: 支持移动端和桌面端
9. **可配置选项**: 高度可定制的配置项

### 🎨 设计特点

- **现代UI**: 采用渐变色和毛玻璃效果
- **统一风格**: 与现有系统保持一致的视觉风格
- **动画效果**: 流畅的交互动画和状态反馈
- **易用性**: 直观的上传流程和清晰的状态指示

## 使用方法

### 1. 在HTML中引入组件

确保在页面底部引入组件文件：

```html
<!-- JavaScript组件 -->
<script src="{{ url_for('static', filename='js/components/file-upload.js') }}" defer></script>

<!-- CSS样式 -->
<link rel="stylesheet" href="{{ url_for('static', filename='css/components.css') }}">
```

### 2. 创建上传容器

在页面中添加一个容器div：

```html
<div id="my-upload-container"></div>
```

### 3. 初始化组件

在JavaScript中初始化组件：

```javascript
// 等待组件加载完成
function initUpload() {
    const uploadComponent = initFileUpload('my-upload-container', {
        // 基础配置
        accept: '.pdf,.xlsx,.xls',           // 接受的文件类型
        maxSize: 10,                         // 最大文件大小(MB)
        multiple: false,                     // 是否允许多文件
        title: '文件上传',                   // 标题
        description: '拖拽文件到这里或点击选择', // 描述
        icon: 'fas fa-cloud-upload-alt',     // 图标
        buttonText: '选择文件',              // 按钮文字
        
        // 回调函数
        onFileSelect: function(files) {
            console.log('选中的文件:', files);
            // 文件选择后的处理逻辑
        },
        
        onUpload: function(files) {
            // 返回Promise，处理文件上传逻辑
            return new Promise((resolve, reject) => {
                // 上传逻辑
                resolve({success: true});
            });
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initUpload);
```

## 配置选项详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accept` | string | '.pdf,.xlsx,.xls' | 接受的文件类型 |
| `maxSize` | number | 10 | 最大文件大小(MB) |
| `multiple` | boolean | false | 是否允许多文件选择 |
| `title` | string | '文件上传' | 组件标题 |
| `description` | string | '拖拽文件到这里或点击选择' | 描述文字 |
| `icon` | string | 'fas fa-cloud-upload-alt' | FontAwesome图标 |
| `buttonText` | string | '选择文件' | 按钮文字 |
| `uploadUrl` | string | '' | 上传接口地址(可选) |
| `onFileSelect` | function | null | 文件选择回调 |
| `onUpload` | function | null | 上传回调 |

## 页面更新情况

### ✅ 已更新的页面

1. **产品标签处理** (`templates/tools/product-label.html`)
   - 使用通用上传组件处理PDF文件
   - 保留了文字替换功能
   - 左右布局，简化了页面结构

2. **外箱标签处理** (`templates/tools/package-label.html`)
   - 使用通用上传组件处理PDF文件
   - 添加了发货人信息替换功能
   - 可选择添加"Made In China"

3. **调研分析** (`templates/tools/research_analysis.html`)
   - 使用通用上传组件处理Excel文件
   - 保留了分析类型和输出格式选择
   - 添加了分析备注功能

## API 方法

组件提供了以下公共方法：

```javascript
// 获取当前选中的文件
const files = uploadComponent.getSelectedFiles();

// 设置文件选择回调
uploadComponent.setOnFileSelect(function(files) {
    // 处理文件选择
});

// 设置上传回调
uploadComponent.setOnUpload(function(files) {
    // 处理文件上传
    return Promise.resolve();
});

// 清除所有文件
uploadComponent.clearFiles();

// 手动触发上传
uploadComponent.uploadFiles();
```

## 错误修复

同时修复了原系统中的一个bug：
- **修复了 `product_label()` 视图函数缺少 return 语句的问题**
- 现在产品标签页面可以正常访问，不会再出现 TypeError

## 下一步计划

1. **性能优化**: 可以考虑添加文件预览功能
2. **批量操作**: 支持批量上传和删除文件
3. **云存储集成**: 可以扩展支持云存储服务
4. **文件类型图标**: 根据文件类型显示不同图标
5. **断点续传**: 对于大文件支持断点续传功能

## 注意事项

- 组件依赖于 FontAwesome 图标库
- 建议在页面加载完成后初始化组件
- 可以通过CSS变量自定义主题颜色
- 支持现代浏览器，IE需要polyfill

---

这个通用组件大大简化了文件上传功能的开发，提高了代码复用性，并为未来的功能扩展奠定了良好的基础。