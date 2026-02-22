// 用户类型
export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  chinese_name?: string
  created_at?: string
}

// 认证响应
export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  message?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// 商店类型
export interface Shop {
  id: number
  name: string
  created_at: string
}

// 日志类型
export interface Log {
  id: number
  action: string
  details?: string
  level: 'info' | 'warning' | 'error'
  log_type: string
  created_at: string
}

// 导航项类型
export interface NavigationItem {
  id: string
  label: string
  icon?: string
  category?: string
  adminOnly?: boolean
  children?: NavigationItem[]
}

export interface NavigationCategory {
  id: string
  label: string
  icon: string
  category: string
  children: NavigationItem[]
}

// 统计数据
export interface Statistics {
  report_statistics: {
    daily_reports: number
    monthly_reports: number
    product_analysis: number
  }
  system_status: {
    total_users: number
    total_shops: number
    total_logs: number
  }
}
