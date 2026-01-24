import type { createRequest } from '../request'
import type {
  ProfileData,
  ProfileResponse,
  UpdateProfileRequest,
  BoundAccount,
  PaginatedResponse,
  BindAccountRequest,
  BindAccountResponse,
  UnbindAccountResponse,
  UserListParams,
  UserListItem,
  UserListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserDetail,
  PaginationMeta,
} from '../types'

export function createUserApi(request: ReturnType<typeof createRequest>) {
  return {
    // 获取用户列表（带分页和搜索）
    async getList(params?: UserListParams): Promise<UserListResponse> {
      const response = await request.get<UserListResponse>('/users', { params })
      return response.data
    },

    // 获取用户详情
    async getDetail(id: number | string): Promise<{ data: UserDetail }> {
      return request.get(`/users/${id}`)
    },

    // 创建用户（管理员功能）
    async create(data: CreateUserRequest): Promise<CreateUserResponse> {
      return request.post('/users', data)
    },

    // 更新用户（管理员功能）
    async update(id: number | string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
      return request.patch(`/users/${id}`, data)
    },

    // 删除用户（管理员功能）
    async delete(id: number | string, hardDelete = false): Promise<{ data: { message: string } }> {
      return request.delete(`/users/${id}`, { params: { hard_delete: hardDelete } })
    },

    // 更新用户状态
    async updateStatus(id: number | string, status: string): Promise<{ data: { id: number; status: string } }> {
      return request.patch(`/users/${id}/status`, { status })
    },

    // 重置用户密码
    async resetPassword(id: number | string): Promise<{ data: { message: string } }> {
      return request.post(`/users/${id}/reset-password`)
    },
  }
}

export function createProfileApi(request: ReturnType<typeof createRequest>) {
  return {
    // 获取用户 Profile
    async getProfile(id: number | string): Promise<ProfileResponse> {
      return request.get(`/profiles/${id}`)
    },

    // 更新用户 Profile
    async updateProfile(id: number | string, data: UpdateProfileRequest): Promise<{ data: ProfileData }> {
      return request.patch(`/profiles/${id}`, data)
    },

    // 获取绑定的第三方账号列表
    async getBoundAccounts(id: number | string): Promise<PaginatedResponse<BoundAccount>> {
      return request.get(`/profiles/${id}/accounts`)
    },

    // 绑定第三方账号
    async bindAccount(id: number | string, data: BindAccountRequest): Promise<BindAccountResponse> {
      return request.post(`/profiles/${id}/accounts/bind`, data)
    },

    // 解绑第三方账号
    async unbindAccount(id: number | string, provider: string): Promise<UnbindAccountResponse> {
      return request.delete(`/profiles/${id}/accounts/${provider}`)
    },
  }
}
