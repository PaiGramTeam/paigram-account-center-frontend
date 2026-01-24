<template>
  <div class="app-sidebar h-full border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
    <a-menu
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      :collapsed="collapsed"
      :accordion="accordion"
      @menu-item-click="handleMenuClick"
      @sub-menu-click="handleSubMenuClick"
      class="h-full"
    >
      <template v-for="item in menuItems" :key="item.path">
        <a-sub-menu v-if="item.children && item.children.length > 0" :key="item.path">
          <template #icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </template>
          <template #title>{{ getMenuTitle(item) }}</template>

          <a-menu-item v-for="child in item.children" :key="child.path" :disabled="child.meta?.disabled">
            <template #icon v-if="child.meta?.icon">
              <component :is="child.meta.icon" />
            </template>
            {{ getMenuTitle(child) }}
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item v-else :key="item.path" :disabled="item.meta?.disabled">
          <template #icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </template>
          {{ getMenuTitle(item) }}
        </a-menu-item>
      </template>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuItem } from '../../types'

interface Props {
  menuItems?: MenuItem[]
  collapsed?: boolean
  accordion?: boolean
  useRouteMenu?: boolean // 是否使用路由生成菜单
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  accordion: true,
  useRouteMenu: true,
})

const route = useRoute()
const router = useRouter()

// 如果需要，从路由自动生成菜单
const computedMenuItems = computed(() => {
  if (props.useRouteMenu && !props.menuItems) {
    // 这里应该从路由生成菜单，但需要在具体应用中实现
    return []
  }
  return props.menuItems || []
})

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// 获取菜单标题（支持i18n）
const getMenuTitle = (item: MenuItem): string => {
  if (item.meta?.locale) {
    // 如果有locale，使用i18n
    // 这里简单返回locale key，实际应用中需要使用i18n实例
    return item.meta.locale
  }
  return item.meta?.title || item.name || ''
}

// 获取当前路由对应的菜单路径
const findMenuPath = (items: MenuItem[], path: string, parents: string[] = []): string[] => {
  for (const item of items) {
    if (item.path === path) {
      return [...parents, item.path]
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuPath(item.children, path, [...parents, item.path])
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (path) => {
    const menuPath = findMenuPath(computedMenuItems.value, path)
    if (menuPath.length > 0) {
      const lastKey = menuPath[menuPath.length - 1]
      if (lastKey) {
        selectedKeys.value = [lastKey]
      }
      if (!props.collapsed && menuPath.length > 1) {
        openKeys.value = menuPath.slice(0, -1)
      }
    }
  },
  { immediate: true }
)

// 处理菜单点击
const handleMenuClick = (key: string) => {
  router.push(key)
}

// 处理子菜单展开/收起
const handleSubMenuClick = (_key: string, newOpenKeys: string[]) => {
  if (!props.collapsed) {
    openKeys.value = newOpenKeys
  }
}
</script>

<style scoped></style>
