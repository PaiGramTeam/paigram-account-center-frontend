import { Router } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePermissionStore } from '../stores/permission'
import { Message } from '@arco-design/web-vue'

// 白名单路由
const whiteList = ['/login', '/register', '/404', '/403']

export function setupRouterGuard(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - Paigram Account Center`
    }
    
    // 判断是否登录
    if (userStore.isLogin) {
      if (to.path === '/login') {
        // 已登录且要跳转的页面是登录页
        next({ path: '/' })
      } else {
        // 检查是否有用户信息
        if (!userStore.userInfo) {
          try {
            // 获取用户信息
            await userStore.fetchUserInfo()
            
            // 生成可访问路由
            // TODO: 从后端获取路由配置
            const routes = [] // await getRoutes()
            permissionStore.generateRoutes(routes)
            
            // 动态添加路由
            // routes.forEach(route => {
            //   router.addRoute(route)
            // })
            
            next({ ...to, replace: true })
          } catch (error) {
            // 获取用户信息失败，退出登录
            await userStore.logout()
            Message.error('获取用户信息失败，请重新登录')
            next(`/login?redirect=${to.path}`)
          }
        } else {
          // 权限验证
          if (to.meta?.requiresAuth === false) {
            next()
          } else if (to.meta?.permissions || to.meta?.roles) {
            // 检查权限
            const hasPermission = checkPermission(to.meta)
            if (hasPermission) {
              next()
            } else {
              next('/403')
            }
          } else {
            next()
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path) || to.meta?.requiresAuth === false) {
        // 在免登录白名单，直接进入
        next()
      } else {
        // 其他没有访问权限的页面将重定向到登录页面
        next(`/login?redirect=${to.path}`)
      }
    }
  })
  
  // 全局后置守卫
  router.afterEach((to) => {
    // 结束进度条
    // NProgress.done()
  })
}

// 检查权限
function checkPermission(meta: any): boolean {
  const userStore = useUserStore()
  
  if (meta.roles && meta.roles.length > 0) {
    return meta.roles.some((role: string) => userStore.hasRole(role))
  }
  
  if (meta.permissions && meta.permissions.length > 0) {
    return meta.permissions.some((permission: string) => userStore.hasPermission(permission))
  }
  
  return true
}