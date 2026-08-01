import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Inbox, FileText, Users, Package, LogOut, BarChart3, Menu, X, Newspaper, Briefcase, Kanban } from 'lucide-react'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'
import { GlobalSearch } from '@/admin/components/GlobalSearch'
import { cn } from '@/utils/cn'
import logo from '@/assets/logo.png'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/leads', label: 'Leads', icon: Inbox },
  { to: '/dashboard/pipeline', label: 'Sales Pipeline', icon: Kanban },
  { to: '/dashboard/documents', label: 'Documents', icon: FileText },
  { to: '/dashboard/projects', label: 'Projects', icon: Briefcase },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/products', label: 'Product Catalog', icon: Package },
  { to: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { to: '/dashboard/blog', label: 'Blog', icon: Newspaper },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary/10 text-primary' : 'text-navy/60 hover:bg-bg hover:text-navy',
            )
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const { signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/dashboard/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-navy/5 bg-white lg:flex">
        <div className="flex h-20 items-center px-6">
          <img src={logo} alt="Al Surur" className="h-8 w-auto" />
        </div>
        <NavLinks />
        <button
          onClick={handleSignOut}
          className="mx-4 mb-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex h-full w-72 flex-col bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-20 items-center justify-between px-6">
                <img src={logo} alt="Al Surur" className="h-8 w-auto" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={20} className="text-navy/60" />
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <button
                onClick={handleSignOut}
                className="mx-4 mb-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy/60 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <div className="flex h-20 items-center gap-3 border-b border-navy/5 bg-white px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-navy/60 hover:bg-bg lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <img src={logo} alt="Al Surur" className="h-7 w-auto lg:hidden" />
          <div className="ms-auto max-w-sm flex-1 lg:ms-0">
            <GlobalSearch />
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
