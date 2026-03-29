import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import type { ApiResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Request-ID'] = `req_${uuidv4().replace(/-/g, '').slice(0, 12)}`
  return config
})

// Track if a token refresh is in progress to avoid concurrent refreshes
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// ─── Response interceptor: handle 401 / errors ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<null>>) => {
    const status = error.response?.status
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // No refresh token — clear and redirect once
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient.request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const resp = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken } = resp.data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        onRefreshed(accessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient.request(originalRequest)
      } catch {
        // Refresh failed — clear auth and redirect
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth-store')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 429) {
      toast.error('Rate limit reached. Please slow down.')
    }

    if (status && status >= 500) {
      toast.error('Server error. Please try again.')
    }

    const apiErr = error.response?.data?.error
    return Promise.reject(apiErr || error)
  },
)

// ─── Idempotency-safe POST ─────────────────────────────────────────────────
export function idempotentPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) {
  const idempotencyKey = uuidv4()
  return apiClient.post<ApiResponse<T>>(url, data, {
    ...config,
    headers: {
      ...(config?.headers || {}),
      'Idempotency-Key': idempotencyKey,
    },
  })
}

export default apiClient
