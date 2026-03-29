import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Key, Copy, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiKeysApi } from '@/api/index'
import { formatRelative, maskApiKey } from '@/utils'
import {
  PageHeader, SkeletonTable, Mono, Modal, Input,
} from '@/components/common'

// NOTE: Sessions, Login History, and API Logs endpoints are not available
// in the Salez backend. This page only surfaces API Key management which
// is supported via GET/POST/DELETE /api-keys.

export function SecurityPage() {
  const qc = useQueryClient()
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [newKeyCreated, setNewKeyCreated] = useState<string | null>(null)
  const [newKey, setNewKey] = useState({ name: '', scopes: ['contacts:read'], expiresAt: '' })

  const { data: apiKeys, isLoading: loadingKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.list(),
    select: (r) => r.data.data,
  })

  const createKey = useMutation({
    mutationFn: () => apiKeysApi.create({ name: newKey.name, scopes: newKey.scopes, expiresAt: newKey.expiresAt || undefined }),
    onSuccess: (r) => {
      setNewKeyCreated(r.data.data.key)
      qc.invalidateQueries({ queryKey: ['api-keys'] })
    },
    onError: () => toast.error('Failed to create API key'),
  })

  const revokeKey = useMutation({
    mutationFn: (id: number) => apiKeysApi.revoke(id),
    onSuccess: () => { toast.success('Key revoked'); qc.invalidateQueries({ queryKey: ['api-keys'] }) },
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Security"
        subtitle="API key management"
      />

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-brand-400" />
            <h3 className="text-sm font-semibold text-gray-800">API Keys</h3>
          </div>
          <button
            className="btn btn-primary text-xs"
            onClick={() => setCreateKeyOpen(true)}
          >
            <Plus size={12} /> New Key
          </button>
        </div>

        {loadingKeys ? <SkeletonTable rows={3} /> : (
          <div className="space-y-2 p-4">
            {(apiKeys ?? MOCK_API_KEYS).map((key) => (
              <div key={key.id} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
                <Key size={15} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{key.name}</p>
                  <Mono className="text-gray-400">{maskApiKey(key.keyPrefix)}</Mono>
                </div>
                <div className="text-xs text-gray-400">
                  {key.lastUsedAt ? `Used ${formatRelative(key.lastUsedAt)}` : 'Never used'}
                </div>
                <div className="flex gap-1 flex-wrap max-w-[160px]">
                  {(key.scopes ?? []).slice(0, 2).map((s) => (
                    <span key={s} className="badge badge-gray text-[9px]">{s}</span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    className="btn text-xs py-1 px-2"
                    onClick={() => { navigator.clipboard.writeText(key.keyPrefix + '…'); toast.success('Prefix copied') }}
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    className="btn btn-danger text-xs py-1 px-2"
                    onClick={() => revokeKey.mutate(key.id)}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
            {(apiKeys ?? MOCK_API_KEYS).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No API keys yet. Create one to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      <Modal open={createKeyOpen} onClose={() => { setCreateKeyOpen(false); setNewKeyCreated(null) }} title="Create API Key">
        {newKeyCreated ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠ Copy this key now — it won't be shown again</p>
              <Mono className="text-amber-700 break-all">{newKeyCreated}</Mono>
            </div>
            <button
              className="btn w-full justify-center"
              onClick={() => { navigator.clipboard.writeText(newKeyCreated); toast.success('Copied!') }}
            >
              <Copy size={12} /> Copy to clipboard
            </button>
            <button
              className="btn btn-primary w-full justify-center text-xs"
              onClick={() => { setCreateKeyOpen(false); setNewKeyCreated(null) }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Key Name *</label>
              <Input placeholder="e.g. Production Integration" value={newKey.name} onChange={(e) => setNewKey((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Scopes</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['contacts:read', 'contacts:write', 'messages:read', 'messages:write', 'campaigns:read', 'campaigns:write'].map((scope) => (
                  <label key={scope} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newKey.scopes.includes(scope)}
                      onChange={(e) => setNewKey((p) => ({
                        ...p,
                        scopes: e.target.checked
                          ? [...p.scopes, scope]
                          : p.scopes.filter((s) => s !== scope),
                      }))}
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expiry (optional)</label>
              <Input type="date" value={newKey.expiresAt} onChange={(e) => setNewKey((p) => ({ ...p, expiresAt: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn text-xs" onClick={() => setCreateKeyOpen(false)}>Cancel</button>
              <button
                className="btn btn-primary text-xs"
                onClick={() => createKey.mutate()}
                disabled={!newKey.name || createKey.isPending}
              >
                {createKey.isPending ? 'Creating…' : 'Create Key'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const MOCK_API_KEYS = [
  { id: 1, name: 'Production Key', keyPrefix: 'slz_live_', scopes: ['contacts:read', 'messages:write'], lastUsedAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: null, isActive: true, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 2, name: 'Test Key', keyPrefix: 'slz_test_', scopes: ['contacts:read'], lastUsedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: null, isActive: true, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
]
