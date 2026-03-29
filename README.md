# NexaCRM — IVR + WhatsApp CRM Admin Dashboard

A production-ready React frontend for the Multi-Tenant IVR + WhatsApp CRM SaaS platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Global State | Zustand |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| HTTP Client | Axios |
| Realtime | Supabase Realtime |
| Notifications | React Hot Toast |

---

## Project Structure

```
src/
├── api/                    # All API layer files
│   ├── client.ts           # Axios instance + interceptors + auto-refresh
│   ├── auth.ts             # Auth endpoints
│   ├── contacts.ts         # Contacts CRUD
│   ├── calls.ts            # Calls endpoints
│   ├── messages.ts         # Messages + inbox
│   ├── campaigns.ts        # Campaigns + templates
│   └── index.ts            # Analytics, security, admin, settings
├── components/
│   ├── layout/             # AppLayout, Sidebar, Topbar
│   ├── auth/               # LoginPage, ProtectedRoute
│   ├── dashboard/          # DashboardPage
│   ├── calls/              # CallsPage (list + detail tabs)
│   ├── messages/           # MessagesPage (inbox + chat)
│   ├── contacts/           # ContactsPage + modals
│   ├── campaigns/          # CampaignsPage + stats
│   ├── analytics/          # AnalyticsPage (charts)
│   ├── security/           # SecurityPage (sessions, keys, logs)
│   ├── settings/           # SettingsPage + AdminPage
│   ├── api/                # ApiPage (reference docs)
│   └── common/             # Shared UI components
├── hooks/
│   └── useRealtime.ts      # Supabase Realtime subscriptions
├── store/
│   ├── authStore.ts        # Zustand auth state (persisted)
│   └── uiStore.ts          # Sidebar open/close
├── types/
│   └── index.ts            # All TypeScript types
└── utils/
    └── index.ts            # Date, number, string helpers
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Dev mode (no backend required)

On the login page, click **"Enter dev mode (bypass auth)"** to skip authentication and use mock data throughout the dashboard.

---

## API Integration

All API calls go through `src/api/client.ts` which handles:

- **JWT injection** from localStorage via request interceptor
- **Token refresh** on 401 — auto-retries the original request
- **Redirect to /login** if refresh also fails
- **Rate limit toasts** on 429
- **Server error toasts** on 5xx
- **Idempotency keys** — use `idempotentPost()` for message sends, campaign sends

### Making an API call

```typescript
import { contactsApi } from '@/api/contacts'
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['contacts', { search, stage }],
  queryFn: () => contactsApi.list({ search, stage }),
  select: (r) => r.data,
})
```

### Idempotent POST (for message send, campaign send)

```typescript
import { idempotentPost } from '@/api/client'

// Automatically adds Idempotency-Key header
const res = await idempotentPost('/messages/send', payload)
```

---

## Realtime Integration

The app uses Supabase Realtime for live updates. Channels are tenant-scoped.

| Hook | Channel | Events |
|---|---|---|
| `useInboxRealtime()` | `inbox:{tenant_id}` | `new_message`, `message_status` |
| `useCallsRealtime()` | `calls:{tenant_id}` | `call_started`, `call_updated`, `call_ended` |
| `useCampaignRealtime(id)` | `campaigns:{tenant_id}` | `campaign_progress` |

These hooks automatically invalidate TanStack Query caches on events.

They are initialized in `AppLayout.tsx` so they're active for the entire authenticated session.

---

## Authentication Flow

```
User submits login form
  → POST /api/v1/auth/login
  → Store access_token + refresh_token in localStorage + Zustand
  → Navigate to /

On any 401 response:
  → POST /api/v1/auth/refresh with refresh_token
  → Retry original request with new token
  → If refresh fails → clear auth → redirect /login
```

---

## Key Implementation Details

### Cursor-based Pagination

All list endpoints use cursor-based pagination (no offset). The pattern:

```typescript
const [cursor, setCursor] = useState<string | undefined>()

const { data } = useQuery({
  queryKey: ['contacts', { cursor }],
  queryFn: () => contactsApi.list({ cursor, limit: 20 }),
})

// Next page
setCursor(data?.meta?.cursor)

// Prev page (reset to first)
setCursor(undefined)
```

### Optimistic UI (Messages)

The message send flow uses React Query's mutation with optimistic updates. In production you can extend `sendMsg` in `MessagesPage.tsx` with `onMutate` to pre-add the message to the thread before the API responds.

### API Key Security

- Raw keys are shown **only once** after creation (the `newKeyCreated` state in `SecurityPage`)
- Stored keys are always masked via `maskApiKey()` — showing only the prefix
- Never log or send raw keys in any request body

### Soft Deletes

All delete operations are soft deletes (set `deleted_at`). The API returns `{ deleted: true }`. No hard deletes from the frontend — only super admin purge via `/api/v1/admin/tenants/:id` with confirmation string.

---

## Adding a New Page

1. Create `src/components/yourpage/YourPage.tsx`
2. Add API functions to the relevant file in `src/api/`
3. Add the route in `src/App.tsx`
4. Add the nav item in `src/components/layout/Sidebar.tsx`

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Point your web server at `dist/index.html` with a catch-all route for SPA support.

### Nginx config

```nginx
server {
  listen 80;
  root /var/www/ivr-crm/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `VITE_API_BASE_URL` | Yes | Your backend API base URL |

---

## Backend Notes

This frontend expects your backend at `VITE_API_BASE_URL` to implement the full API spec (`/api/v1/...`). All responses must follow the standard envelope:

```json
{ "data": ..., "meta": { "cursor": "...", "has_more": true }, "error": null }
```

See the full API specification document for complete endpoint details.
