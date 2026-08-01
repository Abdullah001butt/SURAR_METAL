import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, DatabaseBackup } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { formatAED } from '@/admin/utils/documentCalc'
import { exportElementToPdf } from '@/admin/utils/pdfExport'
import { exportFullBackup } from '@/admin/utils/fullBackup'
import logo from '@/assets/logo.png'

type Period = 'month' | 'quarter'

function getRange(period: Period, anchor: Date) {
  if (period === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
    return { start, end, label: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
  }
  const quarter = Math.floor(anchor.getMonth() / 3)
  const start = new Date(anchor.getFullYear(), quarter * 3, 1)
  const end = new Date(anchor.getFullYear(), quarter * 3 + 3, 0)
  return { start, end, label: `Q${quarter + 1} ${anchor.getFullYear()}` }
}

async function fetchReportData(startIso: string, endIso: string) {
  const [documentsRes, itemsRes, leadsRes, contactsRes] = await Promise.all([
    supabase.from('documents').select('*, customer:customers(name)').gte('doc_date', startIso).lte('doc_date', endIso),
    supabase.from('document_items').select('document_id, description, qty, unit_price'),
    supabase.from('quote_requests').select('id, created_at').gte('created_at', startIso).lte('created_at', endIso),
    supabase.from('contact_messages').select('id, created_at').gte('created_at', startIso).lte('created_at', endIso),
  ])

  const documents = documentsRes.data ?? []
  const items = itemsRes.data ?? []
  const docIds = new Set(documents.map((d) => d.id))
  const relevantItems = items.filter((it) => docIds.has(it.document_id))

  const totalsByDoc = new Map<number, number>()
  for (const item of relevantItems) {
    totalsByDoc.set(item.document_id, (totalsByDoc.get(item.document_id) ?? 0) + item.qty * item.unit_price)
  }

  const paidDocs = documents.filter((d) => d.status === 'paid')
  const revenue = paidDocs.reduce((sum, d) => sum + (totalsByDoc.get(d.id) ?? 0), 0)
  const outstanding = documents.filter((d) => d.status === 'sent' || d.status === 'overdue').reduce((sum, d) => sum + (totalsByDoc.get(d.id) ?? 0), 0)

  const productTotals = new Map<string, number>()
  for (const item of relevantItems) {
    productTotals.set(item.description, (productTotals.get(item.description) ?? 0) + item.qty)
  }
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  const customerTotals = new Map<string, number>()
  for (const d of documents) {
    const name = (d.customer as { name?: string } | null)?.name
    if (name) customerTotals.set(name, (customerTotals.get(name) ?? 0) + (totalsByDoc.get(d.id) ?? 0))
  }
  const topCustomers = [...customerTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  const newLeads = (leadsRes.data?.length ?? 0) + (contactsRes.data?.length ?? 0)
  const docsByType = {
    quotation: documents.filter((d) => d.doc_type === 'quotation').length,
    invoice: documents.filter((d) => d.doc_type === 'invoice').length,
    tax_invoice: documents.filter((d) => d.doc_type === 'tax_invoice').length,
    delivery_note: documents.filter((d) => d.doc_type === 'delivery_note').length,
  }

  return { revenue, outstanding, topProducts, topCustomers, newLeads, docsByType, totalDocuments: documents.length }
}

export function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [anchor, setAnchor] = useState(new Date())
  const sheetRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  const { start, end, label } = useMemo(() => getRange(period, anchor), [period, anchor])
  const { data } = useQuery({
    queryKey: ['admin-report', period, start.toISOString()],
    queryFn: () => fetchReportData(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)),
  })

  const shiftPeriod = (dir: 1 | -1) => {
    const next = new Date(anchor)
    if (period === 'month') next.setMonth(next.getMonth() + dir)
    else next.setMonth(next.getMonth() + dir * 3)
    setAnchor(next)
  }

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setDownloading(true)
    try {
      await exportElementToPdf(sheetRef.current, `Al-Surur-Report-${label}`)
    } finally {
      setDownloading(false)
    }
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      await exportFullBackup()
    } finally {
      setBackingUp(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Reports</h1>
          <p className="mt-1 text-sm text-gray">Monthly and quarterly business summaries.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleBackup} disabled={backingUp} icon={<DatabaseBackup size={16} />}>
            {backingUp ? 'Preparing...' : 'Backup All Data'}
          </Button>
          <Button onClick={handleDownload} disabled={downloading} icon={<Download size={16} />}>
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-navy/5">
          {(['month', 'quarter'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize ${period === p ? 'bg-primary text-white' : 'text-gray'}`}
            >
              {p}ly
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 ring-1 ring-navy/5">
          <button onClick={() => shiftPeriod(-1)} className="px-2 text-gray hover:text-navy">‹</button>
          <span className="text-sm font-semibold text-navy">{label}</span>
          <button onClick={() => shiftPeriod(1)} className="px-2 text-gray hover:text-navy">›</button>
        </div>
      </div>

      <div ref={sheetRef} className="mx-auto mt-6 max-w-[210mm] bg-[#ffffff] p-10 text-[#000000]" dir="ltr">
        <div className="flex items-center justify-between border-b-4 border-[#dc2626] pb-4">
          <img src={logo} alt="Al Surur" className="h-14 w-auto" />
          <div className="text-end">
            <p className="font-display text-lg font-bold text-[#dc2626]">Business Summary</p>
            <p className="text-sm text-[#4b5563]">{label}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Revenue (Paid)', value: `AED ${formatAED(data?.revenue ?? 0)}` },
            { label: 'Outstanding', value: `AED ${formatAED(data?.outstanding ?? 0)}` },
            { label: 'New Leads', value: data?.newLeads ?? 0 },
            { label: 'Documents Issued', value: data?.totalDocuments ?? 0 },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-[#00000019] p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{c.label}</p>
              <p className="mt-1 font-display text-lg font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Top Products</h2>
            <table className="mt-2 w-full text-xs">
              <tbody>
                {data?.topProducts.map(([name, qty]) => (
                  <tr key={name} className="border-b border-[#00000019]">
                    <td className="py-1.5">{name}</td>
                    <td className="py-1.5 text-end font-semibold">{qty} qty</td>
                  </tr>
                ))}
                {(!data || data.topProducts.length === 0) && <tr><td className="py-3 text-[#9ca3af]">No data for this period.</td></tr>}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest">Top Customers</h2>
            <table className="mt-2 w-full text-xs">
              <tbody>
                {data?.topCustomers.map(([name, total]) => (
                  <tr key={name} className="border-b border-[#00000019]">
                    <td className="py-1.5">{name}</td>
                    <td className="py-1.5 text-end font-semibold">AED {formatAED(total)}</td>
                  </tr>
                ))}
                {(!data || data.topCustomers.length === 0) && <tr><td className="py-3 text-[#9ca3af]">No data for this period.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest">Documents Issued by Type</h2>
          <div className="mt-2 grid grid-cols-4 gap-3 text-center text-xs">
            <div className="rounded-lg border border-[#00000019] p-2"><p className="font-semibold">{data?.docsByType.quotation ?? 0}</p><p className="text-[#6b7280]">Quotations</p></div>
            <div className="rounded-lg border border-[#00000019] p-2"><p className="font-semibold">{data?.docsByType.invoice ?? 0}</p><p className="text-[#6b7280]">Invoices</p></div>
            <div className="rounded-lg border border-[#00000019] p-2"><p className="font-semibold">{data?.docsByType.tax_invoice ?? 0}</p><p className="text-[#6b7280]">Tax Invoices</p></div>
            <div className="rounded-lg border border-[#00000019] p-2"><p className="font-semibold">{data?.docsByType.delivery_note ?? 0}</p><p className="text-[#6b7280]">Delivery Notes</p></div>
          </div>
        </div>

        <div className="mt-10 border-t-4 border-[#dc2626] pt-3 text-center text-xs">
          <p>Al Surur General Store Equipment Trading LLC</p>
          <p>Tel: 06 553 7662 | Mob: 050 2069 782 | E-mail: alsurur108@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
