import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, X, BarChart2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { campaignsApi } from '@/api/campaigns'
import { formatRelative, campaignStatusColor, formatPercent } from '@/utils'
import {
  PageHeader, StatCard, SkeletonTable, EmptyState, TablePagination,
  ProgressBar, Modal, Input, Select,
} from '@/components/common'
import type { Campaign } from '@/types'

export function CampaignsPage() {
  const qc = useQueryClient()
  const [cursor, setCursor] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [form, setForm] = useState({ name: '', templateId: '', whatsappAccountId: '1', scheduledAt: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', { status: statusFilter, cursor }],
    queryFn: () => campaignsApi.list({ status: statusFilter || undefined, cursor }),
    select: (r) => r.data,
  })

  const createMut = useMutation({
    mutationFn: () => {
      // FIXED: Convert datetime-local to ISO without milliseconds (backend strict validation)
      const scheduledAt = form.scheduledAt
        ? new Date(form.scheduledAt).toISOString().split('.')[0] + 'Z'
        : null
      return campaignsApi.create({
        name: form.name,
        templateId: Number(form.templateId),
        whatsappAccountId: Number(form.whatsappAccountId),
        scheduledAt,
      })
    },
    onSuccess: () => {
      toast.success('Campaign created')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setCreateOpen(false)
      setForm({ name: '', templateId: '', whatsappAccountId: '1', scheduledAt: '' })
    },
    onError: () => toast.error('Failed to create campaign'),
  })

  const sendMut = useMutation({
    mutationFn: (id: number) => campaignsApi.send(id),
    onSuccess: () => {
      toast.success('Campaign started')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: () => toast.error('Failed to start campaign'),
  })

  const cancelMut = useMutation({
    mutationFn: (id: number) => campaignsApi.cancel(id),
    onSuccess: () => {
      toast.success('Campaign cancelled')
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const campaigns = data?.data ?? MOCK_CAMPAIGNS

  const summary = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'running').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Campaigns"
        subtitle="WhatsApp broadcast campaigns"
        actions={
          <button className="btn btn-primary text-xs" onClick={() => setCreateOpen(true)}>
            <Plus size={13} /> New Campaign
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Running" value={summary.active} />
        <StatCard label="Scheduled" value={summary.scheduled} />
        <StatCard label="Completed" value={summary.completed} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Campaigns Table */}
        <div className="col-span-2 card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Select
              className="text-xs py-1.5 w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon={<BarChart2 size={32} />}
              title="No campaigns yet"
              action={<button className="btn btn-primary text-xs" onClick={() => setCreateOpen(true)}>Create your first</button>}
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivery</th>
                  <th>Scheduled</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const sent = c.sentCount ?? 0
                  const failed = c.failedCount ?? 0
                  const rate = sent > 0 ? (sent - failed) / sent : 0
                  return (
                    <tr key={c.id} className="cursor-pointer" onClick={() => setSelectedCampaign(c)}>
                      <td>
                        <span className="text-xs font-medium text-gray-800">{c.name || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${campaignStatusColor(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="text-xs text-gray-500">{sent.toLocaleString()}</td>
                      <td className="min-w-[100px]">
                        {sent > 0 ? <ProgressBar value={rate} color="bg-green-500" /> : '—'}
                      </td>
                      <td className="text-xs text-gray-400">
                        {c.scheduledAt ? formatRelative(c.scheduledAt) : c.status === 'running' ? 'Now' : '—'}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {(c.status === 'draft' || c.status === 'scheduled') && (
                            <button
                              className="btn btn-primary text-xs py-1 px-2"
                              onClick={(e) => { e.stopPropagation(); sendMut.mutate(c.id) }}
                            >
                              <Play size={10} /> Send
                            </button>
                          )}
                          {c.status === 'running' && (
                            <button
                              className="btn btn-danger text-xs py-1 px-2"
                              onClick={(e) => { e.stopPropagation(); cancelMut.mutate(c.id) }}
                            >
                              <X size={10} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          <TablePagination
            hasMore={data?.meta?.hasMore}
            total={data?.meta?.total}
            shown={campaigns.length}
            onNext={() => setCursor(data?.meta?.cursor)}
            onPrev={() => setCursor(undefined)}
          />
        </div>

        {/* Stats Panel */}
        <div className="card p-4">
          {selectedCampaign ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{selectedCampaign.name}</h3>
                <span className={`badge ${campaignStatusColor(selectedCampaign.status)} mt-1`}>{selectedCampaign.status}</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Total Recipients', value: selectedCampaign.totalRecipients ?? 0 },
                  { label: 'Sent', value: selectedCampaign.sentCount ?? 0 },
                  { label: 'Failed', value: selectedCampaign.failedCount ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-semibold text-gray-800">{value.toLocaleString()}</span>
                  </div>
                ))}
                {(selectedCampaign.sentCount ?? 0) > 0 && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Delivery rate</span>
                        <span className="font-medium">
                          {formatPercent(((selectedCampaign.sentCount ?? 0) - (selectedCampaign.failedCount ?? 0)) / (selectedCampaign.sentCount ?? 1))}
                        </span>
                      </div>
                      <ProgressBar
                        value={((selectedCampaign.sentCount ?? 0) - (selectedCampaign.failedCount ?? 0)) / (selectedCampaign.sentCount ?? 1)}
                        color="bg-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<BarChart2 size={28} />}
              title="Select a campaign"
              description="Click any campaign to view delivery stats"
            />
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Campaign">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Campaign Name *</label>
            <Input placeholder="e.g. July Reactivation" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Template ID</label>
            <Input
              type="number"
              placeholder="Enter template ID"
              value={form.templateId}
              onChange={(e) => setForm((p) => ({ ...p, templateId: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">WhatsApp Account ID</label>
            <Input
              type="number"
              placeholder="Enter account ID"
              value={form.whatsappAccountId}
              onChange={(e) => setForm((p) => ({ ...p, whatsappAccountId: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Schedule (optional)</label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn text-xs" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary text-xs"
              onClick={() => createMut.mutate()}
              disabled={!form.name || createMut.isPending}
            >
              {createMut.isPending ? 'Creating…' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: 'Q2 Reactivation', templateId: 10, templateName: 'reactivation_v2', status: 'running', totalRecipients: 4914, sentCount: 4821, failedCount: 93, scheduledAt: null, startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: null },
  { id: 2, name: 'Onboarding Wave 3', templateId: 11, templateName: 'onboarding_v1', status: 'scheduled', totalRecipients: 0, sentCount: 0, failedCount: 0, scheduledAt: new Date(Date.now() + 86400000).toISOString(), startedAt: null, completedAt: null },
  { id: 3, name: 'Holiday Promo', templateId: 12, templateName: 'holiday_promo', status: 'completed', totalRecipients: 12634, sentCount: 12430, failedCount: 204, scheduledAt: null, startedAt: new Date(Date.now() - 864000000).toISOString(), completedAt: new Date(Date.now() - 860000000).toISOString() },
  { id: 4, name: 'Feedback Survey', templateId: 10, templateName: 'survey_v1', status: 'draft', totalRecipients: 1119, sentCount: 0, failedCount: 0, scheduledAt: null, startedAt: null, completedAt: null },
]
