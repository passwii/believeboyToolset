<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const userName = computed(() => authStore.user?.chineseName || authStore.user?.username || '用户')
const userInitial = computed(() => userName.value.charAt(0))

const handleLogout = async () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-slate-900/50">
    <div class="flex h-16 items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-white">
          彼得扶运营中心
        </h1>
      </div>

      <div class="relative">
        <button
          class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
          @click="handleLogout"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
            {{ userInitial }}
          </div>
          <span class="text-sm font-medium text-white/90">{{ userName }}</span>
          <i class="fas fa-sign-out-alt text-xs text-white/50" />
        </button>
      </div>
    </div>
  </header>
</template>
