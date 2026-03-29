import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, CheckCheck, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { messagesApi } from '@/api/messages'
import { whatsappApi } from '@/api/index'
import { formatRelative, formatTime, contactStageColor } from '@/utils'
import { Avatar, EmptyState, LiveDot, SkeletonTable } from '@/components/common'
import type { InboxItem } from '@/types'

export function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<InboxItem | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: inbox, isLoading } = useQuery({
    queryKey: ['messages', 'inbox', search],
    queryFn: () => messagesApi.inbox({ search: search || undefined }),
    select: (r) => r.data.data,
    refetchInterval: 15_000,
  })

  const { data: thread } = useQuery({
    queryKey: ['messages', 'thread', selectedContact?.contactId],
    queryFn: () => messagesApi.thread(selectedContact!.contactId),
    enabled: !!selectedContact,
    select: (r) => r.data.data,
    refetchInterval: 5_000,
  })

  const { data: waAccounts } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: () => whatsappApi.list(),
    select: (r) => r.data.data,
  })

  const markRead = useMutation({
    mutationFn: (contactId: number) => messagesApi.markRead(contactId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', 'inbox'] }),
  })

  const sendMsg = useMutation({
    mutationFn: () =>
      messagesApi.send({
        contactId: selectedContact!.contactId,
        whatsappAccountId: waAccounts?.[0]?.id ?? 1,
        content: message,
      }),
    onSuccess: () => {
      setMessage('')
      qc.invalidateQueries({ queryKey: ['messages', 'thread', selectedContact?.contactId] })
      toast.success('Message sent')
    },
    onError: () => toast.error('Failed to send message'),
  })

  useEffect(() => {
    if (selectedContact) {
      markRead.mutate(selectedContact.contactId)
    }
  }, [selectedContact?.contactId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Messages / Inbox</h1>
        <div className="flex gap-2">
          <LiveDot label="Live" />
          <button className="btn btn-primary text-xs">+ New Message</button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 h-[calc(100vh-180px)]">
        {/* Contact list */}
        <div className="card flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search size={12} className="text-gray-400" />
              <input
                className="flex-1 bg-transparent text-xs outline-none text-gray-600 placeholder-gray-400"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {isLoading ? (
              <SkeletonTable rows={6} />
            ) : (inbox ?? MOCK_INBOX).length === 0 ? (
              <EmptyState title="No conversations yet" />
            ) : (
              (inbox ?? MOCK_INBOX).map((item) => (
                <div
                  key={item.contactId}
                  onClick={() => setSelectedContact(item)}
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact?.contactId === item.contactId ? 'bg-blue-50' : ''}`}
                >
                  <Avatar name={item.contactName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-gray-800 truncate">{item.contactName || '—'}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{item.lastMessageAt ? formatRelative(item.lastMessageAt) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{item.lastMessage || '—'}</p>
                      {(item.unreadCount ?? 0) > 0 && (
                        <span className="w-4 h-4 bg-brand-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        {selectedContact ? (
          <div className="card flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Avatar name={selectedContact.contactName} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{selectedContact.contactName}</p>
                <p className="text-xs text-gray-400">
                  {selectedContact.contactPhone} ·{' '}
                  <span className={`badge ${contactStageColor(selectedContact.contactStage)}`}>
                    {selectedContact.contactStage}
                  </span>
                </p>
              </div>
              <button
                onClick={() => markRead.mutate(selectedContact.contactId)}
                className="btn text-xs"
              >
                <CheckCheck size={12} /> Mark read
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(thread ?? MOCK_THREAD).map((msg, i) => (
                <div key={i} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.direction === 'outbound' ? 'bg-brand-400 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                    <p>{msg.content || ''}</p>
                    <p className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                      {msg.sentAt ? formatTime(msg.sentAt) : ''}
                      {msg.direction === 'outbound' && msg.status === 'read' && (
                        <CheckCheck size={10} className="inline ml-1" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
              <input
                className="input flex-1 text-xs"
                placeholder="Type a message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMsg.mutate()}
              />
              <button
                className="btn btn-primary"
                onClick={() => sendMsg.mutate()}
                disabled={!message.trim() || sendMsg.isPending}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center">
            <EmptyState
              icon={<div className="text-4xl">💬</div>}
              title="Select a conversation"
              description="Choose a contact from the list to view their message thread"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INBOX: InboxItem[] = [
  { contactId: 101, contactName: 'Sarah Chen', contactPhone: '+1 555-0192', contactStage: 'qualified', lastMessage: 'Thanks for the update!', lastDirection: 'inbound', lastStatus: 'delivered', isRead: false, unreadCount: 2, lastMessageAt: new Date(Date.now() - 120000).toISOString() },
  { contactId: 102, contactName: 'Marcus Webb', contactPhone: '+44 7911 123456', contactStage: 'new', lastMessage: 'When can I expect a callback?', lastDirection: 'inbound', lastStatus: 'delivered', isRead: true, unreadCount: 0, lastMessageAt: new Date(Date.now() - 300000).toISOString() },
  { contactId: 103, contactName: 'Priya Nair', contactPhone: '+91 98100 12345', contactStage: 'converted', lastMessage: 'Received, thank you.', lastDirection: 'inbound', lastStatus: 'read', isRead: true, unreadCount: 1, lastMessageAt: new Date(Date.now() - 3600000).toISOString() },
  { contactId: 104, contactName: 'Jordan Ellis', contactPhone: '+1 555-0341', contactStage: 'contacted', lastMessage: 'Please reschedule my demo', lastDirection: 'inbound', lastStatus: 'delivered', isRead: true, unreadCount: 0, lastMessageAt: new Date(Date.now() - 10800000).toISOString() },
]

const MOCK_THREAD = [
  { direction: 'inbound' as const, content: 'Hi, I wanted to follow up on my order from last week.', status: 'delivered' as const, sentAt: new Date(Date.now() - 3600000).toISOString() },
  { direction: 'outbound' as const, content: 'Hello Sarah! Of course, let me pull that up for you right away.', status: 'read' as const, sentAt: new Date(Date.now() - 3500000).toISOString() },
  { direction: 'inbound' as const, content: "Order #94821 — I still haven't received a shipping confirmation.", status: 'delivered' as const, sentAt: new Date(Date.now() - 3400000).toISOString() },
  { direction: 'outbound' as const, content: "I can see your order is scheduled to ship today. You'll receive a confirmation email within 2 hours.", status: 'read' as const, sentAt: new Date(Date.now() - 3300000).toISOString() },
  { direction: 'inbound' as const, content: 'Thanks for the update!', status: 'delivered' as const, sentAt: new Date(Date.now() - 120000).toISOString() },
]
