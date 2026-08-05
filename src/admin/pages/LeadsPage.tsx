import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Clock, Download, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { exportStyledExcel, STATUS_COLORS } from '@/admin/utils/excelExport'
import { cn } from '@/utils/cn'
import type { LeadStatus } from '@/admin/types'

interface UnifiedLead {
  id: string
  source: 'quote' | 'contact'
  name: string
  company: string | null
  email: string
  phone: string | null
  interest: string | null
  message: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']

function hoursSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / 3_600_000
}

function formatElapsed(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`
  if (hours < 24) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

function ResponseBadge({ createdAt }: { createdAt: string }) {
  const hours = hoursSince(createdAt)
  const isOverdue = hours >= 24
  const isWarning = hours >= 12 && hours < 24
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
        isOverdue ? 'bg-red-50 text-red-600' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-bg text-gray',
      )}
    >
      {isOverdue ? <AlertTriangle size={11} /> : <Clock size={11} />}
      {formatElapsed(hours)}
    </span>
  )
}

async function fetchLeads(): Promise<UnifiedLead[]> {
  const [quotesRes, contactsRes] = await Promise.all([
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
  ])

  const quotes: UnifiedLead[] = (quotesRes.data ?? []).map((q) => ({
    id: `quote-${q.id}`,
    source: 'quote',
    name: q.name,
    company: q.company,
    email: q.email,
    phone: q.phone,
    interest: q.product_interest,
    message: q.message,
    status: q.status,
    notes: q.notes,
    created_at: q.created_at,
  }))

  const contacts: UnifiedLead[] = (contactsRes.data ?? []).map((c) => ({
    id: `contact-${c.id}`,
    source: 'contact',
    name: c.name,
    company: null,
    email: c.email,
    phone: null,
    interest: null,
    message: c.message,
    status: c.status,
    notes: c.notes,
    created_at: c.created_at,
  }))

  return [...quotes, ...contacts].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function LeadsPage() {
  const queryClient = useQueryClient()
  const { data: leads, isLoading } = useQuery({ queryKey: ['admin-leads'], queryFn: fetchLeads })
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(highlightId)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<UnifiedLead | null>(null)
  const [deleting, setDeleting] = useState(false)
  const highlightRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    if (highlightId && leads) {
      setExpanded(highlightId)
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setSearchParams({}, { replace: true })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightId, leads, setSearchParams])

  const filtered = useMemo(() => {
    if (!leads) return []
    return leads.filter((l) => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter
      const q = search.toLowerCase()
      const matchesSearch =
        !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company ?? '').toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [leads, search, statusFilter])

  const overdueLeads = useMemo(() => (leads ?? []).filter((l) => l.status === 'new' && hoursSince(l.created_at) >= 24), [leads])

  const updateLead = async (
    lead: UnifiedLead,
    patch: Partial<{ status: LeadStatus; notes: string; name: string; email: string; company: string; phone: string; product_interest: string }>,
  ) => {
    const [source, rawId] = lead.id.split('-')
    const table = source === 'quote' ? 'quote_requests' : 'contact_messages'
    // contact_messages has no company/phone/product_interest columns — strip those out
    // if this lead came from the contact form rather than the quote form.
    const safePatch = source === 'quote' ? patch : { status: patch.status, notes: patch.notes, name: patch.name, email: patch.email }
    await supabase.from(table).update(safePatch).eq('id', Number(rawId))
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const [source, rawId] = deleteTarget.id.split('-')
    const table = source === 'quote' ? 'quote_requests' : 'contact_messages'
    await supabase.from(table).delete().eq('id', Number(rawId))
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
  }

  const bulkUpdateStatus = async (status: LeadStatus) => {
    const selectedLeads = filtered.filter((l) => selected.has(l.id))
    const quoteIds = selectedLeads.filter((l) => l.source === 'quote').map((l) => Number(l.id.split('-')[1]))
    const contactIds = selectedLeads.filter((l) => l.source === 'contact').map((l) => Number(l.id.split('-')[1]))

    await Promise.all([
      quoteIds.length > 0 ? supabase.from('quote_requests').update({ status }).in('id', quoteIds) : Promise.resolve(),
      contactIds.length > 0 ? supabase.from('contact_messages').update({ status }).in('id', contactIds) : Promise.resolve(),
    ])
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
    setSelected(new Set())
  }

  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const bulkDelete = async () => {
    setBulkDeleting(true)
    const selectedLeads = filtered.filter((l) => selected.has(l.id))
    const quoteIds = selectedLeads.filter((l) => l.source === 'quote').map((l) => Number(l.id.split('-')[1]))
    const contactIds = selectedLeads.filter((l) => l.source === 'contact').map((l) => Number(l.id.split('-')[1]))

    await Promise.all([
      quoteIds.length > 0 ? supabase.from('quote_requests').delete().in('id', quoteIds) : Promise.resolve(),
      contactIds.length > 0 ? supabase.from('contact_messages').delete().in('id', contactIds) : Promise.resolve(),
    ])
    setBulkDeleting(false)
    setConfirmBulkDelete(false)
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
    setSelected(new Set())
  }

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id))
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map((l) => l.id)))
  }

  const exportRows = (rows: UnifiedLead[], label: string) => {
    exportStyledExcel({
      title: 'Al Surur — Leads Export',
      subtitle: `${rows.length} leads · Generated ${new Date().toLocaleString()}`,
      sheetName: 'Leads',
      filename: `al-surur-leads-${label}-${new Date().toISOString().slice(0, 10)}`,
      rows,
      columns: [
        { header: 'Name', value: (l) => l.name, width: 22 },
        { header: 'Company', value: (l) => l.company ?? '—', width: 24 },
        { header: 'Email', value: (l) => l.email, width: 28 },
        { header: 'Phone', value: (l) => l.phone ?? '—', width: 16 },
        { header: 'Interest', value: (l) => l.interest ?? '—', width: 20 },
        { header: 'Status', value: (l) => l.status, width: 14, highlight: (l) => STATUS_COLORS[l.status] ?? null },
        { header: 'Notes', value: (l) => l.notes ?? '', width: 30 },
        { header: 'Received', value: (l) => new Date(l.created_at), width: 18 },
      ],
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Leads</h1>
          <p className="mt-1 text-sm text-gray">Quote requests and contact messages from the website.</p>
        </div>
        <button
          onClick={() => exportRows(filtered, 'all')}
          className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          <Download size={14} /> Export Excel
        </button>
      </div>

      {overdueLeads.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>{overdueLeads.length}</strong> lead{overdueLeads.length > 1 ? 's have' : ' has'} gone{' '}
            <strong>24+ hours</strong> without a response.
          </span>
          <button
            onClick={() => setStatusFilter('new')}
            className="ms-auto shrink-0 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Show new leads
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray" />
          <input
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-xl border border-navy/10 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-navy px-5 py-3 text-white">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value as LeadStatus)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm outline-none"
          >
            <option value="" disabled>Set status to...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="text-navy">{s}</option>
            ))}
          </select>
          <button
            onClick={() => exportRows(filtered.filter((l) => selected.has(l.id)), 'selected')}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          >
            <Download size={13} /> Export Selected
          </button>
          <button
            onClick={() => setConfirmBulkDelete(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-semibold text-red-100 hover:bg-red-500/30"
          >
            <Trash2 size={13} /> Delete Selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ms-auto flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
          >
            <X size={14} /> Clear
          </button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-start text-xs uppercase tracking-widest text-gray">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-navy/20" />
              </th>
              <th className="px-5 py-3 text-start font-semibold">Name</th>
              <th className="px-5 py-3 text-start font-semibold">Contact</th>
              <th className="px-5 py-3 text-start font-semibold">Interest</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
              <th className="px-5 py-3 text-start font-semibold">Response</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <Fragment key={lead.id}>
                <tr
                  ref={expanded === lead.id ? highlightRef : undefined}
                  className={`border-b border-navy/5 last:border-0 hover:bg-bg ${expanded === lead.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleSelected(lead.id)}
                      className="h-4 w-4 rounded border-navy/20"
                    />
                  </td>
                  <td className="cursor-pointer px-5 py-4" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                    <p className="font-semibold text-navy">{lead.name}</p>
                    {lead.company && <p className="text-xs text-gray">{lead.company}</p>}
                  </td>
                  <td className="cursor-pointer px-5 py-4 text-xs text-gray" dir="ltr" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                    <p>{lead.email}</p>
                    {lead.phone && <p>{lead.phone}</p>}
                  </td>
                  <td className="cursor-pointer px-5 py-4 text-gray" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>{lead.interest ?? '—'}</td>
                  <td className="cursor-pointer px-5 py-4" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}><StatusBadge status={lead.status} /></td>
                  <td className="cursor-pointer px-5 py-4 text-xs text-gray" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="cursor-pointer px-5 py-4" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                    {lead.status === 'new' ? <ResponseBadge createdAt={lead.created_at} /> : <span className="text-xs text-gray">—</span>}
                  </td>
                </tr>
                {expanded === lead.id && (
                  <tr className="border-b border-navy/5 bg-bg/60">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Name</p>
                            <input
                              defaultValue={lead.name}
                              onBlur={(e) => updateLead(lead, { name: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Email</p>
                            <input
                              defaultValue={lead.email}
                              dir="ltr"
                              onBlur={(e) => updateLead(lead, { email: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                            />
                          </div>
                          {lead.source === 'quote' && (
                            <>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray">Company</p>
                                <input
                                  defaultValue={lead.company ?? ''}
                                  onBlur={(e) => updateLead(lead, { company: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray">Phone</p>
                                <input
                                  defaultValue={lead.phone ?? ''}
                                  dir="ltr"
                                  onBlur={(e) => updateLead(lead, { phone: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray">Interest</p>
                                <input
                                  defaultValue={lead.interest ?? ''}
                                  onBlur={(e) => updateLead(lead, { product_interest: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Message</p>
                            <p className="mt-1 text-sm text-navy">{lead.message || 'No message.'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Status</p>
                          <select
                            value={lead.status}
                            onChange={(e) => updateLead(lead, { status: e.target.value as LeadStatus })}
                            className="mt-1 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gray">Notes</p>
                          <textarea
                            defaultValue={lead.notes ?? ''}
                            onBlur={(e) => updateLead(lead, { notes: e.target.value })}
                            placeholder="Internal follow-up notes..."
                            rows={2}
                            className="mt-1 w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(lead) }}
                            className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Delete Lead
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && <p className="py-10 text-center text-sm text-gray">No leads found.</p>}
        {isLoading && <p className="py-10 text-center text-sm text-gray">Loading...</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete lead?"
          description={`"${deleteTarget.name}" will be permanently removed. This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmDialog
          title={`Delete ${selected.size} lead${selected.size > 1 ? 's' : ''}?`}
          description="These leads will be permanently removed. This can't be undone."
          onConfirm={bulkDelete}
          onClose={() => setConfirmBulkDelete(false)}
          loading={bulkDeleting}
        />
      )}
    </div>
  )
}
