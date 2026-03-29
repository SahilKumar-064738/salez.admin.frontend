import { useQueryClient } from '@tanstack/react-query'

// NOTE: Supabase realtime is not used by the Salez backend.
// Real-time updates are achieved through React Query's refetchInterval.
// These hooks are no-ops kept for API compatibility.

/**
 * No-op: inbox updates are polled via refetchInterval in MessagesPage.
 */
export function useInboxRealtime() {
  // Polling handled by: refetchInterval: 15_000 in MessagesPage
}

/**
 * No-op: no calls endpoints in Salez backend.
 */
export function useCallsRealtime() {
  // No calls endpoints available in Salez backend
}

/**
 * No-op: campaign updates are polled via React Query invalidation on mutation.
 */
export function useCampaignRealtime(_campaignId?: number) {
  // Campaign updates triggered by sendMut/cancelMut invalidation
}
