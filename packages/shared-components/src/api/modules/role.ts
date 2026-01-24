import request from '../request'
import type {
  RoleListParams,
  RoleListItem,
  RoleListResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  DeleteRoleResponse,
  RoleDetailResponse,
  PaginationMeta,
} from '../types'

export const roleApi = {
  // 获取角色列表（带分页）
  async getList(params?: RoleListParams): Promise<RoleListResponse> {
    const response = await request.get<RoleListResponse>('/roles', { params })
    return response.data
  },

  // 获取角色详情
  async getDetail(id: number | string): Promise<RoleDetailResponse> {
    return request.get(`/roles/${id}`)
  },

  // 创建角色
  async create(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    return request.post('/roles', data)
  },

  // 更新角色
  async update(id: number | string, data: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    return request.patch(`/roles/${id}`, data)
  },

  // 删除角色
  async delete(id: number | string): Promise<DeleteRoleResponse> {
    return request.delete(`/roles/${id}`)
  },
}
