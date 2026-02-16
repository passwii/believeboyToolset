export interface User {
  id: number
  username: string
  chineseName?: string
  role: string
}

export interface NavigationItem {
  id: string
  label: string
  icon: string
  category?: string
  children?: NavigationItem[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface FileUploadItem {
  id: string
  name: string
  type: string
  size: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  url?: string
}
