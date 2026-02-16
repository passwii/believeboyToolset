<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'

const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = '请填写所有字段'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = '新密码长度至少为6位'
    return
  }

  loading.value = true
  try {
    await api.post('/auth/change-password', {
      current_password: currentPassword.value,
      new_password: newPassword.value
    })
    
    success.value = '密码修改成功！请使用新密码重新登录。'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || '密码修改失败，请检查当前密码是否正确'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="glass-card p-8">
      <div class="mb-8 text-center">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple-500 mb-4">
          <i class="fas fa-key text-2xl text-white"></i>
        </div>
        <h1 class="text-2xl font-bold text-white">更改密码</h1>
        <p class="mt-2 text-white/60">为了账户安全，请定期更新您的密码</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="form-group">
          <label class="form-label flex items-center gap-2">
            <i class="fas fa-lock text-white/50 text-sm"></i>
            当前密码
          </label>
          <input
            v-model="currentPassword"
            type="password"
            class="glass-input w-full"
            placeholder="请输入当前密码"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label flex items-center gap-2">
            <i class="fas fa-lock text-white/50 text-sm"></i>
            新密码
          </label>
          <input
            v-model="newPassword"
            type="password"
            class="glass-input w-full"
            placeholder="请输入新密码（至少6位）"
            :disabled="loading"
          />
          <p class="text-xs text-white/40 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            密码长度至少为6位
          </p>
        </div>

        <div class="form-group">
          <label class="form-label flex items-center gap-2">
            <i class="fas fa-lock text-white/50 text-sm"></i>
            确认新密码
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            class="glass-input w-full"
            placeholder="请再次输入新密码"
            :disabled="loading"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="notification error">
          <i class="fas fa-exclamation-circle text-lg"></i>
          <span>{{ error }}</span>
        </div>

        <!-- 成功提示 -->
        <div v-if="success" class="notification success">
          <i class="fas fa-check-circle text-lg"></i>
          <span>{{ success }}</span>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            class="glass-btn primary w-full"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-save mr-2"></i>
            {{ loading ? '保存中...' : '修改密码' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
