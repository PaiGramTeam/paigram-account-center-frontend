<template>
  <div class="app-footer flex items-center justify-center h-12 px-6 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
    <div>
      <span>{{ copyright }}</span>
      <a-divider direction="vertical" />
      <a href="https://github.com/PaiGramTeam" target="_blank" class="hover:text-blue-500">
        GitHub
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  copyright?: string
}

const props = withDefaults(defineProps<Props>(), {
  copyright: `© ${new Date().getFullYear()} PaiGram Team. All rights reserved.`
})
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--color-border-1);
}
</style>