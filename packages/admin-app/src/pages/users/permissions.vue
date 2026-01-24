<template>
  <div class="p-6">
    <!-- 页面标题和操作栏 -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">权限管理</h1>
      <a-button type="primary" @click="handleCreate">
        <template #icon>
          <icon-plus />
        </template>
        创建权限
      </a-button>
    </div>

    <!-- 筛选栏 -->
    <a-card :bordered="false" class="mb-4 shadow-sm">
      <a-form layout="inline" :model="filterForm">
        <a-form-item label="权限分类" field="category">
          <a-select
            v-model="filterForm.category"
            placeholder="选择权限分类"
            allow-clear
            style="width: 200px"
            @change="handleFilter"
          >
            <a-option value="">全部分类</a-option>
            <a-option value="user_management">用户管理</a-option>
            <a-option value="role_management">角色管理</a-option>
            <a-option value="permission_management">权限管理</a-option>
            <a-option value="system_management">系统管理</a-option>
            <a-option value="content_management">内容管理</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 权限列表卡片 -->
    <a-card :bordered="false" class="shadow-sm">
      <!-- 加载状态 -->
      <a-spin v-if="loading" class="flex min-h-[400px] items-center justify-center" />

      <!-- 权限列表表格 -->
      <a-table
        v-else
        :columns="columns"
        :data="permissionList"
        :pagination="paginationConfig"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <!-- 权限名称列 -->
        <template #name="{ record }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-white">{{ record.display_name }}</span>
            <code class="text-xs text-gray-500 dark:text-gray-400">{{ record.name }}</code>
          </div>
        </template>

        <!-- 权限分类列 -->
        <template #category="{ record }">
          <a-tag :color="getCategoryColor(record.category)">
            {{ getCategoryText(record.category) }}
          </a-tag>
        </template>

        <!-- 描述列 -->
        <template #description="{ record }">
          <span class="text-gray-600 dark:text-gray-300">{{ record.description || '-' }}</span>
        </template>

        <!-- 操作列 -->
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon>
                <icon-edit />
              </template>
              编辑
            </a-button>
            <a-button type="text" size="small" status="danger" @click="handleDelete(record)">
              <template #icon>
                <icon-delete />
              </template>
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑权限弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalMode === 'create' ? '创建权限' : '编辑权限'"
      :mask-closable="false"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="权限名称" :rules="[{ required: true, message: '请输入权限名称' }]" field="name">
          <a-input
            v-model="formData.name"
            :disabled="modalMode === 'edit'"
            placeholder="请输入权限名称（如 user.read）"
          />
          <template #extra>
            <span class="text-xs text-gray-500">格式：模块.操作（如 user.read、user.write）</span>
          </template>
        </a-form-item>
        <a-form-item label="显示名称" :rules="[{ required: true, message: '请输入显示名称' }]" field="display_name">
          <a-input v-model="formData.display_name" placeholder="请输入显示名称（如查看用户）" />
        </a-form-item>
        <a-form-item label="权限分类" :rules="[{ required: true, message: '请选择权限分类' }]" field="category">
          <a-select v-model="formData.category" placeholder="请选择权限分类">
            <a-option value="user_management">用户管理</a-option>
            <a-option value="role_management">角色管理</a-option>
            <a-option value="permission_management">权限管理</a-option>
            <a-option value="system_management">系统管理</a-option>
            <a-option value="content_management">内容管理</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="权限描述" field="description">
          <a-textarea v-model="formData.description" placeholder="请输入权限描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon'
import { permissionApi } from '@paigram/shared-components'
import type { PermissionListItem, CreatePermissionRequest, UpdatePermissionRequest } from '@paigram/shared-components'

// 表格列定义
const columns = [
  {
    title: '权限名称',
    dataIndex: 'name',
    slotName: 'name',
    width: 250,
  },
  {
    title: '权限分类',
    dataIndex: 'category',
    slotName: 'category',
    width: 150,
  },
  {
    title: '描述',
    dataIndex: 'description',
    slotName: 'description',
  },
  {
    title: '操作',
    slotName: 'actions',
    width: 150,
  },
]

