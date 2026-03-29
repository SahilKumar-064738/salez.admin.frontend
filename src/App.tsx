import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/components/auth/LoginPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { CallsPage } from '@/components/calls/CallsPage'
import { MessagesPage } from '@/components/messages/MessagesPage'
import { ContactsPage } from '@/components/contacts/ContactsPage'
import { CampaignsPage } from '@/components/campaigns/CampaignsPage'
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage'
import { SecurityPage } from '@/components/security/SecurityPage'
import { ApiPage } from '@/components/api/ApiPage'
import { SettingsPage, AdminPage } from '@/components/settings/SettingsAndAdminPages'

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="calls" element={<Suspense fallback={<PageLoader />}><CallsPage /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoader />}><MessagesPage /></Suspense>} />
        <Route path="contacts" element={<Suspense fallback={<PageLoader />}><ContactsPage /></Suspense>} />
        <Route path="campaigns" element={<Suspense fallback={<PageLoader />}><CampaignsPage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
        <Route path="security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
        <Route path="api" element={<Suspense fallback={<PageLoader />}><ApiPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        <Route path="admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
      </Route>
    </Routes>
  )
}
