import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/admin/components/ProgressBar'
import { MultiPhotosField, MultiDocumentsField } from '@/admin/components/MultiFileUploadField'
import type { Customer, Project, ProjectDocument, ProjectStatus } from '@/admin/types'

const STATUS_OPTIONS: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

async function fetchProject(id: number): Promise<Project> {
  const { data, error } = await supabase.from('projects').select('*, client:customers(*)').eq('id', id).single()
  if (error) throw error
  return data
}

export function ProjectEditorPage() {
  const location = useLocation()
  return <ProjectEditorPageInner key={location.pathname} />
}

function ProjectEditorPageInner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const { data: customers } = useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
  const { data: existingProject } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => fetchProject(Number(id)),
    enabled: !isNew,
  })

  const [name, setName] = useState('')
  const [clientId, setClientId] = useState<number | null>(null)
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [progress, setProgress] = useState(0)
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assignedStaff, setAssignedStaff] = useState('')
  const [category, setCategory] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name)
      setClientId(existingProject.client_id)
      setStatus(existingProject.status)
      setProgress(existingProject.progress_pct)
      setBudget(String(existingProject.budget))
      setDeadline(existingProject.deadline ?? '')
      setAssignedStaff(existingProject.assigned_staff ?? '')
      setCategory(existingProject.category ?? '')
      setPhotos(existingProject.photos ?? [])
      setDocuments(existingProject.documents ?? [])
    }
  }, [existingProject])

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        name,
        client_id: clientId,
        status,
        progress_pct: progress,
        budget: Number(budget) || 0,
        deadline: deadline || null,
        assigned_staff: assignedStaff || null,
        category: category || null,
        photos,
        documents,
      }

      if (existingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', existingProject.id)
        if (error) throw error
        queryClient.invalidateQueries({ queryKey: ['admin-project', id] })
      } else {
        const { data, error } = await supabase.from('projects').insert(payload).select('id').single()
        if (error) throw error
        navigate(`/dashboard/projects/${data.id}`, { replace: true })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard/projects" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <Button onClick={save} disabled={saving || !name} icon={<Save size={16} />}>
          {saving ? 'Saving...' : 'Save Project'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jebel Ali Warehouse Racking Installation"
              className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Client</label>
                <select value={clientId ?? ''} onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : null)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select client...</option>
                  {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Pallet Racking" className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray">Progress ({progress}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <ProgressBar value={progress} className="mt-2" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Budget (AED)</label>
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} dir="ltr" className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Assigned Staff</label>
                <input value={assignedStaff} onChange={(e) => setAssignedStaff(e.target.value)} placeholder="e.g. Hussain, Fabez" className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <MultiPhotosField bucket="project-assets" folder="photos" value={photos} onChange={setPhotos} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <MultiDocumentsField bucket="project-assets" folder="documents" value={documents} onChange={setDocuments} />
          </div>
        </div>
      </div>
    </div>
  )
}
