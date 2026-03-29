import React, { useState } from 'react'
import { Search, Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { authApi } from '@/api/auth'
import { LiveDot } from '@/components/common'

export function Topbar() {
  const { user, clearAuth } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState('')

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearAuth()
    navigate('/login')
    toast.success('Logged out')
  }

  const userInitials = user?.displayName?.slice(0, 2)?.toUpperCase() ?? 'U'

  return (
    <header className="h-[52px] bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
      <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 mr-1">
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xs flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
        <Search size={13} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts, calls…"
          className="flex-1 bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <kbd className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">⌘K</kbd>
        )}
      </div>

      <div className="flex-1" />

      {/* Live indicator */}
      <LiveDot label="Live" />

      {/* Tenant badge */}
      {user && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-600">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {user.tenantName}
          <ChevronDown size={11} className="text-gray-400" />
        </div>
      )}

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
        <Bell size={15} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex items-center gap-2 pl-1"
        >
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-semibold text-brand-700">
            {userInitials}
          </div>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-800">{user?.displayName}</p>
              <p className="text-[11px] text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => { navigate('/settings'); setProfileOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
            >
              <User size={13} /> Profile & Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
