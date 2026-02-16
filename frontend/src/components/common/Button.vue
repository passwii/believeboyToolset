<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'success' | 'error' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'glass-btn',
      {
        'bg-gradient-to-r from-primary-500 to-accent-purple-500 border-primary-400 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]': variant === 'primary',
        'bg-gradient-to-r from-accent-green-500 to-accent-green-600 border-accent-green-400 hover:shadow-[0_4px_12px_rgba(34,197,94,0.4)]': variant === 'success',
        'bg-gradient-to-r from-accent-red-500 to-accent-red-600 border-accent-red-400 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)]': variant === 'error',
        'hover:bg-white/20': variant === 'ghost',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-6 py-3': size === 'md',
        'px-8 py-4 text-lg': size === 'lg',
        'opacity-50 cursor-not-allowed': disabled || loading,
      }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin mr-2" />
    <slot />
  </button>
</template>
