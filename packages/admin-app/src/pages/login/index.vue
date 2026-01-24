<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 class="mb-6 text-center text-2xl font-bold text-gray-900">管理后台登录</h1>
      <a-form :model="loginForm" :rules="rules" layout="vertical" @submit="handleSubmit">
        <a-form-item field="email" label="邮箱">
          <a-input v-model="loginForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="loginForm.password" placeholder="请输入密码" />
        </a-form-item>
        <a-button type="primary" html-type="submit" long :loading="loading">登录</a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginEmailRequest } from '@paigram/shared-components'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const loginForm = reactive<LoginEmailRequest>({
  email: '',
  password: '',
})

const rules = {
  email: [{ required: true, message: '请输入邮箱' }],
  password: [{ required: true, message: '请输入密码' }],
}

interface FormSubmitData {
  values: LoginEmailRequest
  errors: Record<string, string> | undefined
}

const handleSubmit = async ({ values, errors }: FormSubmitData): Promise<void> => {
  if (errors) return

  loading.value = true
  try {
    // 使用 authStore 的登录方法，它会自动处理 token 保存和用户信息获取
    await authStore.loginWithEmail(values)

    // 跳转到控制台
    await router.push('/dashboard')
  } catch (error: unknown) {
    // 错误信息已在 authStore 中处理
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>
