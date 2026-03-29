import apiClient from './client'
import type {
  ApiResponse,
  Contact,
  ContactStats,
  PaginationParams,
} from '@/types'

export interface ContactFilters extends PaginationParams {
  search?: string
  stage?: string
  tag?: string
  sort?: 'createdAt' | 'lastActive' | 'name'
  order?: 'asc' | 'desc'
}

export const contactsApi = {
  list: (params?: ContactFilters) =>
    apiClient.get<ApiResponse<Contact[]>>('/contacts', { params }),

  stats: () => apiClient.get<ApiResponse<ContactStats>>('/contacts/pipeline-stats'),

  get: (id: number) => apiClient.get<ApiResponse<Contact>>(`/contacts/${id}`),

  create: (payload: Partial<Contact>) =>
    apiClient.post<ApiResponse<Contact>>('/contacts', payload),

  update: (id: number, payload: Partial<Contact>) =>
    apiClient.put<ApiResponse<Contact>>(`/contacts/${id}`, payload),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/contacts/${id}`),

  addTags: (id: number, tags: string[]) =>
    apiClient.post<ApiResponse<string[]>>(`/contacts/${id}/tags`, { tags }),

  removeTag: (id: number, tag: string) =>
    apiClient.delete<ApiResponse<{ removed: boolean }>>(`/contacts/${id}/tags/${tag}`),
}
