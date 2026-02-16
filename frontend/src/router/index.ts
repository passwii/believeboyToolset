import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { NavigationItem } from '@/types'
import { NAVIGATION_ITEMS } from '@/lib/constants'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
]

NAVIGATION_ITEMS.forEach((category) => {
  category.children?.forEach((item) => {
    routes.push({
      path: `/${item.id}`,
      name: item.id,
      component: () => import(`@/views/${formatViewName(item.id)}.vue`),
      meta: {
        requiresAuth: true,
        adminOnly: item.adminOnly,
      },
    })
  })
})

function formatViewName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'View'
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.adminOnly && authStore.user?.role !== 'admin') {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
