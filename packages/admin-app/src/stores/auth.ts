import { defineStore } from 'pinia'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@paigram/shared-components'
import { authApi, profileApi } from '@/api'
import type { LoginEmailRequest, UserStatus } from '@paigram/shared-components'

interface AuthState {
  loading: boolean
  loginType: 'email' | 'oauth' | 'telegram' | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    loading: false,
    loginType: null,
  }),

  actions: {
    // 邮箱密码登录
    async loginWithEmail(credentials: LoginEmailRequest): Promise<void> {
      this.loading = true
      const userStore = useUserStore()

      try {
        const response = await authApi.login(credentials)

        console.log('Login response:', response) // 调试日志

        // 保存认证信息
        userStore.setAuthData({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        })

        // 获取用户信息
        await this.fetchUserProfile(response.data.user_id)

        this.loginType = 'email'
        Message.success('登录成功')
      } catch (error: unknown) {
        console.error('Login error:', error) // 调试日志
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

        console.log('Fetching profile for user ID:', id) // 调试日志

        const response = await profileApi.getProfile(id)

        console.log('Profile response:', response) // 调试日志

        const profile = response.data

        // 转换并保存用户信息
        userStore.setUserInfo({
          id: profile.user_id,
          display_name: profile.display_name,
          primary_email: profile.primary_email,
          avatar_url: profile.avatar_url,
          status: profile.status as UserStatus,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_login_at: profile.last_login_at,
          bio: profile.bio,
          locale: profile.locale,
          roles: ['admin'], // 管理员默认角色
          permissions: ['*'], // 管理员默认权限
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
