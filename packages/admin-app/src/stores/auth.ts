import { defineStore } from 'pinia'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@paigram/shared-components'
import { authApi, userApi } from '@/api'
import type { LoginChallengeResponseData, LoginEmailRequest, LoginResponseData, UserStatus } from '@paigram/shared-components'

interface AuthState {
  loading: boolean
  loginType: 'email' | 'oauth' | 'telegram' | null
}

export interface LoginWithEmailResult {
  status: 'success' | 'requires_totp'
  message?: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    loading: false,
    loginType: null,
  }),

  actions: {
    // 邮箱密码登录
    async loginWithEmail(credentials: LoginEmailRequest): Promise<LoginWithEmailResult> {
      this.loading = true
      const userStore = useUserStore()

      try {
        const response = await authApi.login(credentials)

        if (isTwoFactorChallenge(response.data)) {
          return {
            status: 'requires_totp',
            message: response.data.message,
          }
        }

        // 保存认证信息
        userStore.setAuthData({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        })

        // 获取用户信息
        await this.fetchUserProfile(response.data.user_id)

        this.loginType = 'email'
        Message.success('登录成功')
        return { status: 'success' }
      } catch (error: unknown) {
        const err = error as { error?: string; message?: string }
        Message.error(err.error || err.message || '登录失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取用户资料
    async fetchUserProfile(userId?: number): Promise<void> {
      const userStore = useUserStore()

      try {
        const id = userId || userStore.userId
        if (!id) {
          throw new Error('User ID not found')
        }

        const response = await userApi.getDetail(id)
        const userDetail = response.data

        // 转换并保存用户信息
        userStore.setUserInfo({
          id: userDetail.id,
          display_name: userDetail.display_name,
          primary_email: userDetail.primary_email,
          avatar_url: userDetail.avatar_url,
          status: userDetail.status as UserStatus,
          created_at: userDetail.created_at,
          updated_at: userDetail.updated_at,
          last_login_at: userDetail.last_login_at,
          bio: userDetail.bio,
          locale: userDetail.locale,
          roles: userDetail.roles || [],
          permissions: userDetail.permissions || [],
        })
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        Message.error('获取用户信息失败')
        throw error
      }
    },

    // 登出
    async logout(): Promise<void> {
      const userStore = useUserStore()

      try {
        if (userStore.token) {
          await authApi.logout({ token: userStore.token })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        userStore.logout()
        this.loginType = null
      }
    },
  },
})

function isTwoFactorChallenge(data: LoginResponseData | LoginChallengeResponseData): data is LoginChallengeResponseData {
  return 'requires_totp' in data && data.requires_totp === true
}
