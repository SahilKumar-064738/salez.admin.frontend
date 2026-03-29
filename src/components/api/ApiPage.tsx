import React from 'react'
import { Code, Webhook, Globe, Zap } from 'lucide-react'
import { PageHeader, Mono } from '@/components/common'

export function ApiPage() {
  const endpoints = [
    // Auth
    { method: 'POST', path: '/api/v1/auth/register', auth: 'Public', desc: 'Register a new user' },
    { method: 'POST', path: '/api/v1/auth/login', auth: 'Public', desc: 'Login and receive JWT tokens' },
    { method: 'POST', path: '/api/v1/auth/refresh', auth: 'Refresh Token', desc: 'Refresh access token' },
    { method: 'GET',  path: '/api/v1/auth/me', auth: 'Bearer JWT', desc: 'Get current authenticated user' },
    { method: 'POST', path: '/api/v1/auth/change-password', auth: 'Bearer JWT', desc: 'Change user password' },
    { method: 'POST', path: '/api/v1/auth/logout', auth: 'Bearer JWT', desc: 'Logout current session' },
    // Contacts
    { method: 'GET',  path: '/api/v1/contacts', auth: 'Bearer JWT', desc: 'List all contacts' },
    { method: 'POST', path: '/api/v1/contacts', auth: 'Bearer JWT', desc: 'Create a contact' },
    { method: 'GET',  path: '/api/v1/contacts/stats/pipeline', auth: 'Bearer JWT', desc: 'Get pipeline stage stats' },
    { method: 'GET',  path: '/api/v1/contacts/:id', auth: 'Bearer JWT', desc: 'Get contact by ID' },
    { method: 'PUT',  path: '/api/v1/contacts/:id', auth: 'Bearer JWT', desc: 'Update contact' },
    { method: 'DELETE', path: '/api/v1/contacts/:id', auth: 'Bearer JWT', desc: 'Delete contact' },
    { method: 'POST', path: '/api/v1/contacts/:id/tags', auth: 'Bearer JWT', desc: 'Add tag to contact' },
    { method: 'DELETE', path: '/api/v1/contacts/:id/tags/:tag', auth: 'Bearer JWT', desc: 'Remove tag from contact' },
    // Messages
    { method: 'GET',  path: '/api/v1/messages/inbox', auth: 'Bearer JWT', desc: 'Get inbox' },
    { method: 'GET',  path: '/api/v1/messages/conversation/:contactId', auth: 'Bearer JWT', desc: 'Get conversation thread' },
    { method: 'POST', path: '/api/v1/messages/send', auth: 'Bearer JWT', desc: 'Send WhatsApp message' },
    { method: 'PUT',  path: '/api/v1/messages/conversation/:contactId/read', auth: 'Bearer JWT', desc: 'Mark conversation as read' },
    // Campaigns
    { method: 'GET',  path: '/api/v1/campaigns', auth: 'Bearer JWT', desc: 'List campaigns' },
    { method: 'POST', path: '/api/v1/campaigns', auth: 'Bearer JWT', desc: 'Create campaign' },
    { method: 'GET',  path: '/api/v1/campaigns/:id', auth: 'Bearer JWT', desc: 'Get campaign by ID' },
    { method: 'POST', path: '/api/v1/campaigns/:id/send', auth: 'Bearer JWT', desc: 'Send campaign' },
    { method: 'POST', path: '/api/v1/campaigns/:id/cancel', auth: 'Bearer JWT', desc: 'Cancel campaign' },
    { method: 'GET',  path: '/api/v1/campaigns/templates', auth: 'Bearer JWT', desc: 'List message templates' },
    { method: 'POST', path: '/api/v1/campaigns/templates', auth: 'Bearer JWT', desc: 'Create message template' },
    // WhatsApp Accounts
    { method: 'GET',  path: '/api/v1/whatsapp-accounts', auth: 'Bearer JWT', desc: 'List WhatsApp accounts' },
    { method: 'POST', path: '/api/v1/whatsapp-accounts', auth: 'Bearer JWT', desc: 'Add WhatsApp account' },
    { method: 'PUT',  path: '/api/v1/whatsapp-accounts/:id', auth: 'Bearer JWT', desc: 'Update WhatsApp account' },
    { method: 'DELETE', path: '/api/v1/whatsapp-accounts/:id', auth: 'Bearer JWT', desc: 'Delete WhatsApp account' },
    // API Keys
    { method: 'GET',  path: '/api/v1/api-keys', auth: 'Bearer JWT', desc: 'List API keys' },
    { method: 'POST', path: '/api/v1/api-keys', auth: 'Bearer JWT', desc: 'Create API key' },
    { method: 'DELETE', path: '/api/v1/api-keys/:id', auth: 'Bearer JWT', desc: 'Delete API key' },
    // Webhooks
    { method: 'POST', path: '/api/v1/webhooks/meta', auth: 'HMAC Signature', desc: 'Meta webhook ingest' },
    { method: 'POST', path: '/api/v1/webhooks/twilio', auth: 'HMAC Signature', desc: 'Twilio webhook ingest' },
  ]

  const methodColor = (m: string) => {
    if (m === 'GET') return 'badge-info'
    if (m === 'POST') return 'badge-success'
    if (m === 'PUT') return 'badge-warning'
    if (m === 'DELETE') return 'badge-danger'
    return 'badge-gray'
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="API & Integrations"
        subtitle="Authentication, endpoints and webhook configuration"
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Auth methods */}
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Zap size={14} className="text-brand-400" /> Authentication
          </h3>
          {[
            { label: 'User API (JWT)', header: 'Authorization: Bearer <jwt>', desc: 'All protected endpoints' },
            { label: 'Webhook Inbound (Meta)', header: 'POST /api/v1/webhooks/meta', desc: 'Meta / WhatsApp Cloud API events' },
            { label: 'Webhook Inbound (Twilio)', header: 'POST /api/v1/webhooks/twilio', desc: 'Twilio WhatsApp events' },
          ].map((a) => (
            <div key={a.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">{a.label}</p>
              <Mono className="bg-gray-100 px-2 py-1 rounded text-gray-600 block mb-1">{a.header}</Mono>
              <p className="text-[11px] text-gray-400">{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Response envelope */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Code size={14} className="text-brand-400" /> Standard Response Envelope
          </h3>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "data": { ... },
  "meta": {
    "cursor": "next_cursor",
    "hasMore": true,
    "total": 1024,
    "requestId": "req_abc123"
  },
  "error": null
}

// Error response:
{
  "data": null,
  "error": {
    "code": "CONTACT_NOT_FOUND",
    "message": "Contact not found",
    "status": 404
  }
}`}
          </pre>
        </div>
      </div>

      {/* Endpoint reference */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Globe size={14} className="text-brand-400" />
          <h3 className="text-sm font-semibold text-gray-800">All Endpoints — Base URL: <Mono className="text-brand-400">http://localhost:5000/api/v1</Mono></h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Auth</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.method + e.path}>
                  <td>
                    <span className={`badge ${methodColor(e.method)}`}>
                      {e.method}
                    </span>
                  </td>
                  <td><Mono className="text-gray-700">{e.path}</Mono></td>
                  <td className="text-xs text-gray-500">{e.auth}</td>
                  <td className="text-xs text-gray-500">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status codes */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Webhook size={14} className="text-brand-400" /> HTTP Status Codes
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: '200', label: 'Success' },
            { code: '201', label: 'Created' },
            { code: '400', label: 'Bad Request' },
            { code: '401', label: 'Unauthorized' },
            { code: '404', label: 'Not Found' },
            { code: '500', label: 'Server Error' },
          ].map((r) => (
            <div key={r.code} className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
              <span className={`badge ${r.code.startsWith('2') ? 'badge-success' : r.code.startsWith('4') ? 'badge-warning' : 'badge-danger'}`}>{r.code}</span>
              <p className="text-xs text-gray-600">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
