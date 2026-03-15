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
        <a-form-item v-if="showCaptcha" label="安全验证">
          <TurnstileWidget
            ref="turnstileRef"
            :site-key="turnstileSiteKey"
            action="login"
            @token="handleCaptchaToken"
            @expired="handleCaptchaExpired"
            @error="handleCaptchaError"
          />
        </a-form-item>
        <a-button type="primary" html-type="submit" long :loading="loading">登录</a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginEmailRequest } from '@paigram/shared-components'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const captchaToken = ref('')
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || ''
const showCaptcha = ref(false)

const loginForm = reactive<LoginEmailRequest>({
  email: '',
  password: '',
  captcha_token: undefined,
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

  if (showCaptcha.value) {
    if (!turnstileSiteKey) {
      Message.error('当前站点未配置安全验证，请联系管理员')
      return
    }
    if (!captchaToken.value) {
      Message.warning('请先完成安全验证')
      return
    }
  }

  loading.value = true
  try {
    values.captcha_token = showCaptcha.value ? captchaToken.value : undefined

    // 使用 authStore 的登录方法，它会自动处理 token 保存和用户信息获取
    await authStore.loginWithEmail(values)

    // 跳转到控制台
    await router.push('/dashboard')
  } catch (error: unknown) {
    console.error('Login failed:', error)
    if (isCaptchaError(error)) {
      showCaptcha.value = true
      captchaToken.value = ''
      await nextTick()
      turnstileRef.value?.reset()
    }
  } finally {
    loading.value = false
  }
}

const handleCaptchaToken = (token: string): void => {
  captchaToken.value = token
  loginForm.captcha_token = token
}

const handleCaptchaExpired = (): void => {
  captchaToken.value = ''
  loginForm.captcha_token = undefined
}

const handleCaptchaError = (message: string): void => {
  captchaToken.value = ''
  loginForm.captcha_token = undefined
  Message.warning(message)
}

function isCaptchaError(error: unknown): boolean {
  const errorCode = (error as { code?: string })?.code
  return errorCode === 'CAPTCHA_REQUIRED' || errorCode === 'CAPTCHA_FAILED'
}
</script>
