import axios, { AxiosError, type AxiosInstance } from 'axios'

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


api.interceptors.response.use(response => {
  return response
}, (error: ApiError) => {
  if (!error.response) {
    if (!navigator.onLine) {
      return Promise.reject(new Error('Sem conexão.'))
    }
    return Promise.reject(new Error('Erro de rede, tente novamente mais tarde.'))
  }


  if (error.response?.status === 401) {
    const unauthorizedError = new Error(error.response?.data?.detail || 'Não autorizado.')


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

export { api }
