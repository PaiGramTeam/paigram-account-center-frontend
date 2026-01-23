<template>
  <a-layout class="min-h-screen">
    <!-- 侧边栏 (仅在需要时显示) -->
    <a-layout-sider
      v-if="showSidebar"
      v-model:collapsed="collapsed"
      :collapsible="collapsible"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      breakpoint="lg"
      class="shadow-lg"
    >
      <!-- Logo 区域 -->
      <div class="flex items-center justify-center h-16 px-4 bg-primary">
        <transition name="fade" mode="out-in">
          <h1 v-if="!collapsed" class="text-white text-lg font-bold">
            {{ appTitle }}
          </h1>
          <span v-else class="text-white text-2xl font-bold">
            {{ appTitleShort }}
          </span>
        </transition>
      </div>
      
      <!-- 菜单 -->
      <a-menu
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        :accordion="accordion"
        :theme="menuTheme"
        @menu-item-click="handleMenuClick"
      >
        <template v-for="item in menuItems" :key="item.path">
          <!-- 有子菜单的项 -->
          <a-sub-menu v-if="item.children && item.children.length" :key="item.path">
            <template #icon>
              <component :is="item.meta?.icon" />
            </template>
            <template #title>
              {{ $t(item.meta?.locale || item.name) }}
            </template>
            <a-menu-item
              v-for="child in item.children"
              :key="child.path"
            >
              <template #icon>
                <component :is="child.meta?.icon" />
              </template>
              {{ $t(child.meta?.locale || child.name) }}
            </a-menu-item>
          </a-sub-menu>
          
          <!-- 单独菜单项 -->
          <a-menu-item v-else :key="item.path">
            <template #icon>
              <component :is="item.meta?.icon" />
            </template>
            {{ $t(item.meta?.locale || item.name) }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 顶部栏 -->
      <a-layout-header v-if="showHeader" class="flex items-center px-6 bg-white shadow-sm" style="height: 64px;">
        <div class="flex items-center flex-1">
          <!-- 折叠按钮 -->
          <a-button
            v-if="showSidebar && collapsible"
            type="text"
            @click="toggleCollapse"
          >
            <template #icon>
              <icon-menu-fold v-if="!collapsed" />
              <icon-menu-unfold v-else />
            </template>
          </a-button>
          
          <!-- 面包屑 -->
          <a-breadcrumb v-if="showBreadcrumb" class="ml-4">
            <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.name">
              {{ $t(item.meta?.locale || item.name) }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-4">
          <!-- 全屏按钮 -->
          <a-tooltip content="全屏">
            <a-button type="text" @click="toggleFullScreen">
              <template #icon>
                <icon-fullscreen v-if="!isFullScreen" />
                <icon-fullscreen-exit v-else />
              </template>
            </a-button>
          </a-tooltip>

          <!-- 主题切换 -->
          <a-tooltip :content="isDark ? '切换到亮色' : '切换到暗色'">
            <a-button type="text" @click="toggleTheme">
              <template #icon>
                <icon-moon v-if="!isDark" />
                <icon-sun v-else />
              </template>
            </a-button>
          </a-tooltip>

          <!-- 通知 -->
          <a-badge v-if="showNotifications" :count="notificationCount" dot>
            <a-button type="text">
              <template #icon>
                <icon-notification />
              </template>
            </a-button>
          </a-badge>

          <!-- 用户菜单 -->
          <a-dropdown trigger="click">
            <a-avatar :size="32" class="cursor-pointer">
              <img v-if="userAvatar" :src="userAvatar" alt="avatar" />
              <icon-user v-else />
            </a-avatar>
            <template #content>
              <a-doption @click="handleProfile">
                <template #icon><icon-user /></template>
                个人中心
              </a-doption>
              <a-doption @click="handleSettings">
                <template #icon><icon-settings /></template>
                设置
              </a-doption>
              <a-divider style="margin: 4px 0" />
              <a-doption @click="handleLogout">
                <template #icon><icon-export /></template>
                退出登录
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content :class="contentClass">
        <div class="h-full" :class="contentInnerClass">
          <router-view v-slot="{ Component, route }">
            <transition name="fade-slide" mode="out-in">
              <keep-alive v-if="keepAlive && route.meta?.keepAlive">
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
              <component :is="Component" v-else :key="route.fullPath" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <!-- 底部 -->
      <a-layout-footer v-if="showFooter" class="text-center text-gray-500">
        {{ footerText }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useAppStore, useUserStore, usePermissionStore } from '../stores'
import { useI18n } from 'vue-i18n'
import type { RouteRecordRaw } from 'vue-router'

interface Props {
  // 布局配置
  showSidebar?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showBreadcrumb?: boolean
  showNotifications?: boolean
  
  // 侧边栏配置
  sidebarWidth?: number
  collapsedWidth?: number
  collapsible?: boolean
  defaultCollapsed?: boolean
  accordion?: boolean
  menuTheme?: 'light' | 'dark'
  
  // 内容区配置
  contentClass?: string
  contentInnerClass?: string
  keepAlive?: boolean
  
  // 文本配置
  appTitle?: string
  appTitleShort?: string
  footerText?: string
  
  // 菜单配置
  menuItems?: RouteRecordRaw[]
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true,
  showHeader: true,
  showFooter: true,
  showBreadcrumb: true,
  showNotifications: true,
  sidebarWidth: 220,
  collapsedWidth: 48,
  collapsible: true,
  defaultCollapsed: false,
  accordion: true,
  menuTheme: 'light',
  contentClass: 'p-6',
  contentInnerClass: 'bg-white rounded-lg shadow-sm p-6',
  keepAlive: true,
  appTitle: 'Paigram',
  appTitleShort: 'P',
  footerText: '© 2024 Paigram. All rights reserved.',
  menuItems: () => []
})

const emit = defineEmits<{
  'menu-click': [key: string]
  'toggle-collapse': [collapsed: boolean]
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 状态
const collapsed = ref(props.defaultCollapsed)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])
const isFullScreen = ref(false)

// 计算属性
const isDark = computed(() => appStore.theme === 'dark')
const notificationCount = computed(() => 5) // TODO: 从 store 获取
const userAvatar = computed(() => userStore.avatar)

// 面包屑项目
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta?.locale)
  return matched
})

// 监听路由变化
watch(
  () => route.path,
  (path) => {
    // 更新选中的菜单
    selectedKeys.value = [path]
    
    // 更新展开的菜单
    const matched = route.matched
    openKeys.value = matched
      .filter(item => item.path !== path)
      .map(item => item.path)
  },
  { immediate: true }
)

// 方法
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('toggle-collapse', collapsed.value)
}

const toggleTheme = () => {
  appStore.toggleTheme()
}

const toggleFullScreen = () => {
  if (isFullScreen.value) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
  isFullScreen.value = !isFullScreen.value
}

const handleMenuClick = (key: string) => {
  router.push(key)
  emit('menu-click', key)
}

const handleProfile = () => {
  router.push('/profile')
}

const handleSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    Message.success('已退出登录')
    router.push('/login')
  } catch (error) {
    Message.error('退出登录失败')
  }
}

// 监听全屏变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !!document.fullscreenElement
  })
})
</script>

<style scoped>
.bg-primary {
  background-color: rgb(var(--primary-6));
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>