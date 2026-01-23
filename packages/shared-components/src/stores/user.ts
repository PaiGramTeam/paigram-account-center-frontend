import { defineStore } from 'pinia'
import type { UserInfo } from '../types'

export interface UserState {
  userInfo: UserInfo | null
  token: string
  refreshToken: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    token: '',
    refreshToken: ''
  }),

  getters: {
    isLogin: (state) => !!state.token,
    userId: (state) => state.userInfo?.id || '',
    username: (state) => state.userInfo?.username || '',
    nickname: (state) => state.userInfo?.nickname || '',
    avatar: (state) => state.userInfo?.avatar || '',
    roles: (state) => state.userInfo?.roles || [],
    permissions: (state) => state.userInfo?.permissions || []
  },

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    setAuthData(data: { accessToken: string; refreshToken: string }) {
      this.token = data.accessToken
      this.refreshToken = data.refreshToken
    },

    setToken(token: string, refreshToken?: string) {
      this.token = token
      if (refreshToken) {
        this.refreshToken = refreshToken
      }
    },

    async login(loginForm: { email: string; password: string }) {
      // 实际的登录 API 调用需要在应用中实现
      // 这里只是模拟
      this.setToken('mock-token', 'mock-refresh-token')
      this.setUserInfo({
        id: 1,
        username: loginForm.email.split('@')[0],
        nickname: '用户昵称',
        email: loginForm.email || undefined,
        avatar: '',
        roles: ['user'],
        permissions: ['read']
      })
    },

    async logout() {
      // TODO: 调用登出 API
      this.reset()
    },

    async fetchUserInfo() {
      // TODO: 获取用户信息 API
      // const { data } = await getUserInfoAPI()
      // this.setUserInfo(data)
    },

    hasPermission(permission: string): boolean {
      return this.permissions.includes(permission) || this.permissions.includes('*')
    },

    hasRole(role: string): boolean {
      return this.roles.includes(role) || this.roles.includes('admin')
    },

    reset() {
      this.userInfo = null
      this.token = ''
      this.refreshToken = ''
    }
  }

  // persist: {
  //   key: 'user-store',
  //   paths: ['token', 'refreshToken', 'userInfo']
  // }
})