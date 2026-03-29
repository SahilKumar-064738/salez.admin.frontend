import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Phone, MessageSquare, Users, Megaphone,
  BarChart3, Shield, Key, Settings, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/utils'
import { useAuthStore } from '@/store/authStore'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/calls', label: 'Calls / IVR', icon: Phone },
      { to: '/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Data',
    items: [
      { to: '/contacts', label: 'Contacts', icon: Users },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/security', label: 'Security', icon: Shield },
      { to: '/api', label: 'API & Keys', icon: Key },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const isSuperAdmin = (user as any)?.user_metadata?.is_super_admin === true || user?.role === 'owner'
  const userInitials = user?.displayName?.slice(0, 2)?.toUpperCase() ?? 'U'

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-brand-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-tight">NexaCRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        ))}

        {/* Admin section */}
        {isSuperAdmin && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="px-4 py-2 text-[10px] font-semibold text-orange-400 uppercase tracking-widest">
              Super Admin
            </p>
            <NavItem to="/admin" label="Admin Panel" icon={ShieldAlert} adminStyle />
          </div>
        )}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-semibold text-brand-700">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  adminStyle,
}: {
  to: string
  label: string
  icon: React.ElementType
  badge?: number | null
  adminStyle?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-4 py-2 mx-1 rounded-lg text-sm transition-colors group',
          isActive
            ? adminStyle
              ? 'bg-orange-50 text-orange-700 font-medium'
              : 'bg-brand-50 text-brand-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={15}
            className={cn(
              isActive
                ? adminStyle ? 'text-orange-500' : 'text-brand-500'
                : 'text-gray-400 group-hover:text-gray-600',
            )}
          />
          <span className="flex-1">{label}</span>
        </>
      )}
    </NavLink>
  )
}
