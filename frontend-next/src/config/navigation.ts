import type { NavigationCategory } from '@/types'

export const NAVIGATION_ITEMS: NavigationCategory[] = [
  {
    id: 'operations-nav',
    label: '运营导航',
    icon: 'Compass',
    category: 'operations',
    children: [
      { id: 'operations-overview', label: '运营总览', icon: 'LayoutDashboard' },
      { id: 'operations-nav', label: '站点导航', icon: 'Globe' },
      { id: 'shop-nav', label: '店铺导航', icon: 'Store' },
    ],
  },
  {
    id: 'data-analysis',
    label: '数据分析',
    icon: 'TrendingUp',
    category: 'data',
    children: [
      { id: 'yumai-analysis', label: '商品分析（优麦云）', icon: 'BarChart3' },
      { id: 'daily-report', label: '销售日报', icon: 'CalendarDays' },
      { id: 'monthly-report', label: '财务月报', icon: 'Calendar' },
      { id: 'product-analysis', label: '产品分析', icon: 'Calculator' },
    ],
  },
  {
    id: 'templates',
    label: '模板文件',
    icon: 'FileText',
    category: 'templates',
    children: [
      { id: 'sku-cost-table', label: 'SKU 成本表', icon: 'Table' },
      { id: 'project-progress-table', label: '项目进度表', icon: 'ListTodo' },
      { id: 'profit-calculation-table', label: '利润测算表', icon: 'TrendingUp' },
    ],
  },
  {
    id: 'tools',
    label: '工具',
    icon: 'Wrench',
    category: 'tools',
    children: [
      { id: 'exchange-rate-display', label: '汇率展示', icon: 'ArrowRightLeft' },
      { id: 'amazon-crawler', label: '亚马逊前台采集', icon: 'Spider' },
      { id: 'image-resizer', label: '图片尺寸调整', icon: 'Image' },
      { id: 'research-analysis', label: '调研分析', icon: 'PieChart' },
      { id: 'ai-panel', label: 'AI 面板', icon: 'Rocket' },
      { id: 'excel-formula-remover', label: 'Excel去公式', icon: 'FileSpreadsheet' },
      { id: 'img-believeboy', label: '图片展示', icon: 'Globe' },
    ],
  },
  {
    id: 'admin',
    label: '管理',
    icon: 'Settings',
    category: 'admin',
    children: [
      { id: 'operations-info', label: '运营信息', icon: 'BarChart' },
      { id: 'update-log', label: '更新日志', icon: 'History' },
      { id: 'shop-management', label: '信息维护', icon: 'Store' },
      { id: 'change-password', label: '更改密码', icon: 'Key' },
      { id: 'user-management', label: '用户管理', icon: 'Users', adminOnly: true },
      { id: 'log-management', label: '日志管理', icon: 'FileText', adminOnly: true },
    ],
  },
]
