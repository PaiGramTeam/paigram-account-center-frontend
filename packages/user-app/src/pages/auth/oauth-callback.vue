<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="text-center">
      <a-spin :loading="loading" tip="正在处理授权...">
        <div v-if="error" class="text-red-500">{{ error }}</div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const { provider } = route.params
  const { code } = route.query

  if (!code) {
    error.value = '授权失败：缺少授权码'
    loading.value = false
    return
  }

  try {
    // TODO: 调用 OAuth 回调 API
    Message.success('授权成功')
    router.push('/dashboard')
  } catch (_error) {
    error.value = `${provider} 授权失败`
    Message.error(error.value)
  } finally {
    loading.value = false
  }
})
</script>
