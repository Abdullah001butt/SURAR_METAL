import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ProgressBar } from '@/admin/components/ProgressBar'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { formatAED } from '@/admin/utils/documentCalc'
import type { Project, ProjectStatus } from '@/admin/types'

const STATUS_OPTIONS: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']

async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*, client:customers(*)').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const { data: projects, isLoading } = useQuery({ queryKey: ['admin-projects'], queryFn: fetchProjects })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const q = search.toLowerCase()
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.client?.name ?? '').toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [projects, search, statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('projects').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Projects</h1>
          <p className="mt-1 text-sm text-gray">Track project status, progress, budget and deliverables.</p>
        </div>
        <Link to="/dashboard/projects/new">
          <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            <Plus size={16} /> New Project
          </button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray" />
          <input
            placeholder="Search by project or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-xl border border-navy/10 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')} className="rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Project</th>
              <th className="px-5 py-3 text-start font-semibold">Client</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="px-5 py-3 text-start font-semibold">Progress</th>
              <th className="px-5 py-3 text-start font-semibold">Budget</th>
              <th className="px-5 py-3 text-start font-semibold">Deadline</th>
              <th className="w-12 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link to={`/dashboard/projects/${p.id}`} className="font-semibold text-navy hover:text-primary">{p.name}</Link>
                  {p.category && <p className="text-xs text-gray">{p.category}</p>}
                </td>
                <td className="px-5 py-4 text-navy">{p.client?.name ?? '—'}</td>
                <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-4"><ProgressBar value={p.progress_pct} className="w-32" /></td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(p.budget)}</td>
                <td className="px-5 py-4 text-xs text-gray">{p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setDeleteTarget(p)}
                    aria-label="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg text-gray opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && <p className="py-10 text-center text-sm text-gray">No projects yet.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project?"
          description={`"${deleteTarget.name}" and its linked photos/documents will be permanently removed.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
