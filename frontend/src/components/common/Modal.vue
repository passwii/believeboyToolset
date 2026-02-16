<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title?: string
}>()

defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

if (import.meta.env.SSR) {
  await new Promise((resolve) => setTimeout(resolve, 100))
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <div class="glass-modal-backdrop absolute inset-0" />
        <div class="glass-modal relative flex max-h-full w-full flex-col">
          <div v-if="title" class="border-b border-white/10 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <slot />
          </div>
          <div class="border-t border-white/10 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .glass-modal,
.modal-leave-active .glass-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .glass-modal,
.modal-leave-to .glass-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
