// API 响应基础类型
export interface ApiResponse<T = any> {
  code?: number
  message?: string
  data: T
  timestamp?: number
}

// API 错误响应
export interface ApiError {
  error: string
  code?: string
  details?: any
}

// 登录相关类型
export interface LoginEmailRequest {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    access_token: string
    refresh_token: string
    access_expiry: string
    refresh_expiry: string
    user_id: number
  }
}

// 用户信息相关类型
export interface UserInfo {
  id: number
  display_name: string
  avatar_url?: string
  primary_email: string
  status: UserStatus
  created_at: string
  updated_at: string
  last_login_at?: string
  bio?: string
  locale?: string
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type LoginType = 'email' | 'telegram' | 'google' | 'github'

// 刷新 Token 请求
export interface RefreshTokenRequest {
  refresh_token: string
}

// 登出请求
export interface LogoutRequest {
  token: string
}

// 登出响应
export interface LogoutResponse {
  data: {
    message: string
  }
}

// 注册请求
export interface RegisterEmailRequest {
  email: string
  password: string
  display_name: string
  locale?: string
}

// 注册响应
export interface RegisterEmailResponse {
  data: {
    user_id: number
    email: string
    requires_email_verification: boolean
    verification_token?: string
    verification_expires_at?: string
  }
}

// Profile 相关类型
export interface ProfileData {
  user_id: number
  display_name: string
  avatar_url?: string
  bio?: string
  primary_email: string
  emails: EmailData[]
  status: string
  locale?: string
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface EmailData {
  email: string
  is_primary: boolean
  verified_at?: string
}

export interface ProfileResponse {
  data: ProfileData
}

export interface UpdateProfileRequest {
  display_name?: string
  avatar_url?: string
  bio?: string
  locale?: string
}

// OAuth 相关类型
export interface InitiateOAuthRequest {
  redirect_to?: string
}

export interface InitiateOAuthResponse {
  data: {
    auth_url: string
    state: string
    nonce: string
    expires_at: string
  }
}

// Telegram Auth
export interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface TelegramAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: {
    id: number
    display_name: string
    email?: string
    avatar_url?: string
    status: string
  }
}