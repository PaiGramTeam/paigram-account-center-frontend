<template>
  <BasicLayout
    :menu-items="menuItems"
    :show-notifications="true"
    app-title="Paigram Admin"
    app-title-short="PA"
    :collapsible="true"
    :default-collapsed="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@paigram/shared-components'
import { BasicLayout } from '@paigram/shared-components'
import type { RouteRecordRaw } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 管理员菜单配置
const menuItems = computed<RouteRecordRaw[]>(() => {
  const routes = router.options.routes

  // 过滤出有权限的路由
  return filterRoutes([...routes])
})

// 路由过滤
function filterRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes
    .map((route) => ({ ...route })) // 创建路由的浅拷贝
    .filter((route) => {
      // 过滤隐藏的路由
      if (route.meta?.hideInMenu) return false

      // 检查权限
      if (route.meta?.permissions && Array.isArray(route.meta.permissions)) {
        const userPermissions = userStore.userInfo?.permissions || []
        const hasPermission = (route.meta.permissions as string[]).some((permission: string) =>
          userPermissions.includes(permission)
        )
        if (!hasPermission) return false
      }

      // 递归处理子路由
      if (route.children && route.children.length) {
        route.children = filterRoutes(route.children)
        return route.children.length > 0
      }

      return true
    })
}
</script>
