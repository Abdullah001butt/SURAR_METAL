import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { Button } from '@/components/ui/Button'
import logo from '@/assets/logo.png'

export function LoginPage() {
  const { signIn, isAuthenticated, loading } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) setError('Invalid email or password.')
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <img src={logo} alt="Al Surur" className="h-10 w-auto" />
        </div>
        <h1 className="mt-6 text-center font-display text-xl font-semibold text-navy">Management System</h1>
        <p className="mt-1 text-center text-sm text-gray">Sign in to access the dashboard</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={submitting} icon={<Lock size={16} />}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
