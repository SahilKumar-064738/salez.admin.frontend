import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { whatsappApi } from '@/api/index'
import { adminApi } from '@/api/admin'
import { formatRelative } from '@/utils'
import {
  PageHeader, Tabs, SkeletonTable, Input, Select, Mono,
  EmptyState,
} from '@/components/common'
import { useAuthStore } from '@/store/authStore'
import { ShieldAlert, Users, Building2, Phone, FileText, BarChart3 } from 'lucide-react'

// ─── Settings Page ────────────────────────────────────────────────────────────

export function SettingsPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('WhatsApp')
  const [waForm, setWaForm] = useState({ phoneNumber: '', displayName: '', provider: 'meta', apiToken: '' })

  const { data: waAccounts, isLoading: loadingWa } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: () => whatsappApi.list(),
    select: (r) => r.data.data,
    enabled: activeTab === 'WhatsApp',
  })

  const connectWa = useMutation({
    mutationFn: () => whatsappApi.create({ phoneNumber: waForm.phoneNumber, displayName: waForm.displayName, provider: waForm.provider, apiToken: waForm.apiToken }),
    onSuccess: () => {
      toast.success('WhatsApp account connected')
      qc.invalidateQueries({ queryKey: ['whatsapp-accounts'] })
      setWaForm({ phoneNumber: '', displayName: '', provider: 'meta', apiToken: '' })
    },
    onError: () => toast.error('Failed to connect account'),
  })

  const disconnectWa = useMutation({
    mutationFn: (id: number) => whatsappApi.disconnect(id),
    onSuccess: () => { toast.success('Account disconnected'); qc.invalidateQueries({ queryKey: ['whatsapp-accounts'] }) },
  })

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="WhatsApp accounts and integrations" />

      <div className="card overflow-hidden">
        <div className="px-4 pt-4">
          <Tabs tabs={['WhatsApp']} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'WhatsApp' && (
          <div className="p-4 space-y-4">
            {loadingWa ? <SkeletonTable rows={2} /> : (
              <div className="space-y-2">
                {(waAccounts ?? []).map((acc) => (
                  <div key={acc.id} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg">💬</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">{acc.displayName}</p>
                      <Mono className="text-gray-500">{acc.phoneNumber}</Mono>
                    </div>
                    <span className={`badge ${acc.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{acc.status}</span>
                    <span className="text-xs text-gray-400">Limit: {acc.dailyMessageLimit}/day</span>
                    <button
                      className="btn btn-danger text-xs py-1 px-2"
                      onClick={() => disconnectWa.mutate(acc.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
                {(waAccounts ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No WhatsApp accounts connected yet.</p>
                )}
              </div>
            )}

            <div className="border border-dashed border-gray-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">Connect new account</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  placeholder="+1 555 000 0000"
                  value={waForm.phoneNumber}
                  onChange={(e) => setWaForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
                <Input
                  label="Display Name"
                  placeholder="Acme Support"
                  value={waForm.displayName}
                  onChange={(e) => setWaForm((f) => ({ ...f, displayName: e.target.value }))}
                />
                <Select
                  label="Provider"
                  value={waForm.provider}
                  onChange={(e) => setWaForm((f) => ({ ...f, provider: e.target.value }))}
                  options={[
                    { label: 'Meta / WhatsApp Cloud', value: 'meta' },
                    { label: 'Twilio', value: 'twilio' },
                    { label: 'Other', value: 'other' },
                  ]}
                />
                <Input
                  label="API Token"
                  type="password"
                  placeholder="••••••••"
                  value={waForm.apiToken}
                  onChange={(e) => setWaForm((f) => ({ ...f, apiToken: e.target.value }))}
                />
              </div>
              <button
                className="btn btn-primary text-xs mt-3"
                onClick={() => connectWa.mutate()}
                disabled={connectWa.isPending || !waForm.phoneNumber || !waForm.displayName}
              >
                {connectWa.isPending ? 'Connecting…' : 'Connect account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admin Page ────────────────────────────────────────────────────────────────

const ADMIN_TABS = ['Dashboard', 'Tenants', 'Users', 'Contacts', 'Calls', 'Logs']

export function AdminPage() {
  const { user } = useAuthStore()
  const isSuperAdmin = (user as any)?.user_metadata?.is_super_admin === true || user?.role === 'owner'
  const [activeTab, setActiveTab] = useState('Dashboard')

  if (!isSuperAdmin) {
    return (
      <div className="space-y-4">
        <PageHeader title="Admin Panel" subtitle="Super admin access required" />
        <div className="card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert size={32} className="text-orange-300" />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Access Denied</h3>
            <p className="text-xs text-gray-400">You need super admin privileges to access this panel.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admin Panel"
        subtitle="System-wide management"
        actions={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <ShieldAlert size={12} /> Super Admin
          </span>
        }
      />

      <div className="card overflow-hidden">
        <div className="px-4 pt-4">
          <Tabs tabs={ADMIN_TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-4">
          {activeTab === 'Dashboard' && <AdminDashboardTab />}
          {activeTab === 'Tenants' && <AdminTenantsTab />}
          {activeTab === 'Users' && <AdminUsersTab />}
          {activeTab === 'Contacts' && <AdminContactsTab />}
          {activeTab === 'Calls' && <AdminCallsTab />}
          {activeTab === 'Logs' && <AdminLogsTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Admin Sub-tabs ────────────────────────────────────────────────────────────

function AdminDashboardTab() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={3} />

  const cards = [
    { label: 'Total Tenants', value: metrics?.totalTenants ?? 0, icon: Building2, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Active Tenants', value: metrics?.activeTenants ?? 0, icon: Building2, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Suspended', value: metrics?.suspendedTenants ?? 0, icon: Building2, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'Total Users', value: metrics?.totalUsers ?? 0, icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Messages Today', value: metrics?.messagesToday ?? 0, icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Calls Today', value: metrics?.callsToday ?? 0, icon: Phone, bg: 'bg-teal-50', color: 'text-teal-600' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, bg, color }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon size={18} className={color} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminTenantsTab() {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => adminApi.listTenants({ limit: 50 }),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={5} />
  if (!resp?.length) return <EmptyState icon={<Building2 size={28} className="text-gray-300" />} title="No tenants" description="No tenants found." />

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Slug</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Users</th>
          <th>Contacts</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {resp.map((t) => (
          <tr key={t.id}>
            <td className="font-medium text-gray-800">{t.name}</td>
            <td className="text-gray-500">{t.email}</td>
            <td><Mono>{t.slug}</Mono></td>
            <td><span className="badge badge-info">{t.plan}</span></td>
            <td><span className={`badge ${t.status === 'active' ? 'badge-success' : t.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>{t.status}</span></td>
            <td className="text-gray-600">{t.userCount ?? '—'}</td>
            <td className="text-gray-600">{t.contactCount ?? '—'}</td>
            <td className="text-gray-400">{formatRelative(t.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminUsersTab() {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.listUsers({ limit: 50 }),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={5} />
  if (!resp?.length) return <EmptyState icon={<Users size={28} className="text-gray-300" />} title="No users" description="No users found." />

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Sign In</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {resp.map((u) => (
          <tr key={u.id}>
            <td className="font-medium text-gray-800">{u.displayName}</td>
            <td className="text-gray-500">{u.email}</td>
            <td><span className="badge badge-info">{u.role}</span></td>
            <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="text-gray-400">{u.lastSignInAt ? formatRelative(u.lastSignInAt) : '—'}</td>
            <td className="text-gray-400">{formatRelative(u.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminContactsTab() {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: () => adminApi.listContacts({ limit: 50 }),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={5} />
  if (!resp?.length) return <EmptyState icon={<Users size={28} className="text-gray-300" />} title="No contacts" description="No contacts found." />

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Stage</th>
          <th>Tags</th>
          <th>Last Active</th>
        </tr>
      </thead>
      <tbody>
        {resp.map((c) => (
          <tr key={c.id}>
            <td className="font-medium text-gray-800">{c.name}</td>
            <td><Mono>{c.phone}</Mono></td>
            <td className="text-gray-500">{c.email ?? '—'}</td>
            <td><span className="badge badge-info">{c.stage}</span></td>
            <td>{c.tags?.slice(0, 2).map((t) => <span key={t} className="badge mr-1">{t}</span>)}</td>
            <td className="text-gray-400">{formatRelative(c.lastActive)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminCallsTab() {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['admin', 'calls'],
    queryFn: () => adminApi.listCalls({ limit: 50 }),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={5} />
  if (!resp?.length) return <EmptyState icon={<Phone size={28} className="text-gray-300" />} title="No calls" description="No calls found." />

  return (
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
        {resp.map((c) => (
          <tr key={c.id}>
            <td className="font-medium text-gray-800">{c.contactName ?? '—'}</td>
            <td className="text-gray-500">{c.direction}</td>
            <td><span className={`badge ${c.status === 'completed' ? 'badge-success' : c.status === 'failed' ? 'badge-danger' : 'badge-info'}`}>{c.status}</span></td>
            <td><Mono>{c.fromNumber}</Mono></td>
            <td><Mono>{c.toNumber}</Mono></td>
            <td className="text-gray-600">{c.durationSeconds ? `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s` : '—'}</td>
            <td className="text-gray-600">{c.cost > 0 ? `$${c.cost.toFixed(4)}` : '—'}</td>
            <td className="text-gray-400">{formatRelative(c.startedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminLogsTab() {
  const { data: resp, isLoading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => adminApi.listLogs({ limit: 100 }),
    select: (r) => r.data.data,
  })

  if (isLoading) return <SkeletonTable rows={8} />
  if (!resp?.length) return <EmptyState icon={<FileText size={28} className="text-gray-300" />} title="No logs" description="No API logs found." />

  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr>
          <th>Method</th>
          <th>Endpoint</th>
          <th>Status</th>
          <th>Response Time</th>
          <th>IP</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {resp.map((log) => (
          <tr key={log.id}>
            <td><span className="badge badge-info">{log.method}</span></td>
            <td className="text-gray-600 truncate max-w-[200px]">{log.endpoint}</td>
            <td>
              <span className={`badge ${log.statusCode < 300 ? 'badge-success' : log.statusCode < 500 ? 'badge-warning' : 'badge-danger'}`}>
                {log.statusCode}
              </span>
            </td>
            <td className="text-gray-500">{log.responseTimeMs}ms</td>
            <td className="text-gray-400">{log.ipAddress}</td>
            <td className="text-gray-400 font-sans">{formatRelative(log.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

