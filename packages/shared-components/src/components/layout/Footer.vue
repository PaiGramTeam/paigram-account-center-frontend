<template>
  <footer class="bg-gray-50 border-t border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="py-8">
        <!-- 主要内容区 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- 关于 -->
          <div class="col-span-1 md:col-span-2">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ brandName }}</h3>
            <p class="text-sm text-gray-600 mb-4">
              {{ description || 'Paigram 账号中心为 PaiGram Bot 系列提供统一的用户认证和管理服务。' }}
            </p>
            <div class="flex space-x-4">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">{{ social.name }}</span>
                <component :is="social.icon" class="h-6 w-6" />
              </a>
            </div>
          </div>

          <!-- 快速链接 -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              快速链接
            </h3>
            <ul class="space-y-3">
              <li v-for="link in quickLinks" :key="link.name">
                <a
                  :href="link.href"
                  class="text-sm text-gray-600 hover:text-gray-900"
                  @click.prevent="handleLinkClick(link)"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- 帮助与支持 -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              帮助与支持
            </h3>
            <ul class="space-y-3">
              <li v-for="link in supportLinks" :key="link.name">
                <a
                  :href="link.href"
                  class="text-sm text-gray-600 hover:text-gray-900"
                  :target="link.external ? '_blank' : undefined"
                  :rel="link.external ? 'noopener noreferrer' : undefined"
                  @click="!link.external && handleLinkClick(link)"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-sm text-gray-500">
              &copy; {{ currentYear }} {{ brandName }}. {{ copyright }}
            </p>
            <div class="mt-4 md:mt-0 flex space-x-6">
              <a
                v-for="legal in legalLinks"
                :key="legal.name"
                :href="legal.href"
                class="text-sm text-gray-500 hover:text-gray-900"
                @click.prevent="handleLinkClick(legal)"
              >
                {{ legal.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IconGithub,
  IconWechat,
  IconQq,
  IconEmail
} from '@arco-design/web-vue/es/icon'

interface Link {
  name: string
  href: string
  external?: boolean
}

interface SocialLink {
  name: string
  url: string
  icon: any
}

const props = withDefaults(defineProps<{
  brandName?: string
  description?: string
  copyright?: string
  quickLinks?: Link[]
  supportLinks?: Link[]
  legalLinks?: Link[]
  socialLinks?: SocialLink[]
}>(), {
  brandName: 'Paigram',
  copyright: 'All rights reserved.',
  quickLinks: () => [
    { name: '首页', href: '/' },
    { name: '控制台', href: '/dashboard' },
    { name: '个人资料', href: '/profile' },
    { name: '账号设置', href: '/settings' }
  ],
  supportLinks: () => [
    { name: '帮助文档', href: 'https://docs.paigram.com', external: true },
    { name: 'API 文档', href: '/api-docs' },
    { name: '联系我们', href: '/contact' },
    { name: '反馈建议', href: '/feedback' }
  ],
  legalLinks: () => [
    { name: '隐私政策', href: '/privacy' },
    { name: '服务条款', href: '/terms' },
    { name: '使用协议', href: '/agreement' }
  ],
  socialLinks: () => [
    { name: 'GitHub', url: 'https://github.com/paigram', icon: IconGithub },
    { name: 'Email', url: 'mailto:support@paigram.com', icon: IconEmail }
  ]
})

const router = useRouter()

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 处理链接点击
const handleLinkClick = (link: Link): void => {
  if (!link.external && link.href.startsWith('/')) {
    router.push(link.href)
  }
}
</script>

<style scoped>
/* 确保 Footer 始终在底部 */
footer {
  margin-top: auto;
}
</style>