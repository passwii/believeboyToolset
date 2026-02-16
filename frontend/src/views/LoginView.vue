<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="glass-card w-full max-w-md p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-white">
          彼得扶运营中心
        </h1>
        <p class="mt-2 text-sm text-white/60">登录到您的账户</p>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-white/90">用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            class="glass-input w-full"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-white/90">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="glass-input w-full"
          />
        </div>

        <div v-if="error" class="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {{ error }}
        </div>

        <button
          type="submit"
          class="glass-btn w-full text-center"
        >
          登录
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-white/60">
        <p>测试默认账号: admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  try {
    authStore.setUser({
      id: 1,
      username: username.value,
      role: username.value === 'damonrock' ? 'admin' : 'user',
      chineseName: username.value,
    })
    router.push('/')
  } catch (err: any) {
    error.value = err.message || '登录失败，请重试'
  }
}
</script>
