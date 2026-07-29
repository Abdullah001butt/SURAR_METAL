import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { DollarSign, Inbox, FileText, TrendingUp, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { formatAED } from '@/admin/utils/documentCalc'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { RevenueTrendChart } from '@/admin/components/charts/RevenueTrendChart'
import { StatusBreakdownChart } from '@/admin/components/charts/StatusBreakdownChart'

const STATUS_CHART_COLORS: Record<string, string> = {
  draft: '#64748B',
  sent: '#2563EB',
  paid: '#059669',
  overdue: '#DC2626',
}

async function fetchOverview() {
  const [documentsRes, itemsRes, leadsRes, contactsRes, productsRes] = await Promise.all([
    supabase.from('documents').select('id, doc_number, doc_type, status, doc_date, converted_from_id, customer:customers(name)').order('created_at', { ascending: false }),
    supabase.from('document_items').select('document_id, qty, unit_price'),
    supabase.from('quote_requests').select('id, name, company, product_interest, status, created_at').order('created_at', { ascending: false }),
    supabase.from('contact_messages').select('id, name, status, created_at').order('created_at', { ascending: false }),
    supabase.from('products').select('id, description, stock_qty, reorder_level'),
  ])

  const documents = documentsRes.data ?? []
  const items = itemsRes.data ?? []
  const leads = leadsRes.data ?? []
  const contacts = contactsRes.data ?? []
  const lowStockProducts = (productsRes.data ?? []).filter((p) => p.reorder_level > 0 && p.stock_qty <= p.reorder_level)

  const totalsByDoc = new Map<number, number>()
  for (const item of items) {
    totalsByDoc.set(item.document_id, (totalsByDoc.get(item.document_id) ?? 0) + item.qty * item.unit_price)
  }

  const paidDocs = documents.filter((d) => d.status === 'paid')
  const revenue = paidDocs.reduce((sum, d) => sum + (totalsByDoc.get(d.id) ?? 0), 0)
  const outstanding = documents
    .filter((d) => d.status === 'sent' || d.status === 'overdue')
    .reduce((sum, d) => sum + (totalsByDoc.get(d.id) ?? 0), 0)

  const quotations = documents.filter((d) => d.doc_type === 'quotation')
  const convertedQuotations = quotations.filter((d) => documents.some((other) => other.converted_from_id === d.id))
  const conversionRate = quotations.length ? Math.round((convertedQuotations.length / quotations.length) * 100) : 0

  const customerCounts = new Map<string, number>()
  for (const d of documents) {
    const name = (d.customer as { name?: string } | null)?.name
    if (name) customerCounts.set(name, (customerCounts.get(name) ?? 0) + 1)
  }
  const topCustomers = [...customerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  const newLeadsCount = leads.filter((l) => l.status === 'new').length + contacts.filter((c) => c.status === 'new').length
  const isOverdue = (createdAt: string) => Date.now() - new Date(createdAt).getTime() >= 24 * 3_600_000
  const overdueLeads = [
    ...leads.filter((l) => l.status === 'new' && isOverdue(l.created_at)).map((l) => ({ id: `quote-${l.id}`, name: l.name, sub: l.company, created_at: l.created_at })),
    ...contacts.filter((c) => c.status === 'new' && isOverdue(c.created_at)).map((c) => ({ id: `contact-${c.id}`, name: c.name, sub: null as string | null, created_at: c.created_at })),
  ]

  // Revenue trend: paid documents' totals, bucketed by month, last 6 months
  const now = new Date()
  const monthBuckets: { key: string; label: string }[] = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) }
  })
  const revenueByMonth = new Map<string, number>(monthBuckets.map((m) => [m.key, 0]))
  for (const d of paidDocs) {
    const date = new Date(d.doc_date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (totalsByDoc.get(d.id) ?? 0))
    }
  }
  const revenueTrend = monthBuckets.map((m) => ({ label: m.label, value: revenueByMonth.get(m.key) ?? 0 }))

  const statusBreakdown = ['draft', 'sent', 'paid', 'overdue'].map((status) => ({
    key: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: documents.filter((d) => d.status === status).length,
    color: STATUS_CHART_COLORS[status],
  }))

  return {
    documents: documents.slice(0, 6),
    revenue,
    outstanding,
    conversionRate,
    topCustomers,
    newLeadsCount,
    leads: leads.slice(0, 5),
    lowStockProducts,
    revenueTrend,
    statusBreakdown,
    overdueLeads,
  }
}

