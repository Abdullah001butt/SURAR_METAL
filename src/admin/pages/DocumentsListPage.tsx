import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Download, Plus, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { DOC_TYPE_LABELS, formatAED } from '@/admin/utils/documentCalc'
import { calcTotals, calcMarginTotals } from '@/admin/utils/documentCalc'
import { exportStyledExcel, STATUS_COLORS } from '@/admin/utils/excelExport'
import type { AlSururDocument, DocType, DocStatus } from '@/admin/types'

const STATUS_OPTIONS: DocStatus[] = ['draft', 'sent', 'paid', 'overdue']

type DocumentRow = AlSururDocument & { total: number; marginPct: number }

async function fetchDocuments(): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, customer:customers(*), items:document_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data as AlSururDocument[]).map((doc) => {
    const { net } = calcTotals(doc.items ?? [], doc.discount, doc.vat_rate, doc.manual_total)
    const { pct } = calcMarginTotals(doc.items ?? [])
    return { ...doc, total: net, marginPct: pct }
  })
}

export function DocumentsListPage() {
  const queryClient = useQueryClient()
  const { data: documents, isLoading } = useQuery({ queryKey: ['admin-documents'], queryFn: fetchDocuments })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<AlSururDocument | 'bulk' | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    if (!documents) return []
    return documents.filter((d) => {
      const matchesType = typeFilter === 'all' || d.doc_type === typeFilter
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      const q = search.toLowerCase()
      const matchesSearch = !q || d.doc_number.toLowerCase().includes(q) || (d.customer?.name ?? '').toLowerCase().includes(q)
      return matchesType && matchesStatus && matchesSearch
    })
  }, [documents, search, typeFilter, statusFilter])

  const toggleSelected = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id))
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map((d) => d.id)))
  }

  const bulkUpdateStatus = async (status: DocStatus) => {
    await supabase.from('documents').update({ status }).in('id', [...selected])
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
    setSelected(new Set())
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget === 'bulk') {
      await supabase.from('documents').delete().in('id', [...selected])
      setSelected(new Set())
    } else {
      await supabase.from('documents').delete().eq('id', deleteTarget.id)
    }
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
  }

  const exportRows = (rows: DocumentRow[], label: string) => {
    exportStyledExcel({
      title: 'Al Surur — Documents Export',
      subtitle: `${rows.length} documents · Generated ${new Date().toLocaleString()}`,
      sheetName: 'Documents',
      filename: `al-surur-documents-${label}-${new Date().toISOString().slice(0, 10)}`,
      rows,
      columns: [
        { header: 'Number', value: (d) => d.doc_number, width: 16 },
        { header: 'Type', value: (d) => DOC_TYPE_LABELS[d.doc_type], width: 16 },
        { header: 'Customer', value: (d) => d.customer?.name ?? '—', width: 28 },
        { header: 'Date', value: (d) => new Date(d.doc_date), width: 16 },
        { header: 'Total (AED)', value: (d) => Number(d.total.toFixed(2)), width: 16 },
        { header: 'Margin %', value: (d) => Number(d.marginPct.toFixed(1)), width: 12 },
        { header: 'Status', value: (d) => d.status, width: 14, highlight: (d) => STATUS_COLORS[d.status] ?? null },
      ],
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Documents</h1>
          <p className="mt-1 text-sm text-gray">Quotations, invoices, tax invoices and delivery notes.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportRows(filtered, 'all')}
            className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            <Download size={14} /> Export Excel
          </button>
          <Link to="/dashboard/documents/new">
            <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              <Plus size={16} /> New Document
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray" />
          <input
            placeholder="Search by number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-xl border border-navy/10 bg-white py-2 ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as DocType | 'all')} className="rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="all">All types</option>
          {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DocStatus | 'all')} className="rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-navy px-5 py-3 text-white">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value as DocStatus)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm outline-none"
          >
            <option value="" disabled>Set status to...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="text-navy">{s}</option>
            ))}
          </select>
          <button
            onClick={() => exportRows(filtered.filter((d) => selected.has(d.id)), 'selected')}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          >
            <Download size={13} /> Export Selected
          </button>
          <button
            onClick={() => setDeleteTarget('bulk')}
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
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} className="h-4 w-4 rounded border-navy/20" />
              </th>
              <th className="px-5 py-3 text-start font-semibold">Number</th>
              <th className="px-5 py-3 text-start font-semibold">Type</th>
              <th className="px-5 py-3 text-start font-semibold">Customer</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
              <th className="px-5 py-3 text-start font-semibold">Total</th>
              <th className="px-5 py-3 text-start font-semibold">Margin</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="w-12 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(d.id)}
                    onChange={() => toggleSelected(d.id)}
                    className="h-4 w-4 rounded border-navy/20"
                  />
                </td>
                <td className="px-5 py-4">
                  <Link to={`/dashboard/documents/${d.id}`} className="font-semibold text-primary" dir="ltr">{d.doc_number}</Link>
                </td>
                <td className="px-5 py-4 text-gray">{DOC_TYPE_LABELS[d.doc_type]}</td>
                <td className="px-5 py-4 text-navy">{d.customer?.name ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-gray">{new Date(d.doc_date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(d.total)}</td>
                <td className="px-5 py-4">
                  {d.total > 0 ? (
                    <span className={`text-xs font-semibold ${d.marginPct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {d.marginPct.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray">—</span>
                  )}
                </td>
                <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setDeleteTarget(d)}
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
        {!isLoading && filtered.length === 0 && <p className="py-10 text-center text-sm text-gray">No documents yet.</p>}
        {isLoading && <p className="py-10 text-center text-sm text-gray">Loading...</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget === 'bulk' ? `Delete ${selected.size} documents?` : 'Delete document?'}
          description={
            deleteTarget === 'bulk'
              ? 'This permanently removes the selected documents and their line items. This cannot be undone.'
              : `"${deleteTarget.doc_number}" and its line items will be permanently deleted. This cannot be undone.`
          }
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
