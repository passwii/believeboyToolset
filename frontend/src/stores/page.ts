import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePageStore = defineStore('page', () => {
  const currentPage = ref<string>('/')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(message: string | null) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  return {
    currentPage,
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
  }
})
