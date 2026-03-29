import apiClient from './client'
import type { ApiResponse, AdminMetrics, AdminTenant, TeamMember, Contact, Call, ApiLog, PaginationParams } from '@/types'

export interface AdminListParams extends PaginationParams {
  search?: string
  status?: string
}

export const adminApi = {
  stats: () =>
    apiClient.get<ApiResponse<AdminMetrics>>('/admin/stats'),

  // Tenants
  listTenants: (params?: AdminListParams) =>
    apiClient.get<ApiResponse<AdminTenant[]>>('/admin/tenants', { params }),

  getTenant: (id: number) =>
    apiClient.get<ApiResponse<AdminTenant>>(`/admin/tenants/${id}`),

  updateTenantStatus: (id: number, status: string) =>
    apiClient.put<ApiResponse<AdminTenant>>(`/admin/tenants/${id}/status`, { status }),

  // Users
  listUsers: (params?: AdminListParams) =>
    apiClient.get<ApiResponse<TeamMember[]>>('/admin/users', { params }),

  // Contacts (all tenants)
  listContacts: (params?: AdminListParams) =>
    apiClient.get<ApiResponse<Contact[]>>('/admin/contacts', { params }),

  // Calls (all tenants)
  listCalls: (params?: AdminListParams) =>
    apiClient.get<ApiResponse<Call[]>>('/admin/calls', { params }),

  // Logs
  listLogs: (params?: AdminListParams & { method?: string; statusCode?: number }) =>
    apiClient.get<ApiResponse<ApiLog[]>>('/admin/logs', { params }),
}
