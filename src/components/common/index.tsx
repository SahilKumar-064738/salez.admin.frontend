import React from 'react'
import { cn, initials } from '@/utils'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-gray-300 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

export function Avatar({
  name,
  size = 'sm',
  className,
}: {
  name: string | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const safeName = name || '?'
  const colorIdx = (safeName.charCodeAt(0) || 0) % AVATAR_COLORS.length
  const sizeClass = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size]
  return (
    <div className={cn('rounded-full flex items-center justify-center font-medium flex-shrink-0', AVATAR_COLORS[colorIdx], sizeClass, className)}>
      {initials(safeName)}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'success' | 'danger' | 'warning' | 'info' | 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// ─── Live Dot ─────────────────────────────────────────────────────────────────

export function LiveDot({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  loading,
  icon,
}: {
  label: string
  value: string | number
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
  loading?: boolean
  icon?: React.ReactNode
}) {
  const deltaColor = { up: 'text-green-600', down: 'text-red-500', neutral: 'text-gray-400' }[deltaType]
  if (loading) return <SkeletonCard />
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        {icon && <span className="text-gray-300">{icon}</span>}
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value ?? '—'}</p>
      {delta && <p className={cn('text-xs mt-1', deltaColor)}>{delta}</p>}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="flex gap-0 border-b border-gray-100 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors',
            active === tab
              ? 'border-brand-400 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── Table Pagination ─────────────────────────────────────────────────────────

export function TablePagination({
  hasMore,
  onNext,
  onPrev,
  loading,
  total,
  shown,
}: {
  hasMore?: boolean
  onNext: () => void
  onPrev: () => void
  loading?: boolean
  total?: number
  shown?: number
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
      <span>
        {total !== undefined && shown !== undefined
          ? `Showing ${shown.toLocaleString()} of ${total.toLocaleString()}`
          : ''}
      </span>
      <div className="flex gap-1.5">
        <button className="btn text-xs py-1 px-2.5" onClick={onPrev} disabled={loading}>
          ← Prev
        </button>
        <button className="btn text-xs py-1 px-2.5" onClick={onNext} disabled={!hasMore || loading}>
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 1, color = 'bg-brand-400' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('input', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('select', props.className)} />
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Mono text ────────────────────────────────────────────────────────────────

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('font-mono text-xs', className)}>{children}</span>
}
