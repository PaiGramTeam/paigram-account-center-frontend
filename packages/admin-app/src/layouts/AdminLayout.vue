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
import type { RouteRecordRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { BasicLayout, useUserStore } from '@paigram/shared-components'

const router = useRouter()
const userStore = useUserStore()

// 管理员菜单配置
const menuItems = computed<RouteRecordRaw[]>(() => {
  // 过滤出有权限的路由
  return filterRoutes([...router.options.routes])
})

// 路由过滤
function filterRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes
    .map((route) => ({ ...route })) // 创建路由的浅拷贝
    .filter((route) => {
      console.log(`检查路由: ${route.name as string}, hideInMenu: ${route.meta?.hideInMenu}`)

      // 过滤隐藏的路由
      if (route.meta?.hideInMenu) {
        return false
      }

      // 检查权限（如果定义了权限要求）
      if (route.meta?.permissions && Array.isArray(route.meta.permissions)) {
        const userPermissions = userStore.userInfo?.permissions || []
        // 只有在有权限要求时才检查
        if (userPermissions.length > 0) {
          // 使用 userStore.hasPermission 方法检查权限（支持通配符）
          const hasPermission = (route.meta.permissions as string[]).some((permission: string) =>
            userStore.hasPermission(permission)
          )
          if (!hasPermission) {
            return false
          }
        } else {
        }
      }

      // 递归处理子路由
      if (route.children && route.children.length) {
        route.children = filterRoutes(route.children)
        // 如果父路由本身没有 hideInMenu，即使子路由被过滤完了也应该显示父路由
        // 但如果有子路由，至少要保留一个子路由才显示父路由
        if (route.redirect || route.component) {
          return true
        }
        return route.children.length > 0
      }
      return true
    })
}
</script>
