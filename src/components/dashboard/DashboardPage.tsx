import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Phone, MessageSquare, Users, Activity, Cpu, ExternalLink } from 'lucide-react'
import { messagesApi } from '@/api/messages'
import { contactsApi } from '@/api/contacts'
import { callsApi } from '@/api/calls'
import { formatNumber, formatRelative } from '@/utils'
import {
  StatCard, PageHeader, SectionHeader, LiveDot,
} from '@/components/common'
import { useAuthStore } from '@/store/authStore'
import { adminApi } from '@/api/admin'

export function DashboardPage() {
  const { user } = useAuthStore()
  const isSuperAdmin = (user as any)?.user_metadata?.is_super_admin === true || user?.role === 'owner'

  const { data: contactStats } = useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsApi.stats(),
    select: (r) => r.data.data,
  })

  const { data: inbox } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => messagesApi.inbox({ limit: 10 }),
    select: (r) => r.data.data,
  })

  const { data: callStats } = useQuery({
    queryKey: ['calls', 'stats'],
    queryFn: () => callsApi.stats(),
    select: (r) => r.data.data,
  })

  const { data: adminMetrics } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
    select: (r) => r.data.data,
    enabled: isSuperAdmin,
  })

  const unreadCount = inbox?.filter((i) => !i.isRead).length ?? 0

  const stats = [
    {
      label: 'Total Contacts',
      value: formatNumber(contactStats?.total ?? adminMetrics?.totalUsers ?? 0),
      deltaType: 'up' as const,
      icon: <Users size={16} />,
    },
    {
      label: 'Converted',
      value: formatNumber(contactStats?.byStage?.converted ?? 0),
      deltaType: 'up' as const,
    },
    {
      label: 'Unread Messages',
      value: unreadCount,
      delta: 'In inbox',
      deltaType: 'neutral' as const,
    },
    {
      label: 'Total Calls',
      value: formatNumber(callStats?.totalCalls ?? 0),
      deltaType: 'neutral' as const,
      icon: <Phone size={16} />,
    },
    {
      label: 'Lost',
      value: formatNumber(contactStats?.byStage?.lost ?? 0),
      deltaType: 'down' as const,
    },
  ]

  const callsByDay = callStats?.byDay?.slice(-12) ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        actions={
          <>
            <button className="btn text-xs">Export</button>
            <button className="btn btn-primary text-xs">+ New Campaign</button>
          </>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Calls over time" />
            <div className="flex gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-brand-400 inline-block rounded" /> Calls</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-green-500 inline-block rounded" /> Duration (min)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={callsByDay} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => v?.slice(5) ?? ''} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="calls" stroke="#378add" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="duration" stroke="#22c55e" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <SectionHeader title="Contact pipeline" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[
                { stage: 'New', count: contactStats?.byStage?.new ?? 0 },
                { stage: 'Contacted', count: contactStats?.byStage?.contacted ?? 0 },
                { stage: 'Qualified', count: contactStats?.byStage?.qualified ?? 0 },
                { stage: 'Converted', count: contactStats?.byStage?.converted ?? 0 },
                { stage: 'Lost', count: contactStats?.byStage?.lost ?? 0 },
              ]}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#378add" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent inbox */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Recent Conversations</h3>
            <a href="/messages" className="text-xs text-brand-500 flex items-center gap-1 hover:underline">
              View all <ExternalLink size={11} />
            </a>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Last Message</th>
                <th>Stage</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(inbox ?? []).slice(0, 5).map((item) => (
                <tr key={item.contactId}>
                  <td className="font-medium text-gray-800">{item.contactName || '—'}</td>
                  <td className="text-gray-400 max-w-[150px] truncate">{item.lastMessage || '—'}</td>
                  <td>
                    <span className="badge badge-info">{item.contactStage || '—'}</span>
                  </td>
                  <td className="text-gray-400">{item.lastMessageAt ? formatRelative(item.lastMessageAt) : '—'}</td>
                </tr>
              ))}
              {(inbox ?? []).length === 0 && (
                <tr><td colSpan={4} className="text-center text-gray-400 py-6">No conversations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Call Stats Summary */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Call Summary</h3>
            <a href="/calls" className="text-xs text-brand-500 flex items-center gap-1 hover:underline">
              View all <ExternalLink size={11} />
            </a>
            <LiveDot />
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Total Calls', value: formatNumber(callStats?.totalCalls ?? 0), icon: Phone, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
              { label: 'Completed', value: formatNumber(callStats?.completed ?? 0), icon: Activity, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
              { label: 'Failed', value: formatNumber(callStats?.failed ?? 0), icon: Cpu, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
              { label: 'Total Cost', value: callStats?.totalCost != null ? `$${callStats.totalCost.toFixed(2)}` : '—', icon: MessageSquare, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <item.icon size={13} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700">{item.label}</p>
                </div>
                <span className="text-xs font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
