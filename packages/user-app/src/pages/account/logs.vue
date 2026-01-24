<template>
  <div class="p-6">
    <h1 class="mb-6 text-2xl font-bold">登录日志</h1>
    <a-table :columns="columns" :data="logs" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const logs = ref<{ id: number; time: string; ip: string; device: string; status: string }[]>([])

const columns = [
  { title: '时间', dataIndex: 'time' },
  { title: 'IP 地址', dataIndex: 'ip' },
  { title: '设备', dataIndex: 'device' },
  { title: '状态', dataIndex: 'status' },
]

onMounted(() => {
  // TODO: 获取登录日志
  logs.value = [{ id: 1, time: '2024-01-01 10:00:00', ip: '192.168.1.1', device: 'Chrome/Windows', status: '成功' }]
})
</script>
