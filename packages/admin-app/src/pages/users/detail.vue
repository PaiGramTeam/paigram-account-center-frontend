<template>
  <div class="user-detail-page p-6">
    <div class="mb-6">
      <a-page-header :show-back="true" title="用户详情" subtitle="查看和管理用户详细信息" @back="handleBack">
        <template #extra>
          <a-space>
            <a-button @click="handleEdit">编辑用户</a-button>
            <a-button status="danger" @click="handleDelete">删除用户</a-button>
          </a-space>
        </template>
      </a-page-header>
    </div>

    <a-spin :loading="loading" class="w-full">
      <div v-if="userDetail" class="space-y-6">
        <!-- 用户卡片 -->
        <a-card>
          <div class="flex items-start space-x-6">
            <a-avatar :size="100" :image-url="userDetail.avatar_url || undefined">
              <template v-if="!userDetail.avatar_url">
                <icon-user class="text-4xl" />
              </template>
            </a-avatar>
            <div class="flex-1">
              <div class="mb-2 flex items-center space-x-3">
                <h2 class="text-2xl font-bold">{{ userDetail.display_name }}</h2>
                <a-tag :color="getStatusColor(userDetail.status)">
                  {{ getStatusText(userDetail.status) }}
                </a-tag>
              </div>
              <div class="space-y-1 text-gray-600">
                <div class="flex items-center space-x-2">
                  <icon-email />
                  <span>{{ userDetail.primary_email }}</span>
                </div>
                <div v-if="userDetail.bio" class="flex items-center space-x-2">
                  <icon-info-circle />
                  <span>{{ userDetail.bio }}</span>
                </div>
              </div>
              <div class="mt-4 flex space-x-4 text-sm text-gray-500">
                <span>用户ID: {{ userDetail.id }}</span>
                <span>注册于 {{ formatDate(userDetail.created_at) }}</span>
                <span v-if="userDetail.last_login_at"> 最后登录 {{ formatDate(userDetail.last_login_at) }} </span>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 详细信息 -->
        <a-row :gutter="16">
          <!-- 基本信息 -->
          <a-col :span="12">
            <a-card title="基本信息">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="显示名称">
                  {{ userDetail.display_name }}
                </a-descriptions-item>
                <a-descriptions-item label="主邮箱">
                  {{ userDetail.primary_email }}
                </a-descriptions-item>
                <a-descriptions-item label="语言偏好">
                  {{ userDetail.locale || '-' }}
                </a-descriptions-item>
                <a-descriptions-item label="主登录方式">
                  <a-tag v-if="userDetail.primary_login_type">
                    {{ userDetail.primary_login_type }}
                  </a-tag>
                  <span v-else>-</span>
                </a-descriptions-item>
                <a-descriptions-item label="注册时间">
                  {{ formatDate(userDetail.created_at) }}
                </a-descriptions-item>
                <a-descriptions-item label="最后更新">
                  {{ formatDate(userDetail.updated_at) }}
                </a-descriptions-item>
                <a-descriptions-item label="最后登录">
                  {{ formatDate(userDetail.last_login_at) }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>

          <!-- 邮箱列表 -->
          <a-col :span="12">
            <a-card title="绑定邮箱">
              <a-list
                v-if="userDetail.emails && userDetail.emails.length > 0"
                :data="userDetail.emails"
                :bordered="false"
              >
                <template #item="{ item }">
                  <a-list-item>
                    <div class="flex w-full items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <icon-email class="text-gray-500" />
                        <span>{{ item.email }}</span>
                        <a-tag v-if="item.is_primary" color="blue" size="small">主邮箱</a-tag>
                      </div>
                      <a-tag v-if="item.verified_at" color="green" size="small"> 已验证 </a-tag>
                      <a-tag v-else color="orange" size="small">未验证</a-tag>
                    </div>
                  </a-list-item>
                </template>
              </a-list>
              <a-empty v-else description="暂无绑定邮箱" />
            </a-card>
          </a-col>
        </a-row>

        <!-- 账号状态和操作 -->
        <a-card title="账号管理">
          <a-space size="large">
            <a-button type="primary" @click="handleResetPassword">重置密码</a-button>
            <a-button @click="handleToggleStatus">
              {{ userDetail.status === 'active' ? '停用账号' : '激活账号' }}
            </a-button>
          </a-space>
        </a-card>
      </div>

      <!-- 空状态 -->
      <a-empty v-else description="用户不存在" />
    </a-spin>

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:visible="editVisible"
      title="编辑用户"
      :width="600"
      @ok="handleSaveEdit"
      @cancel="editVisible = false"
    >
      <a-form ref="editFormRef" :model="editForm" :rules="editRules" layout="vertical">
        <a-form-item field="display_name" label="显示名称">
          <a-input v-model="editForm.display_name" placeholder="请输入显示名称" />
        </a-form-item>

        <a-form-item field="status" label="账号状态">
          <a-radio-group v-model="editForm.status">
            <a-radio value="active">正常</a-radio>
            <a-radio value="inactive">未激活</a-radio>
            <a-radio value="suspended">已停用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item field="locale" label="语言偏好">
          <a-select v-model="editForm.locale" placeholder="选择语言偏好" allow-clear>
            <a-option value="zh_CN">简体中文</a-option>
            <a-option value="en_US">English</a-option>
            <a-option value="ja_JP">日本語</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconUser, IconEmail, IconInfoCircle } from '@arco-design/web-vue/es/icon'
