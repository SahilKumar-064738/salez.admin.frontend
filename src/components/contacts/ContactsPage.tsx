import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Trash2, Edit2, Upload, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { contactsApi } from '@/api/contacts'
import { adminApi } from '@/api/admin'
import { useAuthStore } from '@/store/authStore'
import { formatRelative, contactStageColor } from '@/utils'
import {
  PageHeader, StatCard, Avatar, SkeletonTable, EmptyState,
  TablePagination, Mono, Modal, Input, Select,
} from '@/components/common'
import type { Contact } from '@/types'

function parseCSV(text: string): Array<{ name: string; phone: string }> {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/['"]/g, ''))
  const nameIdx = headers.findIndex((h) => h.includes('name'))
  const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('number'))
  if (nameIdx === -1 || phoneIdx === -1) return []
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))
    return { name: cols[nameIdx] || '', phone: cols[phoneIdx] || '' }
  }).filter((r) => r.name && r.phone)
}

export function ContactsPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isSuperAdmin = (user as any)?.user_metadata?.is_super_admin === true || user?.role === 'owner'
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [csvRows, setCsvRows] = useState<Array<{ name: string; phone: string }>>([])
  const [csvError, setCsvError] = useState('')
  const [csvProgress, setCsvProgress] = useState<{ done: number; total: number } | null>(null)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', stage: 'new', notes: '' })

  const { data: stats } = useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => contactsApi.stats(),
    select: (r) => r.data.data,
  })

  // FIXED: select r.data so we can access both .data (array) and .meta (pagination)
  // Role-based: super admins use /admin/contacts to see all tenants' contacts
  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ['contacts', { search, stage, cursor, isSuperAdmin }],
    queryFn: () => isSuperAdmin
      ? adminApi.listContacts({ search: search || undefined, cursor })
      : contactsApi.list({ search: search || undefined, stage: stage || undefined, cursor }),
    select: (r) => r.data,
  })

  const contactsList: Contact[] = contactsResponse?.data ?? []
  const paginationMeta = contactsResponse?.meta

  const createMutation = useMutation({
    mutationFn: () => contactsApi.create(newContact),
    onSuccess: () => {
      toast.success('Contact created')
      qc.invalidateQueries({ queryKey: ['contacts'] })
      setCreateOpen(false)
      setNewContact({ name: '', phone: '', email: '', stage: 'new', notes: '' })
    },
    onError: () => toast.error('Failed to create contact'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactsApi.delete(id),
    onSuccess: () => {
      toast.success('Contact deleted')
      qc.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: () => toast.error('Failed to delete contact'),
  })

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) { setCsvError('Please upload a .csv file'); return }
    setCsvError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setCsvError('No valid rows found. CSV must have "name" and "phone" columns.')
        return
      }
      setCsvRows(rows)
    }
    reader.readAsText(file)
  }

  async function handleCSVImport() {
    if (csvRows.length === 0) return
    setCsvProgress({ done: 0, total: csvRows.length })
    let successCount = 0, errorCount = 0
    for (let i = 0; i < csvRows.length; i++) {
      try {
        await contactsApi.create({ ...csvRows[i], stage: 'new' })
        successCount++
      } catch { errorCount++ }
      setCsvProgress({ done: i + 1, total: csvRows.length })
    }
    qc.invalidateQueries({ queryKey: ['contacts'] })
    setCsvProgress(null); setCsvRows([]); setCsvOpen(false)
    if (csvInputRef.current) csvInputRef.current.value = ''
    if (errorCount === 0) toast.success(`Imported ${successCount} contacts`)
    else toast.success(`Imported ${successCount} contacts. ${errorCount} failed.`)
  }

  const stageCounts = stats?.byStage

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contacts"
        subtitle={stats ? `${(stats.total ?? 0).toLocaleString()} total contacts (your account)` : 'Loading…'}
        actions={
          <>
            <button className="btn text-xs" onClick={() => setCsvOpen(true)}>
              <Upload size={13} /> Import CSV
            </button>
            <button className="btn btn-primary text-xs" onClick={() => setCreateOpen(true)}>
              <Plus size={13} /> Add Contact
            </button>
          </>
        }
      />

      {isSuperAdmin && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
          <AlertCircle size={13} />
          Super admin mode: showing contacts across all tenants.
        </div>
      )}

      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Total" value={stats?.total?.toLocaleString() ?? '—'} loading={!stats} />
        <StatCard label="New" value={stageCounts?.new?.toLocaleString() ?? '—'} loading={!stats} />
        <StatCard label="Qualified" value={stageCounts?.qualified?.toLocaleString() ?? '—'} loading={!stats} />
        <StatCard label="Converted" value={stageCounts?.converted?.toLocaleString() ?? '—'} deltaType="up" loading={!stats} />
        <StatCard label="Lost" value={stageCounts?.lost?.toLocaleString() ?? '—'} loading={!stats} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Input
            className="max-w-[220px] text-xs py-1.5"
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(undefined) }}
          />
          <Select
            className="text-xs py-1.5 w-36"
            value={stage}
            onChange={(e) => { setStage(e.target.value); setCursor(undefined) }}
          >
            <option value="">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </Select>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : contactsList.length === 0 ? (
          <EmptyState
            icon={<Plus size={32} />}
            title="No contacts found"
            description={search || stage ? 'Try adjusting your filters' : 'Add your first contact to get started'}
            action={!search && !stage ? (
              <button className="btn btn-primary text-xs" onClick={() => setCreateOpen(true)}>Add your first contact</button>
            ) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Email</th><th>Stage</th><th>Tags</th><th>Last Active</th><th></th>
                </tr>
              </thead>
              <tbody>
                {contactsList.map((contact) => {
                  const tags = contact.tags ?? []
                  return (
                    <tr key={contact.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={contact.name || 'Unknown'} size="xs" />
                          <span className="text-xs font-medium text-gray-800">{contact.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td><Mono>{contact.phone || '—'}</Mono></td>
                      <td className="text-gray-500 text-xs">{contact.email || '—'}</td>
                      <td>
                        <span className={`badge ${contactStageColor(contact.stage)}`}>{contact.stage}</span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="badge badge-gray"><Tag size={9} className="mr-1" />{tag}</span>
                          ))}
                          {tags.length > 2 && <span className="badge badge-gray">+{tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="text-gray-400 text-xs">{contact.lastActive ? formatRelative(contact.lastActive) : '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn text-xs py-1 px-2"><Edit2 size={11} /></button>
                          <button
                            className="btn btn-danger text-xs py-1 px-2"
                            onClick={() => deleteMutation.mutate(contact.id)}
                            disabled={deleteMutation.isPending}
                          ><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          hasMore={paginationMeta?.hasMore}
          total={paginationMeta?.total ?? stats?.total}
          shown={contactsList.length}
          onNext={() => setCursor(paginationMeta?.cursor)}
          onPrev={() => setCursor(undefined)}
        />
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Contact">
        <div className="space-y-3">
          <Input placeholder="Name *" value={newContact.name} onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Phone *" value={newContact.phone} onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))} />
          <Input placeholder="Email" value={newContact.email} onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))} />
          <Select value={newContact.stage} onChange={(e) => setNewContact((p) => ({ ...p, stage: e.target.value }))}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </Select>
          <textarea className="input" placeholder="Notes" rows={3} value={newContact.notes} onChange={(e) => setNewContact((p) => ({ ...p, notes: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button className="btn" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => createMutation.mutate()} disabled={!newContact.name || !newContact.phone || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal open={csvOpen} onClose={() => { setCsvOpen(false); setCsvRows([]); setCsvError('') }} title="Import Contacts from CSV">
        <div className="space-y-4">
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700 mb-1">CSV Format Requirements</p>
            <p>Your CSV must include columns: <code className="bg-gray-200 px-1 rounded">name</code> and <code className="bg-gray-200 px-1 rounded">phone</code></p>
            <p className="mt-1 text-gray-400">Example: <code className="bg-gray-200 px-1 rounded">name,phone</code> → <code className="bg-gray-200 px-1 rounded">Alice,+919876543210</code></p>
          </div>

          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Click to select a CSV file</p>
            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
          </div>

          {csvError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} />{csvError}
            </div>
          )}

          {csvRows.length > 0 && (
            <div>
              <p className="text-xs text-green-600 font-medium mb-2">✓ {csvRows.length} contacts ready to import</p>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Name</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-3 py-1.5 text-gray-700">{row.name}</td>
                        <td className="px-3 py-1.5 text-gray-500">{row.phone}</td>
                      </tr>
                    ))}
                    {csvRows.length > 10 && (
                      <tr className="border-t border-gray-50">
                        <td colSpan={2} className="px-3 py-1.5 text-gray-400 text-center">…and {csvRows.length - 10} more</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {csvProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Importing…</span>
                <span>{csvProgress.done} / {csvProgress.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 transition-all" style={{ width: `${(csvProgress.done / csvProgress.total) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button className="btn text-xs" onClick={() => { setCsvOpen(false); setCsvRows([]); setCsvError('') }}>Cancel</button>
            <button
              className="btn btn-primary text-xs"
              onClick={handleCSVImport}
              disabled={csvRows.length === 0 || !!csvProgress}
            >
              {csvProgress ? 'Importing…' : `Import${csvRows.length > 0 ? ` ${csvRows.length} Contacts` : ''}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
