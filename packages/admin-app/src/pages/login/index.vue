<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_42%),linear-gradient(135deg,_#020617,_#111827_55%,_#0f172a)]"></div>
    <div class="absolute -left-16 top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"></div>
    <div class="absolute -right-8 bottom-10 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl"></div>

    <div class="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-sky-950/30 backdrop-blur">
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Paigram Console</p>
        <h1 class="mt-3 text-3xl font-bold text-slate-900">管理后台登录</h1>
        <p class="mt-2 text-sm text-slate-500">使用管理员账号完成验证后进入控制台。</p>
      </div>

      <a-form :model="loginForm" :rules="rules" layout="vertical" @submit="handleSubmit">
        <a-form-item field="email" label="邮箱">
          <a-input v-model="loginForm.email" placeholder="请输入邮箱" :disabled="showTwoFactorStep" />
        </a-form-item>

        <a-form-item field="password" label="密码">
          <a-input-password v-model="loginForm.password" placeholder="请输入密码" :disabled="showTwoFactorStep" />
        </a-form-item>

        <a-form-item v-if="showTwoFactorStep" field="totp_code" label="验证码或备用恢复码">
          <AuthTwoFactorStep
            v-model:code="loginForm.totp_code"
            v-model:trust-device="loginForm.trust_device"
            :message="twoFactorMessage"
          />
        </a-form-item>

        <div class="mb-6 flex items-center justify-between text-sm">
          <span class="text-slate-500">{{ showTwoFactorStep ? '请完成二级认证后继续' : '支持动态验证码与恢复码' }}</span>
          <a-link @click="showTwoFactorStep ? resetTwoFactorStep() : undefined" :class="showTwoFactorStep ? '' : 'pointer-events-none opacity-0'">
            返回上一步
          </a-link>
        </div>

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

        <a-button type="primary" html-type="submit" long :loading="loading">
          {{ showTwoFactorStep ? '验证并进入控制台' : '登录' }}
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { AuthTwoFactorStep, TurnstileWidget } from '@paigram/shared-components'
import { useAuthStore } from '@/stores/auth'
import type { LoginEmailRequest } from '@paigram/shared-components'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const captchaToken = ref('')
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || ''
const showCaptcha = ref(false)
const showTwoFactorStep = ref(false)
const twoFactorMessage = ref('')

const loginForm = reactive<LoginEmailRequest>({
  email: '',
  password: '',
  totp_code: '',
  trust_device: false,
  captcha_token: undefined,
})

const rules = {
  email: [{ required: true, message: '请输入邮箱' }],
  password: [{ required: true, message: '请输入密码' }],
  totp_code: [{ minLength: 6, message: '验证码长度不能少于6位' }],
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
    values.totp_code = normalizeTOTPCode(loginForm.totp_code)
    values.trust_device = showTwoFactorStep.value ? !!loginForm.trust_device : false

    if (showTwoFactorStep.value && !values.totp_code) {
      Message.warning('请输入 2FA 验证码或备用恢复码')
      return
    }

    const result = await authStore.loginWithEmail(values)

    if (result.status === 'requires_totp') {
      showTwoFactorStep.value = true
      twoFactorMessage.value = result.message || ''
      loginForm.totp_code = ''
      loginForm.trust_device = false
      return
    }

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

const resetTwoFactorStep = (): void => {
  showTwoFactorStep.value = false
  twoFactorMessage.value = ''
  loginForm.totp_code = ''
  loginForm.trust_device = false
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

function normalizeTOTPCode(code: string | undefined): string | undefined {
  const normalized = code?.trim().replace(/\s+/g, '')
  return normalized || undefined
}
</script>
