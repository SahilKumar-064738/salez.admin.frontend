import apiClient from './client'
import type { ApiResponse, Call, CallStats, CallEvent, CallMetrics, CallTranscript, CallRecording, PaginationParams } from '@/types'

export interface CallFilters extends PaginationParams {
  status?: string
  direction?: 'inbound' | 'outbound'
  from?: string
  to?: string
  contactId?: number
}

export const callsApi = {
  list: (params?: CallFilters) =>
    apiClient.get<ApiResponse<Call[]>>('/calls', { params }),

  stats: (params?: { from?: string; to?: string }) =>
    apiClient.get<ApiResponse<CallStats>>('/calls/stats', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Call>>(`/calls/${id}`),

  events: (id: string) =>
    apiClient.get<ApiResponse<CallEvent[]>>(`/calls/${id}/events`),

  metrics: (id: string) =>
    apiClient.get<ApiResponse<CallMetrics>>(`/calls/${id}/metrics`),

  transcript: (id: string) =>
    apiClient.get<ApiResponse<CallTranscript[]>>(`/calls/${id}/transcript`),

  recording: (id: string) =>
    apiClient.get<ApiResponse<CallRecording>>(`/calls/${id}/recording`),
}
