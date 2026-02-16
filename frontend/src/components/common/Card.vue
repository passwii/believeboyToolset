<script setup lang="ts">
defineProps<{
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
  <div
    :class="[
      'glass-card',
      {
        'hover:border-white/25 hover:-translate-y-0.5 hover:shadow-glass-xl': hoverable,
        'p-0': padding === 'none',
        'p-4': padding === 'sm',
        'p-6': padding === 'md',
        'p-8': padding === 'lg',
        'p-10': padding === 'xl',
      }
    ]"
  >
    <slot />
  </div>
</template>
