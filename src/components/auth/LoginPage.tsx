import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: 'admin@acme.com', password: 'password' })
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { accessToken, refreshToken, user } = res.data.data
      setAuth(user, accessToken, refreshToken)
      navigate('/')
      toast.success(`Welcome back, ${user?.displayName ?? 'User'}!`)
    } catch (err: any) {
      toast.error(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">NexaCRM</span>
          </div>
          <p className="text-sm text-gray-400">IVR + WhatsApp CRM Platform</p>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@acme.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center py-2.5 text-sm"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
