<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNavigationStore } from '@/stores/navigation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const navigationStore = useNavigationStore()

const isAdmin = computed(() => authStore.user?.role === 'admin')

function toggleCategory(categoryId: string) {
  navigationStore.toggleCategory(categoryId)
}

function navigateTo(itemId: string) {
  navigationStore.setActiveItem(itemId)
  router.push(`/${itemId}`)
}
</script>

<template>
  <nav class="glass-sidebar flex h-full w-64 flex-col">
    <div class="flex flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        <li v-for="category in navigationStore.navigationItems" :key="category.id" class="mb-4">
          <button
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            @click="toggleCategory(category.id)"
          >
            <i :class="`fas ${category.icon}`" />
            <span>{{ category.label }}</span>
            <i
              :class="[
                'fas fa-chevron-right ml-auto text-xs transition-transform',
                navigationStore.expandedCategories.has(category.id) ? 'rotate-90' : ''
              ]"
            />
          </button>

          <ul
            v-show="navigationStore.expandedCategories.has(category.id)"
            class="mt-1 space-y-1 pl-2"
          >
            <li v-for="item in category.children" :key="item.id" class="relative">
              <button
                v-if="!item.adminOnly || isAdmin"
                :class="[
                  'flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer',
                  route.name === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white/95'
                ]"
                @click="navigateTo(item.id)"
              >
                <i :class="`fas ${item.icon} text-sm`" />
                <span class="text-sm">{{ item.label }}</span>
                <span
                  v-if="item.adminOnly"
                  class="ml-auto rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400"
                >
                  Admin
                </span>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>
