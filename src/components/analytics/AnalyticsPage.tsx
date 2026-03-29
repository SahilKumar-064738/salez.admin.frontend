import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { PageHeader, StatCard, SkeletonTable } from '@/components/common'
import { contactsApi } from '@/api/contacts'
import { callsApi } from '@/api/calls'
import { messagesApi } from '@/api/messages'
import { formatNumber } from '@/utils'

const PIE_COLORS = ['#378add', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function AnalyticsPage() {
  const { data: contactStats } = useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsApi.stats(),
    select: (r) => r.data.data,
  })

  const { data: callStats } = useQuery({
    queryKey: ['calls', 'stats'],
    queryFn: () => callsApi.stats(),
    select: (r) => r.data.data,
  })

  const { data: inbox } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: () => messagesApi.inbox({ limit: 50 }),
    select: (r) => r.data.data,
  })

  const stageDistribution = contactStats
    ? Object.entries(contactStats.byStage).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : []

  const callsByDay = callStats?.byDay ?? []
  const unreadCount = inbox?.filter((i) => !i.isRead).length ?? 0

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" subtitle="Overview of your CRM activity" />

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Contacts" value={formatNumber(contactStats?.total ?? 0)} deltaType="up" />
        <StatCard label="Converted" value={formatNumber(contactStats?.byStage?.converted ?? 0)} deltaType="up" />
        <StatCard label="Total Calls" value={formatNumber(callStats?.totalCalls ?? 0)} deltaType="neutral" />
        <StatCard label="Unread Messages" value={formatNumber(unreadCount)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Calls by day */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Calls over time</h3>
          {callsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5) ?? ''} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="calls" stroke="#378add" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">No call data available</div>
          )}
        </div>

        {/* Contact Stage Distribution */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Contact Stage Distribution</h3>
          {stageDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stageDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">No contact data available</div>
          )}
        </div>
      </div>

      {/* Call stats breakdown */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Call Statistics</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Inbound', value: callStats?.inbound ?? 0 },
            { label: 'Outbound', value: callStats?.outbound ?? 0 },
            { label: 'Completed', value: callStats?.completed ?? 0 },
            { label: 'Failed', value: callStats?.failed ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{formatNumber(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
