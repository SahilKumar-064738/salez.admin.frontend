import apiClient, { idempotentPost } from './client'
import type {
  ApiResponse,
  Campaign,
  PaginationParams,
} from '@/types'

export const campaignsApi = {
  list: (params?: PaginationParams & { status?: string; sort?: string }) =>
    apiClient.get<ApiResponse<Campaign[]>>('/campaigns', { params }),

  get: (id: number) => apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`),

  create: (payload: {
    name: string
    templateId: number
    whatsappAccountId: number
    contactIds?: number[]
    tagFilter?: string
    scheduledAt?: string | null
  }) => apiClient.post<ApiResponse<Campaign>>('/campaigns', payload),

  send: (id: number) =>
    idempotentPost<{ campaignId: number; status: string; message: string }>(
      `/campaigns/${id}/send`,
    ),

  cancel: (id: number) =>
    apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/cancel`),
}

export const templatesApi = {
  list: (params?: PaginationParams & { status?: string; category?: string; search?: string }) =>
    apiClient.get('/campaigns/templates', { params }),

  get: (id: number) => apiClient.get(`/campaigns/templates/${id}`),

  create: (payload: {
    name: string
    content: string
    variables: string[]
    category: string
  }) => apiClient.post('/campaigns/templates', payload),

  update: (id: number, payload: unknown) =>
    apiClient.put(`/campaigns/templates/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/campaigns/templates/${id}`),
}