import type { FormInstance } from '@arco-design/web-vue'
import { userApi } from '@paigram/shared-components'
import type { UserDetail, UpdateUserRequest } from '@paigram/shared-components'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const userDetail = ref<UserDetail | null>(null)
const editVisible = ref(false)
const editFormRef = ref<FormInstance>()

const editForm = reactive<UpdateUserRequest>({
  display_name: '',
  status: 'active',
  locale: '',
})

// 表单验证规则
const editRules = {
  display_name: [
    { required: true, message: '请输入显示名称' },
    { minLength: 1, message: '显示名称不能为空' },
  ],
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
const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 加载用户详情
const loadUserDetail = async (): Promise<void> => {
  const userId = route.params.id
  if (!userId) {
    Message.error('用户ID无效')
    return
  }

  loading.value = true
  try {
    const response = await userApi.getDetail(userId as string)
    userDetail.value = response.data
  } catch (error) {
    console.error('加载用户详情失败:', error)
    Message.error('加载用户详情失败')
  } finally {
    loading.value = false
  }
}

// 返回列表
const handleBack = (): void => {
  router.push('/users')
}

// 打开编辑弹窗
const handleEdit = (): void => {
  if (!userDetail.value) return

  editForm.display_name = userDetail.value.display_name
  editForm.status = userDetail.value.status as 'active' | 'inactive' | 'pending' | 'suspended'
  editForm.locale = userDetail.value.locale || ''
  editVisible.value = true
}

// 保存编辑
const handleSaveEdit = async (): Promise<void> => {
  const valid = await editFormRef.value?.validate()
  if (!valid) return

  const userId = route.params.id
  if (!userId) return

  try {
    await userApi.update(userId as string, editForm)
    Message.success('更新成功')
    editVisible.value = false
    await loadUserDetail()
  } catch (error) {
    console.error('更新失败:', error)
    const errorMessage = error instanceof Error ? error.message : '更新失败，请稍后重试'
    Message.error(errorMessage)
  }
}

// 删除用户
const handleDelete = (): void => {
  if (!userDetail.value) return

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${userDetail.value.display_name}" 吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      const userId = route.params.id
      if (!userId) return

      try {
        await userApi.delete(userId as string)
        Message.success('删除成功')
        router.push('/users')
      } catch (error) {
        console.error('删除失败:', error)
        const errorMessage = error instanceof Error ? error.message : '删除失败，请稍后重试'
        Message.error(errorMessage)
      }
    },
  })
}

// 重置密码
const handleResetPassword = (): void => {
  if (!userDetail.value) return

  Modal.confirm({
    title: '重置密码',
    content: `确定要重置用户 "${userDetail.value.display_name}" 的密码吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const userId = route.params.id
      if (!userId) return

      try {
        await userApi.resetPassword(userId as string)
        Message.success('密码重置邮件已发送')
      } catch (error) {
        console.error('重置密码失败:', error)
        const errorMessage = error instanceof Error ? error.message : '重置密码失败'
        Message.error(errorMessage)
      }
    },
  })
}

// 切换账号状态
const handleToggleStatus = (): void => {
  if (!userDetail.value) return

  const newStatus = userDetail.value.status === 'active' ? 'suspended' : 'active'
  const action = newStatus === 'active' ? '激活' : '停用'

  Modal.confirm({
    title: `${action}用户`,
    content: `确定要${action}用户 "${userDetail.value.display_name}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const userId = route.params.id
      if (!userId) return

      try {
        await userApi.updateStatus(userId as string, newStatus)
        Message.success(`${action}成功`)
        await loadUserDetail()
      } catch (error) {
        console.error(`${action}失败:`, error)
        const errorMessage = error instanceof Error ? error.message : `${action}失败`
        Message.error(errorMessage)
      }
    },
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserDetail()
})
</script>
