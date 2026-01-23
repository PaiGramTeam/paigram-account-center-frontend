import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from './types'
import { useUserStore } from '../stores/user'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    
    // 添加 token 到请求头
    if (userStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 直接返回响应数据
    return response.data as any
  },
  async (error) => {
    const userStore = useUserStore()
    const { response, config } = error

    if (response) {
      const { status, data } = response
      
      // 处理 401 未授权错误
      if (status === 401 && config.url !== '/auth/refresh') {
        // 尝试刷新 token
        if (userStore.refreshToken) {
          try {
            const refreshResponse = await instance.post('/auth/refresh', {
              refresh_token: userStore.refreshToken
            })
            
            // 更新 token
            userStore.setAuthData({
              accessToken: refreshResponse.data.access_token,
              refreshToken: refreshResponse.data.refresh_token
            })
            
            // 重试原请求
            config.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`
            return instance(config)
          } catch (refreshError) {
            // 刷新失败，清除认证信息并跳转到登录页
            userStore.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        } else {
          // 没有 refresh token，直接跳转到登录页
          userStore.logout()
          window.location.href = '/login'
        }
      }
      
      // 处理其他错误
      const errorData = data as ApiError
      const errorMessage = errorData?.error || getDefaultErrorMessage(status)
      
      Message.error(errorMessage)
      return Promise.reject(errorData)
    }
    
    // 网络错误或超时
    Message.error('网络连接异常，请稍后重试')
    return Promise.reject(error)
  }
)

// 获取默认错误消息
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数错误'
    case 403:
      return '没有权限访问'
    case 404:
      return '请求资源不存在'
    case 409:
      return '资源冲突'
    case 500:
      return '服务器错误'
    case 502:
      return '网关错误'
    case 503:
      return '服务暂不可用'
    default:
      return '请求失败'
  }
}

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.put(url, data, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.patch(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.delete(url, config)
  }
}

export default request