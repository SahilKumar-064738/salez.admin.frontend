import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(iso: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!iso) return '—'
  try { return format(parseISO(iso), fmt) } catch { return '—' }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try { return format(parseISO(iso), 'MMM d, yyyy · h:mm a') } catch { return '—' }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }) } catch { return '—' }
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try { return format(parseISO(iso), 'h:mm a') } catch { return '—' }
}

// ─── Number helpers ───────────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function formatBytes(bytes: number): string {
  const mb = bytes / 1_048_576
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? `${str.slice(0, max)}…` : str
}

export function maskApiKey(prefix: string): string {
  return `${prefix}••••••••••••••••••••••••`
}

// ─── Class name helper ────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export function callStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success'
    case 'in-progress':
    case 'ringing': return 'badge-info'
    case 'failed':
    case 'busy': return 'badge-danger'
    case 'no-answer': return 'badge-warning'
    default: return 'badge-gray'
  }
}

export function campaignStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success'
    case 'running': return 'badge-info'
    case 'failed': return 'badge-danger'
    case 'paused':
    case 'scheduled': return 'badge-warning'
    case 'cancelled': return 'badge-gray'
    default: return 'badge-gray'
  }
}

export function contactStageColor(stage: string): string {
  switch (stage) {
    case 'converted': return 'badge-success'
    case 'qualified': return 'badge-info'
    case 'contacted': return 'badge-warning'
    case 'lost': return 'badge-danger'
    default: return 'badge-gray'
  }
}

export function messageStatusColor(status: string): string {
  switch (status) {
    case 'delivered':
    case 'read': return 'badge-success'
    case 'sent': return 'badge-info'
    case 'pending': return 'badge-warning'
    case 'failed': return 'badge-danger'
    default: return 'badge-gray'
  }
}
