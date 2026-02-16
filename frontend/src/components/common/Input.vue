<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="space-y-1">
    <input
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'glass-input w-full',
        {
          'border-accent-red-500 focus:border-accent-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]': error,
          'opacity-50 cursor-not-allowed': disabled,
        }
      ]"
    >
    <p v-if="error" class="text-sm text-accent-red-400">{{ error }}</p>
  </div>
</template>
