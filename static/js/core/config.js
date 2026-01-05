/**
 * 应用配置模块
 * 统一管理路由配置和应用设置
 */

// URL路由映射
const ROUTE_CONFIG = {
  'daily-report': '/dataset/daily-report',
  'monthly-report': '/dataset/monthly-report',
  'product-analysis': '/dataset/product-analysis',
  'yumai-analysis': '/yumai-analysis',
  'operations-overview': '/toolset/operations-overview',
  'operations-nav': '/toolset/operations-nav',
  'shop-nav': '/toolset/shop-nav',
  'operations-info': '/admin/operations-info?embed=true',
  'user-management': '/admin/users?embed=true',
  'log-management': '/admin/logs',
  'update-log': '/admin/update-log?embed=true',
  'shop-management': '/admin/shops?embed=true',
  'change-password': '/admin/change-password?embed=true',
  'sku-cost-table': '/toolset/sku-cost-table?embed=true',
  'project-progress-table': '/toolset/project-progress-table?embed=true',
  'profit-calculation-table': '/toolset/profit-calculation-table?embed=true',
  'exchange-rate-display': '/toolset/exchange-rate-display',
  'amazon-crawler': '/toolset/amazon-crawler?embed=true',
  'image-resizer': '/toolset/image-resizer?embed=true',
  'research-analysis': '/toolset/research-analysis?embed=true',
  'excel-formula-remover': '/toolset/excel-formula-remover',
  'ai-panel': 'https://ai.believeboy.com',
  'img-believeboy': '/toolset/img-believeboy'
};

// 页面初始化器映射
const PAGE_INITIALIZERS = {
  'daily-report': 'initializeDailyReport',
  'monthly-report': 'initializeMonthlyReport',
  'product-analysis': 'initializeProductAnalysis',
  'yumai-analysis': 'initializeYumaiAnalysis',
  'operations-overview': 'initializeOperationsOverview',
  'operations-nav': 'initializeOperationsNav',
  'shop-nav': 'initializeShopNav',
  'operations-info': 'initializeOperationsInfo',
  'user-management': 'initializeUserManagement',
  'log-management': 'initializeLogManagement',
  'update-log': 'initializeUpdateLog',
  'shop-management': 'initializeShopManagement',
  'change-password': 'initializeChangePassword'
};

// 默认页面配置
const DEFAULT_PAGE_CONFIG = {
  defaultSection: '.default-section',
  dynamicSection: '.dynamic-section',
  navItemSelector: '.nav-item',
  groupTitleSelector: '.group-title',
  navLinkSelector: '.nav-link',
  featureItemSelector: '.feature-item'
};

// 响应式断点
const RESPONSIVE_CONFIG = {
  mobileBreakpoint: 768
};

// 加载配置
const LOADING_CONFIG = {
  retryCount: 3,
  retryDelay: 1000,
  contentInitDelay: 100
};

// 暴露到全局作用域
if (typeof window !== 'undefined') {
  window.ROUTE_CONFIG = ROUTE_CONFIG;
  window.PAGE_INITIALIZERS = PAGE_INITIALIZERS;
  window.DEFAULT_PAGE_CONFIG = DEFAULT_PAGE_CONFIG;
  window.RESPONSIVE_CONFIG = RESPONSIVE_CONFIG;
  window.LOADING_CONFIG = LOADING_CONFIG;
}