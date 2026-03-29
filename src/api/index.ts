import apiClient from './client'
import type {
  ApiResponse,
  ApiKey,
  WhatsAppAccount,
} from '@/types'

// ─── WhatsApp Accounts ────────────────────────────────────────────────────────

export const whatsappApi = {
  list: () => apiClient.get<ApiResponse<WhatsAppAccount[]>>('/whatsapp-accounts'),

  get: (id: number) => apiClient.get<ApiResponse<WhatsAppAccount>>(`/whatsapp-accounts/${id}`),

  create: (payload: {
    phoneNumber: string
    displayName: string
    provider: string
    apiToken: string
  }) => apiClient.post<ApiResponse<WhatsAppAccount>>('/whatsapp-accounts', payload),

  update: (id: number, payload: Partial<WhatsAppAccount> & { apiToken?: string }) =>
    apiClient.put<ApiResponse<WhatsAppAccount>>(`/whatsapp-accounts/${id}`, payload),

  disconnect: (id: number) =>
    apiClient.delete<ApiResponse<{ ok: boolean }>>(`/whatsapp-accounts/${id}`),
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apiKeysApi = {
  list: () => apiClient.get<ApiResponse<ApiKey[]>>('/api-keys'),

  create: (payload: { name: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.post<ApiResponse<ApiKey & { key: string; warning: string }>>('/api-keys', payload),

  revoke: (id: number) => apiClient.delete(`/api-keys/${id}`),
}
