<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold">注册账号</h1>
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="email" label="邮箱">
          <a-input v-model="form.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item field="confirmPassword" label="确认密码">
          <a-input-password v-model="form.confirmPassword" placeholder="请再次输入密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" long :loading="loading">注册</a-button>
        </a-form-item>
      </a-form>
      <div class="mt-4 text-center text-sm text-gray-600">
        已有账号？<router-link to="/login" class="text-blue-500">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleSubmit = async (): Promise<void> => {
  if (form.password !== form.confirmPassword) {
    Message.error('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    // TODO: 调用注册 API
    Message.success('注册成功')
    router.push('/login')
  } catch (_error) {
    Message.error('注册失败')
  } finally {
    loading.value = false
  }
}
</script>