// 状态管理
const loading = ref(false)
const permissionList = ref<PermissionListItem[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 筛选表单
const filterForm = reactive({
  category: '',
})

// 弹窗状态
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const currentEditingPermission = ref<PermissionListItem | null>(null)

// 表单数据
const formData = reactive({
  name: '',
  display_name: '',
  category: '',
  description: '',
})

// 分页配置
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: total.value,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100],
}))

// 权限分类颜色
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    user_management: 'blue',
    role_management: 'green',
    permission_management: 'orange',
    system_management: 'red',
    content_management: 'purple',
  }
  return colorMap[category] || 'gray'
}

// 权限分类文本
const getCategoryText = (category: string): string => {
  const textMap: Record<string, string> = {
    user_management: '用户管理',
    role_management: '角色管理',
    permission_management: '权限管理',
    system_management: '系统管理',
    content_management: '内容管理',
  }
  return textMap[category] || category
}

// 加载权限列表
const loadPermissionList = async (): Promise<void> => {
  loading.value = true
  try {
    const { data, pagination } = await permissionApi.getList({
      page: currentPage.value,
      page_size: pageSize.value,
      category: filterForm.category || undefined,
    })
    permissionList.value = data
    total.value = pagination.total
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载权限列表失败'
    Message.error(message)
    console.error('Failed to load permission list:', error)
  } finally {
    loading.value = false
  }
}

// 页码改变
const handlePageChange = (page: number): void => {
  currentPage.value = page
  loadPermissionList()
}

// 每页数量改变
const handlePageSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
  loadPermissionList()
}

// 筛选
const handleFilter = (): void => {
  currentPage.value = 1
  loadPermissionList()
}

// 重置筛选
const handleReset = (): void => {
  filterForm.category = ''
  currentPage.value = 1
  loadPermissionList()
}

// 打开创建权限弹窗
const handleCreate = (): void => {
  modalMode.value = 'create'
  currentEditingPermission.value = null
  formData.name = ''
  formData.display_name = ''
  formData.category = ''
  formData.description = ''
  modalVisible.value = true
}

// 打开编辑权限弹窗
const handleEdit = (permission: PermissionListItem): void => {
  modalMode.value = 'edit'
  currentEditingPermission.value = permission
  formData.name = permission.name
  formData.display_name = permission.display_name
  formData.category = permission.category
  formData.description = permission.description
  modalVisible.value = true
}

// 删除权限
const handleDelete = (permission: PermissionListItem): void => {
  Modal.confirm({
    title: '删除权限',
    content: `确定要删除权限 "${permission.display_name}" 吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await permissionApi.delete(permission.id)
        Message.success('删除权限成功')
        await loadPermissionList()
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除权限失败'
        Message.error(message)
        console.error('Failed to delete permission:', error)
      }
    },
  })
}

// 弹窗确定按钮
const handleModalOk = async (): Promise<void> => {
  try {
    if (modalMode.value === 'create') {
      // 创建权限
      const createData: CreatePermissionRequest = {
        name: formData.name,
        display_name: formData.display_name,
        category: formData.category,
        description: formData.description,
      }
      await permissionApi.create(createData)
      Message.success('创建权限成功')
    } else {
      // 编辑权限
      if (!currentEditingPermission.value) return
      const updateData: UpdatePermissionRequest = {
        display_name: formData.display_name,
        category: formData.category,
        description: formData.description,
      }
      await permissionApi.update(currentEditingPermission.value.id, updateData)
      Message.success('更新权限成功')
    }
    modalVisible.value = false
    await loadPermissionList()
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    Message.error(message)
    console.error('Failed to save permission:', error)
  }
}

// 弹窗取消按钮
const handleModalCancel = (): void => {
  modalVisible.value = false
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadPermissionList()
})
</script>
