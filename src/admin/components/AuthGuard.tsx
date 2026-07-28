import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-bg text-sm text-gray">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />
  }

  return <>{children}</>
}
