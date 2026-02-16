import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || '请求失败，请重试'
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

export default apiClient
