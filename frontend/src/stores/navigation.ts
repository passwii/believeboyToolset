import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import type { NavigationItem } from '@/types'

export const useNavigationStore = defineStore('navigation', () => {
  const expandedCategories = ref<Set<string>>(new Set())
  const activeItem = ref<string | null>(null)

  function toggleCategory(categoryId: string) {
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
    }
  }

  function setActiveItem(itemId: string | null) {
    activeItem.value = itemId
  }

  function clearExpanded() {
    expandedCategories.value.clear()
  }

  return {
    expandedCategories,
    activeItem,
    navigationItems: NAVIGATION_ITEMS,
    toggleCategory,
    setActiveItem,
    clearExpanded,
  }
})
