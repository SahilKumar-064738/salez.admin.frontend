import apiClient, { idempotentPost } from './client'
import type { ApiResponse, InboxItem, Message, SendMessagePayload, PaginationParams } from '@/types'

export const messagesApi = {
  inbox: (params?: PaginationParams & { unreadOnly?: boolean; search?: string }) =>
    apiClient.get<ApiResponse<InboxItem[]>>('/messages/inbox', { params }),

  thread: (contactId: number, params?: PaginationParams & { before?: string }) =>
    apiClient.get<ApiResponse<Message[]>>(`/messages/conversation/${contactId}`, { params }),

  send: (payload: SendMessagePayload) =>
    idempotentPost<{ messageId: number; status: string; externalMessageId: string | null }>(
      '/messages/send',
      payload,
    ),

  markRead: (contactId: number) =>
    apiClient.put<ApiResponse<{ markedRead: number }>>(
      `/messages/conversation/${contactId}/read`,
    ),
}
