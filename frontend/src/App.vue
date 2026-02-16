<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import MainContent from '@/components/layout/MainContent.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <div id="app" class="min-h-screen bg-bg-dark">
    <div v-if="!isLoginPage" class="flex h-screen flex-col">
      <Header />
      <div class="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
    <RouterView v-else />
  </div>
</template>
