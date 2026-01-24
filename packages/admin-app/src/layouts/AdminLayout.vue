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

  // 调试信息
  console.group('🔍 菜单调试信息')
  console.log('原始路由数量:', routes.length)
  console.log('用户信息:', userStore.userInfo)
  console.log('用户权限:', userStore.userInfo?.permissions)

  // 过滤出有权限的路由
  const filtered = filterRoutes([...routes])
  console.log('过滤后的菜单数量:', filtered.length)
  console.log('过滤后的菜单:', filtered)

  // 打印菜单项的路径信息
  console.log('菜单项路径信息:')
  filtered.forEach((item) => {
    console.log(`  - ${item.name as string}: path="${item.path}"`)
    if (item.children) {
      item.children.forEach((child) => {
        console.log(`    - ${child.name as string}: path="${child.path}"`)
      })
    }
  })

  console.groupEnd()

  return filtered
})

// 路由过滤
function filterRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes
    .map((route) => ({ ...route })) // 创建路由的浅拷贝
    .filter((route) => {
      console.log(`检查路由: ${route.name as string}, hideInMenu: ${route.meta?.hideInMenu}`)

      // 过滤隐藏的路由
      if (route.meta?.hideInMenu) {
        console.log(`  ❌ 隐藏菜单，跳过`)
        return false
      }

      // 检查权限（如果定义了权限要求）
      if (route.meta?.permissions && Array.isArray(route.meta.permissions)) {
        const userPermissions = userStore.userInfo?.permissions || []
        console.log(`  🔐 需要权限: ${route.meta.permissions.join(', ')}`)
        console.log(`  👤 用户权限: ${userPermissions.join(', ')}`)

        // 只有在有权限要求时才检查
        if (userPermissions.length > 0) {
          // 使用 userStore.hasPermission 方法检查权限（支持通配符）
          const hasPermission = (route.meta.permissions as string[]).some((permission: string) =>
            userStore.hasPermission(permission)
          )

          if (!hasPermission) {
            console.log(`  ❌ 权限不足，过滤`)
            return false
          }
          console.log(`  ✅ 权限通过`)
        } else {
          console.log(`  ⚠️ 用户无权限数据，开发模式显示所有菜单`)
        }
      }

      // 递归处理子路由
      if (route.children && route.children.length) {
        console.log(`  📁 处理 ${route.children.length} 个子路由`)
        route.children = filterRoutes(route.children)
        console.log(`  📁 过滤后剩余 ${route.children.length} 个子路由`)
        // 如果父路由本身没有 hideInMenu，即使子路由被过滤完了也应该显示父路由
        // 但如果有子路由，至少要保留一个子路由才显示父路由
        if (route.redirect || route.component) {
          console.log(`  ✅ 保留父路由 (有 redirect 或 component)`)
          return true
        }
        const result = route.children.length > 0
        console.log(
          `  ${result ? '✅' : '❌'} ${result ? '保留' : '过滤'}父路由 (${route.children.length > 0 ? '有' : '无'}子路由)`
        )
        return result
      }

      console.log(`  ✅ 保留`)
      return true
    })
}
</script>
