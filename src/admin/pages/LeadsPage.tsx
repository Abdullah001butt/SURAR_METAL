import { Fragment, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Search } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { exportStyledExcel, STATUS_COLORS } from '@/admin/utils/excelExport'
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

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

  const updateLead = async (lead: UnifiedLead, patch: Partial<{ status: LeadStatus; notes: string }>) => {
    const [source, rawId] = lead.id.split('-')
    const table = source === 'quote' ? 'quote_requests' : 'contact_messages'
    await supabase.from(table).update(patch).eq('id', Number(rawId))
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
  }

  const exportExcel = () => {
    exportStyledExcel({
      title: 'Al Surur — Leads Export',
      subtitle: `${filtered.length} leads · Generated ${new Date().toLocaleString()}`,
      sheetName: 'Leads',
      filename: `al-surur-leads-${new Date().toISOString().slice(0, 10)}`,
      rows: filtered,
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
          onClick={exportExcel}
          className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          <Download size={14} /> Export Excel
        </button>
      </div>

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

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-start text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Name</th>
              <th className="px-5 py-3 text-start font-semibold">Contact</th>
              <th className="px-5 py-3 text-start font-semibold">Interest</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <Fragment key={lead.id}>
                <tr
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                  className="cursor-pointer border-b border-navy/5 last:border-0 hover:bg-bg"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-navy">{lead.name}</p>
                    {lead.company && <p className="text-xs text-gray">{lead.company}</p>}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray" dir="ltr">
                    <p>{lead.email}</p>
                    {lead.phone && <p>{lead.phone}</p>}
                  </td>
                  <td className="px-5 py-4 text-gray">{lead.interest ?? '—'}</td>
                  <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
                {expanded === lead.id && (
                  <tr className="border-b border-navy/5 bg-bg/60">
                    <td colSpan={5} className="px-5 py-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Message</p>
                          <p className="mt-1 text-sm text-navy">{lead.message || 'No message.'}</p>
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
    </div>
  )
}
