<template>
  <div class="error-page flex flex-col items-center justify-center min-h-screen">
    <a-result
      status="403"
      title="403"
      subtitle="抱歉，您没有权限访问此页面"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="goHome">
            返回首页
          </a-button>
          <a-button @click="goBack">
            返回上一页
          </a-button>
        </a-space>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>