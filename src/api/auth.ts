import apiClient from './client'
import type {
  ApiResponse,
  AuthUser,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
} from '@/types'

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthTokens & { user: AuthUser }>>(
      '/auth/register',
      payload,
    ),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthTokens & { user: AuthUser }>>('/auth/login', payload),

  logout: () => apiClient.post<ApiResponse<{ message: string }>>('/auth/logout'),

  me: () => apiClient.get<ApiResponse<AuthUser>>('/auth/me'),

  changePassword: (payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),
}
