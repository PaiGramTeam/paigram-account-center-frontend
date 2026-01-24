import request from '../request'
import type {
  PermissionListParams,
  PermissionListItem,
  CreatePermissionRequest,
  CreatePermissionResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
  DeletePermissionResponse,
  PermissionDetailResponse,
  PaginationMeta,
} from '../types'

export const permissionApi = {
  // 获取权限列表（带分页）
  async getList(params?: PermissionListParams): Promise<{ data: PermissionListItem[]; pagination: PaginationMeta }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return request.get('/permissions', { params }) as any
  },

  // 获取权限详情
  async getDetail(id: number | string): Promise<PermissionDetailResponse> {
    return request.get(`/permissions/${id}`)
  },

  // 创建权限
  async create(data: CreatePermissionRequest): Promise<CreatePermissionResponse> {
    return request.post('/permissions', data)
  },

  // 更新权限
  async update(id: number | string, data: UpdatePermissionRequest): Promise<UpdatePermissionResponse> {
    return request.patch(`/permissions/${id}`, data)
  },

  // 删除权限
  async delete(id: number | string): Promise<DeletePermissionResponse> {
    return request.delete(`/permissions/${id}`)
  },
}
