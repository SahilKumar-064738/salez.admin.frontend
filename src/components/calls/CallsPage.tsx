import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, DollarSign, BarChart3 } from 'lucide-react'
import { callsApi } from '@/api/calls'
import { formatNumber, formatRelative } from '@/utils'
import { PageHeader, SkeletonTable, EmptyState, StatCard } from '@/components/common'
import type { Call, CallStatus } from '@/types'

function callStatusBadge(status: CallStatus) {
  const map: Record<CallStatus, string> = {
    completed: 'badge-success',
    failed: 'badge-danger',
    'no-answer': 'badge-warning',
    busy: 'badge-warning',
    'in-progress': 'badge-info',
    initiated: 'badge-info',
    ringing: 'badge-info',
  }
  return map[status] ?? 'badge'
}

function formatDuration(secs: number) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const STATUS_OPTIONS = ['', 'completed', 'failed', 'no-answer', 'busy', 'in-progress']
const DIRECTION_OPTIONS = ['', 'inbound', 'outbound']

export function CallsPage() {
  const [status, setStatus] = useState('')
  const [direction, setDirection] = useState<'' | 'inbound' | 'outbound'>('')
  const [cursor, setCursor] = useState<string | undefined>()

  const { data: statsData } = useQuery({
    queryKey: ['calls', 'stats'],
    queryFn: () => callsApi.stats(),
    select: (r) => r.data.data,
  })

  const { data: callsResponse, isLoading } = useQuery({
    queryKey: ['calls', { status, direction, cursor }],
    queryFn: () => callsApi.list({
      status: status || undefined,
      direction: (direction as 'inbound' | 'outbound') || undefined,
      cursor,
    }),
    select: (r) => r.data,
  })

  const calls: Call[] = callsResponse?.data ?? []
  const meta = callsResponse?.meta

  const statCards = [
    { label: 'Total Calls', value: formatNumber(statsData?.totalCalls ?? 0), icon: <Phone size={16} /> },
    { label: 'Completed', value: formatNumber(statsData?.completed ?? 0), deltaType: 'up' as const },
    { label: 'Inbound', value: formatNumber(statsData?.inbound ?? 0), deltaType: 'neutral' as const },
    { label: 'Outbound', value: formatNumber(statsData?.outbound ?? 0), deltaType: 'neutral' as const },
    { label: 'Avg Duration', value: formatDuration(statsData?.avgDurationSeconds ?? 0), deltaType: 'neutral' as const },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Calls" subtitle="IVR & call management" />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap">
          <select
            className="input text-xs h-8 py-0"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCursor(undefined) }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
            ))}
          </select>
          <select
            className="input text-xs h-8 py-0"
            value={direction}
            onChange={(e) => { setDirection(e.target.value as '' | 'inbound' | 'outbound'); setCursor(undefined) }}
          >
            {DIRECTION_OPTIONS.map((d) => (
              <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All Directions'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : calls.length === 0 ? (
          <EmptyState
            icon={<Phone size={32} className="text-gray-300" />}
            title="No calls found"
            description="Calls will appear here once available."
          />
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Direction</th>
                <th>Status</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id}>
                  <td className="font-medium text-gray-800">{call.contactName ?? '—'}</td>
                  <td>
                    {call.direction === 'inbound'
                      ? <PhoneIncoming size={13} className="text-green-500 inline" />
                      : <PhoneOutgoing size={13} className="text-blue-500 inline" />}
                    <span className="ml-1 text-gray-500">{call.direction}</span>
                  </td>
                  <td>
                    <span className={`badge ${callStatusBadge(call.status)}`}>{call.status}</span>
                  </td>
                  <td className="text-gray-500 font-mono">{call.fromNumber}</td>
                  <td className="text-gray-500 font-mono">{call.toNumber}</td>
                  <td className="text-gray-600">{formatDuration(call.durationSeconds)}</td>
                  <td className="text-gray-600">
                    {call.cost > 0 ? `${call.costCurrency} ${call.cost.toFixed(4)}` : '—'}
                  </td>
                  <td className="text-gray-400">{formatRelative(call.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {(meta?.hasMore || cursor) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              className="btn text-xs"
              disabled={!cursor}
              onClick={() => setCursor(undefined)}
            >
              ← First
            </button>
            <button
              className="btn text-xs"
              disabled={!meta?.hasMore}
              onClick={() => meta?.cursor && setCursor(meta.cursor)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
