<template>
  <div class="p-6">
    <div class="glass-card mb-6 p-6">
      <h1 class="text-2xl font-bold text-white mb-2">欢迎回来，{{ userName }}</h1>
      <p class="text-white/60">今天是个好日子，开始你的工作吧！</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">今日报告</h3>
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-3xl font-bold text-white mb-2">12</p>
        <p class="text-white/60 text-sm">已完成的报告</p>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">待处理任务</h3>
          <span class="text-2xl">📋</span>
        </div>
        <p class="text-3xl font-bold text-white mb-2">5</p>
        <p class="text-white/60 text-sm">需要你的注意</p>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">系统状态</h3>
          <span class="text-2xl">✅</span>
        </div>
        <p class="text-lg font-bold text-green-400 mb-2">正常运行</p>
        <p class="text-white/60 text-sm">所有服务正常</p>
      </div>
    </div>

    <div class="glass-card mt-6 p-6">
      <h3 class="text-lg font-semibold text-white mb-4">快捷操作</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="glass-btn text-center text-sm">产品分析</button>
        <button class="glass-btn text-center text-sm">月度报告</button>
        <button class="glass-btn text-center text-sm">店铺管理</button>
        <button class="glass-btn text-center text-sm">系统日志</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userName = computed(() => authStore.user?.chineseName || authStore.user?.username || '用户')
</script>
