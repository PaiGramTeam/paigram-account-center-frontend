<template>
  <div class="app-header flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 shadow-sm">
    <!-- 左侧 -->
    <div class="flex items-center">
      <!-- 折叠按钮 -->
      <a-button
        v-if="showCollapse"
        type="text"
        @click="handleToggleCollapse"
        class="mr-4"
      >
        <template #icon>
          <icon-menu-fold v-if="!collapsed" />
          <icon-menu-unfold v-else />
        </template>
      </a-button>

      <!-- Logo 和标题 -->
      <div class="flex items-center">
        <img v-if="logo" :src="logo" alt="logo" class="h-8 w-8 mr-3" />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h1>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="flex items-center space-x-4">
      <!-- 搜索 -->
      <a-input-search
        v-if="showSearch"
        placeholder="搜索..."
        class="w-64"
        @search="handleSearch"
      />

      <!-- 主题切换 -->
      <a-button type="text" @click="toggleTheme">
        <template #icon>
          <icon-sun v-if="theme === 'dark'" />
          <icon-moon v-else />
        </template>
      </a-button>

      <!-- 消息通知 -->
      <a-badge :count="9" dot>
        <a-button type="text">
          <template #icon>
            <icon-notification />
          </template>
        </a-button>
      </a-badge>

      <!-- 用户下拉菜单 -->
      <a-dropdown trigger="click" @select="handleUserMenuClick">
        <div class="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1">
          <a-avatar :size="32" class="mr-2">
            <img v-if="userStore.avatar" :src="userStore.avatar" alt="avatar" />
            <icon-user v-else />
          </a-avatar>
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ userStore.nickname || userStore.username }}</span>
        </div>
        <template #content>
          <a-doption value="profile">
            <template #icon>
              <icon-user />
            </template>
            个人中心
          </a-doption>
          <a-doption value="settings">
            <template #icon>
              <icon-settings />
            </template>
            设置
          </a-doption>
          <a-divider class="my-1" />
          <a-doption value="logout">
            <template #icon>
              <icon-export />
            </template>
            退出登录
          </a-doption>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../stores/app'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

interface Props {
  showCollapse?: boolean
  showSearch?: boolean
}

defineProps<Props>({
  showCollapse: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true }
})

const emit = defineEmits<{
  search: [value: string]
}>()

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const collapsed = computed(() => appStore.collapsed)
const theme = computed(() => appStore.theme)
const title = computed(() => appStore.title)
const logo = computed(() => appStore.logo)

const handleToggleCollapse = () => {
  appStore.toggleCollapsed()
}

const toggleTheme = () => {
  appStore.setTheme(theme.value === 'light' ? 'dark' : 'light')
}

const handleSearch = (value: string) => {
  emit('search', value)
}

const handleUserMenuClick = async (value: string) => {
  switch (value) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-border-1);
}
</style>