export function OverviewPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-overview'], queryFn: fetchOverview })

  const cards = [
    { label: 'Revenue (Paid)', value: data ? `AED ${formatAED(data.revenue)}` : '—', icon: DollarSign },
    { label: 'Outstanding', value: data ? `AED ${formatAED(data.outstanding)}` : '—', icon: TrendingUp },
    { label: 'New Leads', value: data ? data.newLeadsCount : '—', icon: Inbox },
    { label: 'Quote → Invoice Rate', value: data ? `${data.conversionRate}%` : '—', icon: FileText },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy">Overview</h1>
      <p className="mt-1 text-sm text-gray">Business snapshot across leads and documents.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray">{c.label}</span>
              <c.icon size={16} className="text-primary" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-navy">{isLoading ? '...' : c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-navy">Revenue — Last 6 Months</h2>
          <div className="mt-4">
            {data ? <RevenueTrendChart data={data.revenueTrend} /> : <div className="h-[220px] animate-pulse rounded-xl bg-bg" />}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <h2 className="font-display text-lg font-semibold text-navy">Documents by Status</h2>
          <div className="mt-5">
            {data ? <StatusBreakdownChart data={data.statusBreakdown} /> : <div className="h-[150px] animate-pulse rounded-xl bg-bg" />}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy">Recent Documents</h2>
            <Link to="/dashboard/documents" className="flex items-center gap-1 text-xs font-semibold text-primary">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.documents.map((d) => (
              <Link
                key={d.id}
                to={`/dashboard/documents/${d.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-bg"
              >
                <div>
                  <p className="font-semibold text-navy">{d.doc_number}</p>
                  <p className="text-xs text-gray">{(d.customer as { name?: string } | null)?.name ?? 'No customer'}</p>
                </div>
                <StatusBadge status={d.status} />
              </Link>
            ))}
            {!isLoading && data?.documents.length === 0 && <p className="py-6 text-center text-sm text-gray">No documents yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <h2 className="font-display text-lg font-semibold text-navy">Top Customers</h2>
          <div className="mt-4 space-y-3">
            {data?.topCustomers.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-navy">{name}</span>
                <span className="text-xs font-semibold text-gray">{count} docs</span>
              </div>
            ))}
            {!isLoading && data?.topCustomers.length === 0 && <p className="py-6 text-center text-sm text-gray">No data yet.</p>}
          </div>
        </div>
      </div>

      {data && data.overdueLeads.length > 0 && (
        <div className="mt-8 rounded-2xl bg-red-50 p-6 ring-1 ring-red-200">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-red-700">
              <AlertTriangle size={18} /> Leads Awaiting Response
            </h2>
            <Link to="/dashboard/leads" className="flex items-center gap-1 text-xs font-semibold text-red-700">
              View leads <ArrowUpRight size={12} />
            </Link>
          </div>
          <p className="mt-1 text-xs text-red-700/80">These leads have had no status update in 24+ hours.</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.overdueLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-navy">{l.name}{l.sub ? ` · ${l.sub}` : ''}</span>
                <span className="text-xs font-semibold text-red-600">
                  {Math.round((Date.now() - new Date(l.created_at).getTime()) / 3_600_000)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && data.lowStockProducts.length > 0 && (
        <div className="mt-8 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-amber-800">
              <AlertTriangle size={18} /> Low Stock
            </h2>
            <Link to="/dashboard/products" className="flex items-center gap-1 text-xs font-semibold text-amber-800">
              Manage stock <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                <span className="text-navy">{p.description}</span>
                <span className="text-xs font-semibold text-amber-700">{p.stock_qty} left (reorder at {p.reorder_level})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-navy/5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">Recent Leads</h2>
          <Link to="/dashboard/leads" className="flex items-center gap-1 text-xs font-semibold text-primary">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {data?.leads.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-bg">
              <div>
                <p className="font-semibold text-navy">{l.name} · {l.company}</p>
                <p className="text-xs text-gray">{l.product_interest}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
          {!isLoading && data?.leads.length === 0 && <p className="py-6 text-center text-sm text-gray">No leads yet.</p>}
        </div>
      </div>
    </div>
  )
}
