import axios, { type AxiosError } from 'axios'
import { useAuth } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuth.getState().user?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const refresh = useAuth.getState().user?.refreshToken
      if (refresh && !error.config?.url?.includes('/auth/refresh')) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh })
          useAuth.getState().setAuth(data)
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${data.accessToken}`
            return api.request(error.config)
          }
        } catch {
          useAuth.getState().logout()
        }
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { title?: string; detail?: string; message?: string } | string
    if (typeof d === 'string') return d
    return d?.detail || d?.title || d?.message || err.message
  }
  if (err instanceof Error) return err.message
  return 'Unknown error'
}
