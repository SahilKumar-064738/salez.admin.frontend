import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUIStore } from '@/store/uiStore'
import { useInboxRealtime, useCallsRealtime } from '@/hooks/useRealtime'
import { cn } from '@/utils'

export function AppLayout() {
  const { sidebarOpen } = useUIStore()

  // Subscribe to realtime channels
  useInboxRealtime()
  useCallsRealtime()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-[1400px] mx-auto space-y-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
