import { boot } from 'quasar/wrappers'
import axios, { AxiosError, type AxiosInstance } from 'axios'
import { router } from '../router/routes'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export interface ApiError extends AxiosError {
  response?: AxiosError['response'] & {
    data?: {
      message?: string;
      detail?: string;
    };
  };
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

let isRedirecting = false

api.interceptors.response.use(response => {
  return response
}, (error: ApiError) => {
  if (!error.response) {
    if (!navigator.onLine) {
      return Promise.reject(new Error('Sem conexão.'))
    }
    return Promise.reject(new Error('Erro de rede, tente novamente mais tarde.'))
  }

  if (error.response.status === 401 && router.currentRoute.value.name === 'login') {
    return Promise.reject(new Error(`Erro de validação: ${error.response?.data?.detail || 'Erro desconhecido.'}`))
  }

  if (error.response?.status === 401) {
    const unauthorizedError = new Error(error.response?.data?.detail || 'Não autorizado.')

    if (!isRedirecting) {
      isRedirecting = true

      const currentPath = router.currentRoute.value.path

      router.push({
        name: 'login',
        query: currentPath !== '/login' ? { redirect: currentPath } : {}
      }).finally(() => {
        setTimeout(() => {
          isRedirecting = false
        }, 500)
      })
    }

    return Promise.reject(unauthorizedError)
  }

  if (error.response?.status === 422) {
    const data = error.response?.data

    if (data?.detail) {
      return Promise.reject(new Error(`Erro de validação: ${data.detail}`))
    }

    if (typeof data === 'object' && data !== null) {
      const messages = Object.entries(data).flatMap(([, errors]) => {
        if (typeof errors === 'object') {
          return Object.values(errors)
        }
        return errors
      })

      const finalMessage = messages.length ? messages.join(' | ') : 'Erro de validação.'

      return Promise.reject(new Error(finalMessage))
    }

    return Promise.reject(new Error('Erro de validação desconhecido.'))
  }

  return Promise.reject(error)
})

import type { App } from 'vue'

export default boot(({ app }: { app: App }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
