# Qwen Code 项目上下文

## 项目概述

这是一个基于 Flask 的 Web 应用程序，名为"业务工具平台"，为业务运营和数据分析提供各种实用工具，特别专注于亚马逊业务运营。

### 主要技术
- 后端：Flask (Python)
- 前端：HTML, CSS, JavaScript
- 数据处理：pandas, PyPDF2, openpyxl, numpy, xlsxwriter
- 部署：独立 Flask 服务器

### 架构
应用程序采用模块化结构，包含：
- `app.py` 作为主入口点
- `routes/` 目录包含按蓝图组织的 URL 路由逻辑
- `apps/` 目录包含业务逻辑实现
- `templates/` 目录包含 HTML 模板
- `statics/` 目录包含 CSS、JavaScript 和图像
- `apps/model_file/` 目录包含 Excel 和 PDF 模板

## 已实现的功能

### 认证系统
- 添加了基于 Flask Session 的用户认证系统
- 实现了登录/注销功能
- 所有页面现在都需要用户登录后才能访问
- 默认用户：admin/admin123, user/user123

### 工具集模块 (`/toolset`)
1. **MIC PDF 处理** (`/toolset/mic-pdf`)
   - 为产品 PDF 添加"Made In China"标签
   - 支持批量处理 PDF 文件
   - 将模板 PDF 与上传的 PDF 合并，并创建 zip 文件供下载

### 数据集模块 (`/dataset`)
1. **日报生成器** (`/dataset/daily-report`)
   - 通过处理亚马逊销售、广告和 FBA 库存数据生成日常业务报告
   - 接受 TXT 和 XLSX 文件作为输入
   - 使用模板生成格式化的 Excel 报告
   - 使用 pandas 处理数据，使用 openpyxl 输出带样式的 Excel 文件

2. **月报生成器** (`/dataset/monthly-report`)
   - 生成月度财务分析报告
   - 实现在 `apps/monthly_report.py` 中

3. **产品分析** (`/dataset/product-analysis`)
   - 详细的产品数据分析
   - 计算转化率、成本、利润等指标
   - 实现在 `apps/product_analysis.py` 中
   - **新增功能**：支持拖拽文件上传和自动文件类型识别
   - 用户现在可以将多个文件拖拽到上传区域，系统会自动识别业务报告、付款报告和广告报表

4. **项目分析** (`/dataset/project-analysis`)
   - 项目进度跟踪和分析
   - 仅有模板实现（暂无后端逻辑）

## 已计划但未实现的功能

UI 中规划了几个工具，但没有后端实现：
- 汇率转换器
- 亚马逊前台采集
- 图片尺寸调整工具
- FBA PDF 修订工具
- 项目核算
- 店铺数据库
- 库存管理
- SKU 成本表
- 项目进度跟踪
- 利润计算

## 开发和部署

### 依赖项
- flask
- pypdf2
- pandas
- openpyxl
- numpy
- xlsxwriter

### 运行应用程序
1. 安装依赖：`pip install -r requirements.txt`
2. 运行应用程序：`python app.py`
3. 访问地址：http://localhost:8800
4. 使用默认账户登录：admin/admin123 或 user/user123

### 配置
- 主配置在 `config.py` 中
- 应用程序运行在主机 '0.0.0.0'，端口 8800，启用调试模式
- PDF 处理和项目数据目录的路径配置
- 添加了 SECRET_KEY 配置用于会话安全

### 关键目录
- `pdf/` - 用于 PDF 上传和输出文件
- `project/` - 用于项目数据存储
- `apps/model_file/` - 包含 Excel 和 PDF 模板

## 代码结构
```
believeboyToolset/
├── app.py              # 应用程序入口点
├── config.py           # 配置设置
├── auth.py             # 认证模块
├── requirements.txt    # 项目依赖
├── routes/             # URL 路由（蓝图）
│   ├── __init__.py     # 主蓝图和应用初始化
│   ├── dataset.py      # 数据集路由
│   ├── help.py         # 帮助路由
│   └── toolset.py      # 工具集路由
├── apps/               # 业务逻辑实现
│   ├── daily_report.py
│   ├── mic_pdf.py
│   ├── monthly_report.py
│   ├── product_analysis.py
│   └── model_file/     # 模板和模型文件
├── templates/          # HTML 模板
│   ├── index.html      # 主页
│   ├── login.html      # 登录页面
│   ├── dataset/        # 数据集页面模板
│   ├── help/           # 帮助页面模板
│   └── toolset/        # 工具集页面模板
└── statics/            # 静态资源（CSS、JS、图像）
```

## 最近的更新活动

### 产品分析功能增强
- 实现了拖拽文件上传功能，用户可以将文件拖拽到指定区域进行上传
- 添加了自动文件类型识别功能，系统能够根据文件名自动识别业务报告、付款报告和广告报表
- 改进了用户界面，提供更好的用户体验

### 产品数据库更新
- 更新了 `apps/model_file/BLF_Basic_Info.csv` 文件，新增了82个产品条目

### 路由系统修复
- 修复了路由冲突问题，确保产品分析功能的GET和POST请求能够正确处理
- 优化了蓝图注册方式，消除了端点名称冲突

## 最近的清理活动
- 从 `pdf/output` 和 `pdf/upload` 目录中删除了生成的 PDF 文件
- 删除了 `__pycache__` 目录
- 删除了未使用的周报路由（不存在模板）
- 从 config.py 中删除了未使用的 TEMPLATE_CONFIG
- 将空间使用量从 12MB 减少到最小占用
- 添加了用户认证系统，增强了应用安全性