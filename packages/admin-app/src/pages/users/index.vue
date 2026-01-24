<template>
  <div class="user-management-page">
    <div class="mb-6">
      <page-header>
        <template #title>用户管理</template>
        <template #subtitle>管理系统中的所有用户账号</template>
      </page-header>
    </div>

    <!-- 用户表格 -->
    <UserTable
      ref="userTableRef"
      :can-create="hasPermission('user.create')"
      :can-edit="hasPermission('user.edit')"
      :can-delete="hasPermission('user.delete')"
      :can-batch-delete="hasPermission('user.batch-delete')"
      :can-reset-password="hasPermission('user.reset-password')"
      :can-toggle-status="hasPermission('user.toggle-status')"
      @view="handleViewUser"
      @edit="handleEditUser"
      @create="handleCreateUser"
    />

    <!-- 用户详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" :width="600" :footer="false" unmount-on-close>
      <template #title>
        <span>用户详情</span>
      </template>

      <div v-if="currentUser">
        <UserCard :user="currentUser" :show-actions="false" class="mb-6" />

        <a-tabs default-active-key="info">
          <a-tab-pane key="info" title="基本信息">
            <a-descriptions :column="1" :label-style="{ width: '120px' }">
              <a-descriptions-item label="用户ID">
                {{ currentUser.id }}
              </a-descriptions-item>
              <a-descriptions-item label="用户名">
                {{ currentUser.username }}
              </a-descriptions-item>
              <a-descriptions-item label="显示名称">
                {{ currentUser.display_name }}
              </a-descriptions-item>
              <a-descriptions-item label="邮箱">
                {{ currentUser.primary_email }}
                <a-tag v-if="currentUser.email_verified" color="green" size="small" class="ml-2"> 已验证 </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="手机号">
                {{ currentUser.phone || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="账号状态">
                <a-tag :color="getStatusColor(currentUser.status)">
                  {{ getStatusText(currentUser.status) }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="注册时间">
                {{ formatDate(currentUser.created_at) }}
              </a-descriptions-item>
              <a-descriptions-item label="最后登录">
                {{ formatDate(currentUser.last_login_at) }}
              </a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>

          <a-tab-pane key="security" title="安全信息">
            <a-descriptions :column="1" :label-style="{ width: '120px' }">
              <a-descriptions-item label="登录方式">
                <a-space>
                  <a-tag v-for="method in currentUser.login_methods" :key="method">
                    {{ method }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>
              <a-descriptions-item label="双因素认证">
                <a-tag :color="currentUser.two_factor_enabled ? 'green' : 'gray'">
                  {{ currentUser.two_factor_enabled ? '已启用' : '未启用' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="登录IP">
                {{ currentUser.last_login_ip || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="登录设备">
                {{ currentUser.last_login_device || '-' }}
              </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <a-space>
              <a-button @click="handleResetPassword">重置密码</a-button>
              <a-button @click="handleForceLogout">强制登出</a-button>
            </a-space>
          </a-tab-pane>

          <a-tab-pane key="logs" title="操作日志">
            <a-timeline>
              <a-timeline-item v-for="log in userLogs" :key="log.id">
                <div class="text-sm">
                  <div class="font-medium">{{ log.action }}</div>
                  <div class="text-gray-500">{{ formatDate(log.created_at) }} · {{ log.ip }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-drawer>

    <!-- 用户编辑弹窗 -->
    <a-modal
      v-model:visible="editVisible"
      :title="editMode === 'create' ? '新建用户' : '编辑用户'"
      :width="600"
      @ok="handleSaveUser"
      @cancel="editVisible = false"
    >
      <a-form ref="editFormRef" :model="editForm" :rules="editRules" layout="vertical">
        <a-form-item field="display_name" label="显示名称">
          <a-input v-model="editForm.display_name" placeholder="请输入显示名称" />
        </a-form-item>

        <a-form-item field="email" label="邮箱地址">
          <a-input v-model="editForm.email" placeholder="请输入邮箱地址" :disabled="editMode === 'edit'" />
        </a-form-item>

        <a-form-item v-if="editMode === 'create'" field="password" label="初始密码">
          <a-input-password v-model="editForm.password" placeholder="请输入初始密码" />
        </a-form-item>

        <a-form-item field="roles" label="用户角色">
          <a-select v-model="editForm.roles" placeholder="请选择用户角色" multiple allow-clear>
            <a-option value="user">普通用户</a-option>
            <a-option value="admin">管理员</a-option>
            <a-option value="super_admin">超级管理员</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="status" label="账号状态">
          <a-radio-group v-model="editForm.status">
            <a-radio value="active">正常</a-radio>
            <a-radio value="inactive">未激活</a-radio>
            <a-radio value="suspended">已停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { UserTable, UserCard, PageHeader, useUserStore, userApi } from '@paigram/shared-components'
import type { UserDetail, UserListItem } from '@paigram/shared-components'

const userStore = useUserStore()

// 权限检查
const hasPermission = (permission: string): boolean => {
  const userPermissions = userStore.userInfo?.permissions || []
  return userPermissions.includes(permission)
}

// Refs
const userTableRef = ref<InstanceType<typeof UserTable>>()
const editFormRef = ref<FormInstance>()

// 用户详情
const detailVisible = ref(false)
const currentUser = ref<UserDetail | null>(null)
const userLogs = ref([
  { id: 1, action: '登录系统', created_at: new Date(), ip: '192.168.1.1' },
  { id: 2, action: '修改密码', created_at: new Date(Date.now() - 86400000), ip: '192.168.1.1' },
  { id: 3, action: '更新个人资料', created_at: new Date(Date.now() - 172800000), ip: '192.168.1.1' },
])

// 用户编辑
const editVisible = ref(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = reactive({
  display_name: '',
  email: '',
  password: '',
  roles: [] as string[],
  status: 'active',
})

// 表单验证规则
const editRules = {
  display_name: [{ required: true, message: '请输入显示名称' }],
  email: [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  password: [
    { required: true, message: '请输入初始密码' },
    { minLength: 8, message: '密码长度至少8位' },
  ],
  roles: [{ required: true, message: '请选择用户角色' }],
}

// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    suspended: 'red',
    pending: 'blue',
  }
  return colorMap[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    suspended: '已停用',
    pending: '待审核',
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (date?: string | Date): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 为演示创建模拟的 UserDetail 数据
const createMockUserDetail = (user: UserListItem): UserDetail => {
  return {
    id: user.id,
    display_name: user.display_name,
    primary_email: user.primary_email,
    avatar_url: user.avatar_url,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.created_at, // 假设更新时间和创建时间相同
    last_login_at: user.last_login_at,
    bio: undefined,
    locale: undefined,
    roles: [],
    // 额外的详情字段
    username: user.display_name.toLowerCase().replace(/\s+/g, '_'),
    nickname: user.display_name,
    email: user.primary_email,
    email_verified: true,
    phone: '+86 138xxxx1234',
    permissions: ['user.read', 'user.write'],
    last_login_ip: '192.168.1.100',
    last_login_device: 'Chrome 120.0 / Windows',
    login_methods: [user.primary_login_type || 'email'],
    two_factor_enabled: false,
  }
}

// 查看用户详情
const handleViewUser = (user: UserListItem) => {
  currentUser.value = createMockUserDetail(user)
  detailVisible.value = true
}

// 编辑用户
const handleEditUser = (user: UserListItem) => {
  const userDetail = createMockUserDetail(user)
  editMode.value = 'edit'
  editForm.display_name = userDetail.display_name
  editForm.email = userDetail.primary_email
  editForm.roles = userDetail.roles || []
  editForm.status = userDetail.status
  editVisible.value = true
}

// 创建用户
const handleCreateUser = () => {
  editMode.value = 'create'
  editForm.display_name = ''
  editForm.email = ''
  editForm.password = ''
  editForm.roles = []
  editForm.status = 'active'
  editVisible.value = true
}

// 保存用户
const handleSaveUser = async () => {
  const valid = await editFormRef.value?.validate()
  if (!valid) return

  try {
    if (editMode.value === 'create') {
      // 创建新用户
      await userApi.create({
        email: editForm.email,
        display_name: editForm.display_name,
        password: editForm.password,
        roles: editForm.roles,
        status: editForm.status as 'active' | 'inactive' | 'pending' | 'suspended',
      })
      Message.success('创建成功')
    } else {
      // 更新用户
      if (currentUser.value) {
        await userApi.update(currentUser.value.id, {
          display_name: editForm.display_name,
          roles: editForm.roles,
          status: editForm.status as 'active' | 'inactive' | 'pending' | 'suspended',
        })
        Message.success('更新成功')
      }
    }
    editVisible.value = false
    userTableRef.value?.refresh()
  } catch (error) {
    console.error('保存失败:', error)
    const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后重试'
    Message.error(errorMessage)
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!currentUser.value) return

  try {
    await userApi.resetPassword(currentUser.value.id)
    Message.success('密码重置邮件已发送')
  } catch (error) {
    console.error('重置密码失败:', error)
    const errorMessage = error instanceof Error ? error.message : '重置密码失败'
    Message.error(errorMessage)
  }
}

// 强制登出
const handleForceLogout = () => {
  Message.info('强制登出功能开发中')
  // TODO: 实现强制登出逻辑
}
</script>
<style scoped></style>
