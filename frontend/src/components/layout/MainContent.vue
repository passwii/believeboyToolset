<script setup lang="ts">
import { watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  return route.meta.title || '彼励扶运营中心'
})

watch(() => route.path, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <main class="flex-1 overflow-hidden">
    <div class="h-full overflow-y-auto px-6 py-8">
      <div v-if="route.name === 'home'" class="flex flex-col items-center justify-center gap-6 py-12">
        <div class="glass-card p-12 text-center max-w-xl">
          <div class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple-500 text-3xl">
            <i class="fas fa-rocket text-white" />
          </div>
          <h2 class="mb-3 text-3xl font-bold text-white">
            Hi，欢迎回来
          </h2>
          <p class="mb-8 text-lg text-white/70">
            探索强大的工具集，提升您的运营效率
          </p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <button class="glass-btn" @click="$router.push('/yumai-analysis')">
              <i class="fas fa-chart-line mr-2" />
              数据分析
            </button>
            <button class="glass-btn" @click="$router.push('/operations-nav')">
              <i class="fas fa-compass mr-2" />
              运营导航
            </button>
            <button class="glass-btn" @click="$router.push('/exchange-rate-display')">
              <i class="fas fa-tools mr-2" />
              实用工具
            </button>
            <button class="glass-btn" @click="$router.push('/update-log')">
              <i class="fas fa-history mr-2" />
              更新日志
            </button>
          </div>
        </div>
      </div>
      <RouterView v-else />
    </div>
  </main>
</template>
