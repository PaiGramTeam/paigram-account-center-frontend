// Shared components entry point
export const version = '1.0.0'

// Layout Components
export { default as MainLayout } from './components/layout/MainLayout.vue'
export { default as AppHeader } from './components/layout/AppHeader.vue'
export { default as AppFooter } from './components/layout/AppFooter.vue'
export { default as AppSidebar } from './components/layout/AppSidebar.vue'
export { default as Header } from './components/layout/Header.vue'
export { default as Footer } from './components/layout/Footer.vue'
export { default as BasicLayout } from './components/layout/BasicLayout.vue'

// Business Components
export { default as UserTable } from './components/business/UserTable.vue'
export { default as UserCard } from './components/business/UserCard.vue'

// Stores
export { useUserStore } from './stores/user'
export { useAppStore } from './stores/app'
export { usePermissionStore } from './stores/permission'

// Hooks
export { setupRouterGuard } from './hooks/useRouterGuard'
export { usePermission } from './hooks/usePermission'
export { useMenuGeneration } from './hooks/useMenuGeneration'

// Utils
export { setupPermissionDirective } from './utils/permission'

// Locale
export { default as zhCN } from './locale/zh-CN'
export { default as enUS } from './locale/en-US'

// Types
export type { UserInfo, RouteMeta, MenuItem, AppConfig } from './types'

// API
export * from './api'