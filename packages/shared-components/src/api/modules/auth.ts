import request from '../request'
import type {
  LoginEmailRequest,
  LoginResponse,
  RefreshTokenRequest,
  LogoutRequest,
  LogoutResponse,
  RegisterEmailRequest,
  RegisterEmailResponse,
  InitiateOAuthRequest,
  InitiateOAuthResponse,
  TelegramAuthData,
  TelegramAuthResponse
} from '../types'

export const authApi = {
  // 邮箱密码登录
  async login(data: LoginEmailRequest): Promise<LoginResponse> {
    return request.post('/auth/login', data)
  },

  // 刷新 Token
  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    return request.post('/auth/refresh', data)
  },

  // 登出
  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return request.post('/auth/logout', data)
  },

  // 邮箱注册
  async register(data: RegisterEmailRequest): Promise<RegisterEmailResponse> {
    return request.post('/auth/register', data)
  },

  // 邮箱验证
  async verifyEmail(data: { email: string; token: string }): Promise<{ data: { message: string } }> {
    return request.post('/auth/verify-email', data)
  },

  // 初始化 OAuth 登录
  async initiateOAuth(provider: string, data?: InitiateOAuthRequest): Promise<InitiateOAuthResponse> {
    return request.post(`/auth/oauth/${provider}/init`, data)
  },

  // OAuth 回调处理
  async handleOAuthCallback(provider: string, data: any): Promise<LoginResponse> {
    return request.post(`/auth/oauth/${provider}/callback`, data)
  },

  // Telegram 登录
  async telegramAuth(data: TelegramAuthData, botToken: string): Promise<any> {
    const response = await request.post('/auth/oauth/telegram', data, {
      headers: {
        'X-Telegram-Bot-Token': botToken
      }
    })
    return response.data as TelegramAuthResponse
  }
}