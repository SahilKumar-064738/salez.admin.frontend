// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiMeta {
  cursor?: string
  hasMore?: boolean
  total?: number
  requestId?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ApiMeta
  error?: ApiError | null
}

export interface ApiError {
  code: string
  message: string
  status: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: 'owner' | 'admin' | 'member'
  tenantId: number
  tenantName: string
  tenantSlug: string
  isActive: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  businessName: string
  email: string
  password: string
  slug: string
  timezone: string
}

// ─── Tenant ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: number
  name: string
  email: string
  slug: string
  status: 'active' | 'suspended' | 'trial'
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: string
}

export interface TenantSettings {
  maxUsers: number
  maxContacts: number
  maxWhatsappAccounts: number
  maxCampaigns: number
  timezone: string
  webhookUrl: string | null
  webhookSecretConfigured: boolean
}

export interface TenantUsage {
  users: { used: number; limit: number }
  contacts: { used: number; limit: number }
  whatsappAccounts: { used: number; limit: number }
  campaigns: { used: number; limit: number }
  messagesThisMonth: number
  callsThisMonth: number
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export type ContactStage = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface Contact {
  id: number
  phone: string
  name: string
  email: string | null
  stage: ContactStage
  notes: string | null
  tags: string[]
  lastActive: string
  createdAt: string
  messageCount?: number
  callCount?: number
}

export interface ContactStats {
  total: number
  byStage: Record<ContactStage, number>
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: number
  direction: 'inbound' | 'outbound'
  content: string
  mediaUrl: string | null
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  isRead: boolean
  sentAt: string
}

export interface InboxItem {
  contactId: number
  contactName: string
  contactPhone: string
  contactStage: ContactStage
  lastMessage: string
  lastDirection: 'inbound' | 'outbound'
  lastStatus: string
  isRead: boolean
  unreadCount: number
  lastMessageAt: string
}

export interface SendMessagePayload {
  contactId: number
  whatsappAccountId: number
  content: string
  mediaUrl?: string | null
  mediaType?: string | null
  templateId?: number | null
}

// ─── WhatsApp Accounts ───────────────────────────────────────────────────────

export interface WhatsAppAccount {
  id: number
  phoneNumber: string
  displayName: string
  provider: 'meta' | 'twilio' | 'other'
  status: 'active' | 'inactive' | 'disconnected'
  connectedAt: string
  lastSentAt: string | null
  dailyMessageLimit: number
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface MessageTemplate {
  id: number
  name: string
  content: string
  variables: string[]
  category: 'marketing' | 'utility' | 'authentication'
  status: 'draft' | 'approved' | 'rejected' | 'pending'
  createdAt: string
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled' | 'failed'

export interface Campaign {
  id: number
  name: string
  templateId: number
  templateName: string
  status: CampaignStatus
  totalRecipients: number
  sentCount: number
  failedCount: number
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface CampaignStats {
  total: number
  pending: number
  sent: number
  delivered: number
  read: number
  failed: number
  optedOut: number
  deliveryRate: number
  readRate: number
  durationSeconds: number
}

export interface CampaignRecipient {
  contactId: number
  contactName: string
  contactPhone: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  errorMessage: string | null
}

// ─── Calls ───────────────────────────────────────────────────────────────────

export type CallStatus = 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy'

export interface Call {
  id: string
  direction: 'inbound' | 'outbound'
  status: CallStatus
  fromNumber: string
  toNumber: string
  contactId: number | null
  contactName: string | null
  durationSeconds: number
  cost: number
  costCurrency: string
  startedAt: string
  endedAt: string | null
  hasRecording: boolean
  hasTranscript: boolean
}

export interface CallEvent {
  id: number
  eventType: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface CallMetrics {
  sttLatencyMs: number
  llmLatencyMs: number
  ttsLatencyMs: number
  totalLatencyMs: number
  packetLoss: number
  jitterMs: number
  bitrateKbps: number
  mosScore: number
}

export interface CallTranscript {
  speaker: 'agent' | 'customer'
  content: string
  segmentStartMs: number
  segmentEndMs: number
  confidence: number
  createdAt: string
}

export interface CallRecording {
  id: number
  durationSeconds: number
  sizeBytes: number
  signedUrl: string
  expiresAt: string
}

export interface CallStats {
  totalCalls: number
  totalDurationSeconds: number
  avgDurationSeconds: number
  totalCost: number
  inbound: number
  outbound: number
  completed: number
  failed: number
  avgMosScore: number
  byDay: Array<{ date: string; calls: number; duration: number }>
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  ipAddress: string
  device: string
  location: { city: string; country: string }
  loginAt: string
  expiresAt: string
  isCurrent: boolean
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: number
  name: string
  keyPrefix: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

// ─── API Logs ─────────────────────────────────────────────────────────────────

export interface ApiLog {
  id: number
  endpoint: string
  method: string
  statusCode: number
  responseTimeMs: number
  ipAddress: string
  userId: string | null
  apiKeyId: number | null
  createdAt: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  period: { from: string; to: string }
  messages: { sent: number; received: number; deliveryRate: number }
  calls: { total: number; avgDuration: number; totalCost: number }
  contacts: { new: number; total: number; conversionRate: number }
  campaigns: { sent: number; avgReadRate: number }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminTenant {
  id: number
  name: string
  email: string
  slug: string
  status: 'active' | 'suspended' | 'trial'
  plan: 'starter' | 'pro' | 'enterprise'
  userCount: number
  contactCount: number
  createdAt: string
}

export interface AdminMetrics {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
  messagesToday: number
  callsToday: number
  revenueThisMonth: number
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  email: string
  displayName: string
  role: 'owner' | 'admin' | 'member'
  isActive: boolean
  createdAt: string
  lastSignInAt: string | null
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  cursor?: string
  limit?: number
}
