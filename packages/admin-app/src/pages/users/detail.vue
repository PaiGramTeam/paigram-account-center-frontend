<template>
  <div class="p-6">
    <h1 class="mb-4 text-2xl font-bold">用户详情</h1>
    <a-card>
      <p>用户 ID: {{ $route.params.id }}</p>
    </a-card>
  </div>
</template>

<script setup lang="ts"></script>
