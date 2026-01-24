import request from '../request'
import type { UserInfo, ProfileData, ProfileResponse, UpdateProfileRequest } from '../types'

export const userApi = {
  // 获取用户列表
  async getList(): Promise<{ data: UserInfo[] }> {
    return request.get('/users')
  },

  // 获取用户详情
  async getDetail(id: number | string): Promise<{ data: UserInfo }> {
    return request.get(`/users/${id}`)
  },
}

export const profileApi = {
  // 获取用户 Profile
  async getProfile(id: number | string): Promise<ProfileResponse> {
    return request.get(`/profiles/${id}`)
  },

  // 更新用户 Profile
  async updateProfile(id: number | string, data: UpdateProfileRequest): Promise<{ data: ProfileData }> {
    return request.patch(`/profiles/${id}`, data)
  },
}
