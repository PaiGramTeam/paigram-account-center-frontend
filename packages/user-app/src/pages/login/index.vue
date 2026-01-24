<template>
  <div class="flex min-h-screen">
    <!-- 左侧装饰区域 -->
    <div class="hidden bg-gradient-to-br from-blue-500 to-indigo-600 lg:flex lg:w-1/2">
      <div class="flex w-full flex-col items-center justify-center px-12 text-white">
        <h1 class="mb-4 text-5xl font-bold">Paigram</h1>
        <p class="max-w-md text-center text-xl">一个账号，畅享所有 PaiGram Bot 系列服务</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="rounded-lg bg-white px-6 py-8 shadow-lg">
          <!-- Logo 和标题 -->
          <div class="mb-8 text-center">
            <h2 class="text-3xl font-bold text-gray-900">欢迎回来</h2>
            <p class="mt-2 text-sm text-gray-600">
              没有账号？
              <a-link @click="handleGoRegister" class="font-medium text-blue-500 hover:text-blue-600">
                立即注册
              </a-link>
            </p>
          </div>

          <!-- 登录表单 -->
          <a-form :model="loginForm" :rules="rules" layout="vertical" @submit="handleSubmit">
            <a-form-item field="email" label="邮箱地址">
              <a-input v-model="loginForm.email" size="large" placeholder="请输入邮箱地址" allow-clear>
                <template #prefix>
                  <icon-email />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item field="password" label="密码">
              <a-input-password v-model="loginForm.password" size="large" placeholder="请输入密码" allow-clear>
                <template #prefix>
                  <icon-lock />
                </template>
              </a-input-password>
            </a-form-item>

            <div class="mb-6 flex items-center justify-between">
              <a-checkbox v-model="rememberMe">记住我</a-checkbox>
              <a-link @click="handleForgotPassword" class="text-sm"> 忘记密码？ </a-link>
            </div>

            <a-button type="primary" size="large" long html-type="submit" :loading="loading"> 登录 </a-button>
          </a-form>

          <!-- 分割线 -->
          <a-divider class="!my-8">
            <span class="text-sm text-gray-500">或使用其他方式登录</span>
          </a-divider>

          <!-- 第三方登录 -->
          <div class="grid grid-cols-2 gap-4">
            <a-button
              v-for="provider in oauthProviders"
              :key="provider.name"
              size="large"
              class="!text-gray-700"
              @click="handleOAuthLogin(provider.name)"
            >
              <template #icon>
                <component :is="provider.icon" />
              </template>
              {{ provider.label }}
            </a-button>
          </div>

          <!-- Telegram 登录 -->
          <div class="mt-4">
            <a-button size="large" long @click="handleTelegramLogin">
              <template #icon>
                <icon-send />
              </template>
              使用 Telegram 登录
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconGithub, IconGoogle, IconEmail, IconLock, IconSend } from '@arco-design/web-vue/es/icon'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { LoginEmailRequest } from '@paigram/shared-components'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive<LoginEmailRequest>({
  email: '',
  password: '',
})

// 记住我
const rememberMe = ref(false)

// 加载状态
const loading = ref(false)

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码长度不能少于6位' },
  ],
}

// OAuth 提供商
const oauthProviders = [
  { name: 'google', label: 'Google', icon: IconGoogle },
  { name: 'github', label: 'GitHub', icon: IconGithub },
]

interface FormSubmitData {
  values: LoginEmailRequest
  errors: Record<string, string> | undefined
}

// 提交登录
const handleSubmit = async ({ values, errors }: FormSubmitData): Promise<void> => {
  if (errors) return

  loading.value = true
  try {
    // 使用 authStore 的登录方法，它会自动处理 token 保存和用户信息获取
    await authStore.loginWithEmail(values)

    // 跳转到控制台或之前的页面
    const redirect = route.query.redirect as string
    await router.push(redirect || '/dashboard')
  } catch (error: unknown) {
    // 错误信息已在 authStore 中处理
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}

// OAuth 登录
const handleOAuthLogin = async (provider: string): Promise<void> => {
  try {
    const response = await authApi.initiateOAuth(provider, {
      redirect_to: `${window.location.origin}/auth/callback/${provider}`,
    })

    // 跳转到授权页面
    window.location.href = response.data.auth_url
  } catch (_error) {
    Message.error('OAuth 登录初始化失败')
  }
}

// Telegram 登录
const handleTelegramLogin = (): void => {
  Message.info('Telegram 登录功能开发中...')
}

// 前往注册页
const handleGoRegister = (): void => {
  router.push('/register')
}

// 忘记密码
const handleForgotPassword = (): void => {
  router.push('/forgot-password')
}
</script>
