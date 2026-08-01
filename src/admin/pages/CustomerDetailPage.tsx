import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, FileText, Phone, MapPin, Hash, Briefcase, Inbox, Clock, MessageSquare, PlusCircle, ArrowRightLeft } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ProgressBar } from '@/admin/components/ProgressBar'
import { CustomerModal } from '@/admin/components/CustomerModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { calcTotals, formatAED, DOC_TYPE_LABELS } from '@/admin/utils/documentCalc'
import type { AlSururDocument, Customer, Project } from '@/admin/types'

interface TimelineEvent {
  id: string
  date: string
  icon: typeof FileText
  title: string
  note?: string
}

async function fetchCustomerDetail(id: number) {
  const [customerRes, documentsRes, projectsRes] = await Promise.all([
    supabase.from('customers').select('*').eq('id', id).single(),
    supabase.from('documents').select('*, items:document_items(*)').eq('customer_id', id).order('doc_date', { ascending: false }),
    supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])
  if (customerRes.error) throw customerRes.error

  const customer = customerRes.data as Customer
  const documents = ((documentsRes.data ?? []) as AlSururDocument[]).map((doc) => {
    const { net } = calcTotals(doc.items ?? [], doc.discount, doc.vat_rate)
    return { ...doc, total: net }
  })
  const projects = (projectsRes.data ?? []) as Project[]

  // Best-effort match: leads that share this customer's phone number.
  let matchedLeads: { id: string; name: string; interest: string | null; created_at: string; source: 'quote' | 'contact' }[] = []
  if (customer.phone) {
    const { data: quotes } = await supabase.from('quote_requests').select('id, name, product_interest, created_at').eq('phone', customer.phone)
    matchedLeads = (quotes ?? []).map((q) => ({ id: `quote-${q.id}`, name: q.name, interest: q.product_interest, created_at: q.created_at, source: 'quote' as const }))
  }

  const docIds = documents.map((d) => d.id)
  let activity: { id: number; document_id: number; event_type: string; note: string | null; created_at: string }[] = []
  if (docIds.length > 0) {
    const { data } = await supabase.from('document_activity').select('*').in('document_id', docIds).order('created_at', { ascending: false })
    activity = data ?? []
  }

  return { customer, documents, projects, matchedLeads, activity }
}

const ACTIVITY_LABELS: Record<string, string> = {
  created: 'Document created',
  status_change: 'Status changed',
  note: 'Note added',
  converted: 'Converted',
}

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const customerId = Number(id)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer-detail', customerId],
    queryFn: () => fetchCustomerDetail(customerId),
    enabled: !!customerId,
  })
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('customers').delete().eq('id', customerId)
    setDeleting(false)
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    navigate('/dashboard/customers', { replace: true })
  }

  if (isLoading) return <p className="text-sm text-gray">Loading...</p>
  if (!data) return null

  const { customer, documents, projects, matchedLeads, activity } = data
  const lifetimeValue = documents.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.total, 0)
  const outstanding = documents.filter((d) => d.status === 'sent' || d.status === 'overdue').reduce((sum, d) => sum + d.total, 0)
  const lastOrderDate = documents[0]?.doc_date

  // Unified 360 timeline: leads → documents → activity → projects, all merged chronologically.
  const timeline: TimelineEvent[] = [
    ...matchedLeads.map((l): TimelineEvent => ({ id: l.id, date: l.created_at, icon: Inbox, title: `Inquiry received`, note: l.interest ?? undefined })),
    ...documents.map((d): TimelineEvent => ({ id: `doc-${d.id}`, date: d.created_at, icon: FileText, title: `${DOC_TYPE_LABELS[d.doc_type]} ${d.doc_number} created` })),
    ...activity.filter((a) => a.event_type !== 'created').map((a): TimelineEvent => ({
      id: `act-${a.id}`,
      date: a.created_at,
      icon: a.event_type === 'note' ? MessageSquare : a.event_type === 'converted' ? ArrowRightLeft : Clock,
      title: ACTIVITY_LABELS[a.event_type] ?? a.event_type,
      note: a.note ?? undefined,
    })),
    ...projects.map((p): TimelineEvent => ({ id: `proj-${p.id}`, date: p.created_at, icon: Briefcase, title: `Project started: ${p.name}` })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="pb-16">
      <Link to="/dashboard/customers" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray">
            {customer.phone && <span className="flex items-center gap-1.5" dir="ltr"><Phone size={14} /> {customer.phone}</span>}
            {customer.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {customer.address}</span>}
            {customer.trn_no && <span className="flex items-center gap-1.5" dir="ltr"><Hash size={14} /> {customer.trn_no}</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowEdit(true)} icon={<Pencil size={14} />}>Edit</Button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Lifetime Value (Paid)</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy" dir="ltr">AED {formatAED(lifetimeValue)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Outstanding</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary" dir="ltr">AED {formatAED(outstanding)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Documents</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy">{documents.length}</p>
          {lastOrderDate && <p className="mt-1 text-xs text-gray">Last: {new Date(lastOrderDate).toLocaleDateString()}</p>}
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Projects</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy">{projects.length}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {projects.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
              <div className="flex items-center gap-2 border-b border-navy/5 px-6 py-4">
                <Briefcase size={16} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-navy">Projects</h2>
              </div>
              <div className="divide-y divide-navy/5">
                {projects.map((p) => (
                  <Link key={p.id} to={`/dashboard/projects/${p.id}`} className="flex flex-col gap-2 px-6 py-4 hover:bg-bg sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy">{p.name}</p>
                      <p className="text-xs text-gray">{p.category ?? 'Uncategorized'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={p.status} />
                      <ProgressBar value={p.progress_pct} className="w-28" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
            <div className="border-b border-navy/5 px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-navy">Documents</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
                  <th className="px-5 py-3 text-start font-semibold">Number</th>
                  <th className="px-5 py-3 text-start font-semibold">Type</th>
                  <th className="px-5 py-3 text-start font-semibold">Date</th>
                  <th className="px-5 py-3 text-start font-semibold">Total</th>
                  <th className="px-5 py-3 text-start font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-b border-navy/5 last:border-0 hover:bg-bg">
                    <td className="px-5 py-4">
                      <Link to={`/dashboard/documents/${d.id}`} className="flex items-center gap-2 font-semibold text-primary" dir="ltr">
                        <FileText size={14} /> {d.doc_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray">{DOC_TYPE_LABELS[d.doc_type]}</td>
                    <td className="px-5 py-4 text-xs text-gray">{new Date(d.doc_date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(d.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && <p className="py-10 text-center text-sm text-gray">No documents for this customer yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <h2 className="font-display text-lg font-semibold text-navy">Activity Timeline</h2>
          <p className="mt-1 text-xs text-gray">Every inquiry, document, and update for this customer, in one place.</p>
          <div className="relative mt-5 max-h-[600px] space-y-5 overflow-y-auto ps-1">
            {timeline.map((event) => (
              <div key={event.id} className="relative flex gap-3 ps-6">
                <span className="absolute start-0 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                  <event.icon size={11} />
                </span>
                <div className="flex-1 border-s border-navy/10 pb-1 ps-4">
                  <p className="text-sm font-medium text-navy">{event.title}</p>
                  {event.note && <p className="mt-0.5 text-xs text-gray">{event.note}</p>}
                  <p className="mt-0.5 text-[11px] text-gray">{new Date(event.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <PlusCircle size={20} className="text-gray" />
                <p className="mt-2 text-xs text-gray">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <CustomerModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', customerId] })
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete customer?"
          description={`"${customer.name}" will be removed. Documents already linked keep their record but lose the customer reference.`}
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
