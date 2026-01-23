<template>
  <a-layout class="app-layout h-screen">
    <!-- Header -->
    <a-layout-header class="h-16 px-0">
      <AppHeader 
        :show-collapse="showSidebar"
        :show-search="showSearch"
        @search="handleSearch"
      />
    </a-layout-header>
    
    <a-layout>
      <!-- Sidebar -->
      <a-layout-sider
        v-if="showSidebar"
        :collapsed="collapsed"
        :width="220"
        :collapsed-width="64"
        breakpoint="lg"
        class="shadow-sm"
      >
        <AppSidebar
          :menu-items="menuItems"
          :collapsed="collapsed"
          :accordion="accordion"
        />
      </a-layout-sider>
      
      <!-- Content -->
      <a-layout>
        <a-layout-content class="relative">
          <!-- Breadcrumb -->
          <div v-if="showBreadcrumb" class="px-6 py-3 bg-white dark:bg-gray-900 border-b">
            <a-breadcrumb>
              <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
                {{ item.title }}
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>
          
          <!-- Page Content -->
          <div class="p-6 overflow-auto" :class="{ 'h-full': !showFooter }">
            <router-view v-slot="{ Component, route }">
              <transition name="fade-slide" mode="out-in" appear>
                <keep-alive v-if="route.meta?.keepAlive" :include="cachedRoutes">
                  <component :is="Component" :key="route.path" />
                </keep-alive>
                <component v-else :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </a-layout-content>
        
        <!-- Footer -->
        <a-layout-footer v-if="showFooter" class="h-12 px-0">
          <AppFooter :copyright="copyright" />
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../stores/app'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import type { MenuItem } from '../../types'

interface Props {
  menuItems?: MenuItem[]
  showSidebar?: boolean
  showSearch?: boolean
  showBreadcrumb?: boolean
  showFooter?: boolean
  accordion?: boolean
  copyright?: string
}

const props = withDefaults(defineProps<Props>(), {
  menuItems: () => [],
  showSidebar: true,
  showSearch: true,
  showBreadcrumb: true,
  showFooter: true,
  accordion: true
})

const emit = defineEmits<{
  search: [value: string]
}>()

const route = useRoute()
const appStore = useAppStore()

const collapsed = computed(() => appStore.collapsed)
const cachedRoutes = ref<string[]>([])
const breadcrumbItems = ref<{ path: string; title: string }[]>([])

// 更新面包屑
watch(
  () => route.path,
  () => {
    // TODO: 根据路由生成面包屑
    breadcrumbItems.value = [
      { path: '/', title: '首页' },
      { path: route.path, title: route.meta?.title as string || '页面' }
    ]
  },
  { immediate: true }
)

// 更新缓存路由
watch(
  () => route.name,
  (name) => {
    if (name && route.meta?.keepAlive && typeof name === 'string') {
      if (!cachedRoutes.value.includes(name)) {
        cachedRoutes.value.push(name)
      }
    }
  },
  { immediate: true }
)

const handleSearch = (value: string) => {
  emit('search', value)
}

// 提供布局配置给子组件
provide('layoutConfig', {
  collapsed,
  showSidebar: props.showSidebar,
  showFooter: props.showFooter
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

/* 页面切换动画 */
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

:deep(.arco-layout-header) {
  padding: 0;
  height: 64px;
  line-height: 64px;
}

:deep(.arco-layout-footer) {
  padding: 0;
  height: 48px;
  line-height: 48px;
}

:deep(.arco-layout-content) {
  background-color: var(--color-bg-2);
}
</style>