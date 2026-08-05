import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, Receipt, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { calcTotals, itemCost, formatAED } from '@/admin/utils/documentCalc'
import type { AlSururDocument, Expense, SupplierBill } from '@/admin/types'

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

async function fetchFinanceData(startIso: string, endIso: string) {
  const [paidDocsRes, expensesRes, billsRes, outstandingDocsRes, unpaidBillsRes] = await Promise.all([
    supabase.from('documents').select('*, items:document_items(*)').eq('status', 'paid').gte('doc_date', startIso).lte('doc_date', endIso),
    supabase.from('expenses').select('*').gte('expense_date', startIso).lte('expense_date', endIso),
    supabase.from('supplier_bills').select('*').eq('status', 'paid').gte('bill_date', startIso).lte('bill_date', endIso),
    supabase.from('documents').select('*, items:document_items(*)').in('status', ['sent', 'overdue']),
    supabase.from('supplier_bills').select('*').neq('status', 'paid'),
  ])

  const paidDocs = (paidDocsRes.data ?? []) as AlSururDocument[]
  const expenses = (expensesRes.data ?? []) as Expense[]
  const paidBills = (billsRes.data ?? []) as SupplierBill[]
  const outstandingDocs = (outstandingDocsRes.data ?? []) as AlSururDocument[]
  const unpaidBills = (unpaidBillsRes.data ?? []) as SupplierBill[]

  let revenue = 0
  let cogs = 0
  let outputVat = 0
  for (const doc of paidDocs) {
    const items = doc.items ?? []
    const totals = calcTotals(items, doc.discount, doc.vat_rate, doc.manual_total)
    revenue += totals.net - totals.vatAmount
    outputVat += totals.vatAmount
    cogs += items.reduce((sum, it) => sum + itemCost(it), 0)
  }

  const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const purchases = paidBills.reduce((sum, b) => sum + b.amount, 0)
  const inputVat = expenses.reduce((sum, e) => sum + e.vat_amount, 0) + paidBills.reduce((sum, b) => sum + b.vat_amount, 0)

  const grossProfit = revenue - cogs
  const netProfit = grossProfit - operatingExpenses - purchases
  const netVat = outputVat - inputVat

  const cashIn = outstandingDocs.reduce((sum, doc) => {
    const totals = calcTotals(doc.items ?? [], doc.discount, doc.vat_rate, doc.manual_total)
    return sum + totals.net
  }, 0)

  const today = new Date()
  const buckets = { due30: 0, due60: 0, due90: 0, beyond: 0, noDate: 0 }
  for (const bill of unpaidBills) {
    if (!bill.due_date) { buckets.noDate += bill.amount; continue }
    const days = Math.ceil((new Date(bill.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 30) buckets.due30 += bill.amount
    else if (days <= 60) buckets.due60 += bill.amount
    else if (days <= 90) buckets.due90 += bill.amount
    else buckets.beyond += bill.amount
  }
  const cashOut = Object.values(buckets).reduce((a, b) => a + b, 0)

  return {
    revenue, cogs, grossProfit, operatingExpenses, purchases, netProfit,
    outputVat, inputVat, netVat,
    cashIn, cashOut, buckets,
    expenseCount: expenses.length, billCount: paidBills.length, docCount: paidDocs.length,
  }
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof TrendingUp; label: string; value: string; tone: 'positive' | 'negative' | 'neutral' }) {
  const toneColor = tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-red-500' : 'text-navy'
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray">{label}</span>
        <Icon size={16} className="text-primary" />
      </div>
      <p className={`mt-3 font-display text-2xl font-bold ${toneColor}`} dir="ltr">{value}</p>
    </div>
  )
}

export function FinanceReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [anchor, setAnchor] = useState(new Date())
  const { start, end, label } = useMemo(() => getRange(period, anchor), [period, anchor])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-finance', period, start.toISOString()],
    queryFn: () => fetchFinanceData(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)),
  })

  const shiftPeriod = (dir: 1 | -1) => {
    const next = new Date(anchor)
    if (period === 'month') next.setMonth(next.getMonth() + dir)
    else next.setMonth(next.getMonth() + dir * 3)
    setAnchor(next)
  }

  const maxBucket = data ? Math.max(data.buckets.due30, data.buckets.due60, data.buckets.due90, data.buckets.beyond, data.buckets.noDate, 1) : 1

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Finance Reports</h1>
          <p className="mt-1 text-sm text-gray">Profit &amp; loss, VAT, and cash flow — built from your documents, expenses, and supplier bills.</p>
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

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray">Profit &amp; Loss ({label})</h2>
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Revenue" value={isLoading ? '...' : `AED ${formatAED(data?.revenue ?? 0)}`} tone="neutral" />
        <StatCard icon={ArrowDownCircle} label="Cost of Goods Sold" value={isLoading ? '...' : `AED ${formatAED(data?.cogs ?? 0)}`} tone="negative" />
        <StatCard icon={Receipt} label="Operating Expenses + Purchases" value={isLoading ? '...' : `AED ${formatAED((data?.operatingExpenses ?? 0) + (data?.purchases ?? 0))}`} tone="negative" />
        <StatCard
          icon={data && data.netProfit >= 0 ? TrendingUp : TrendingDown}
          label="Net Profit"
          value={isLoading ? '...' : `AED ${formatAED(data?.netProfit ?? 0)}`}
          tone={data && data.netProfit >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray">VAT Summary ({label})</h2>
      <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={ArrowUpCircle} label="Output VAT (on sales)" value={isLoading ? '...' : `AED ${formatAED(data?.outputVat ?? 0)}`} tone="neutral" />
        <StatCard icon={ArrowDownCircle} label="Input VAT (on purchases)" value={isLoading ? '...' : `AED ${formatAED(data?.inputVat ?? 0)}`} tone="neutral" />
        <StatCard
          icon={Wallet}
          label={data && data.netVat >= 0 ? 'Net VAT Payable' : 'Net VAT Reclaimable'}
          value={isLoading ? '...' : `AED ${formatAED(Math.abs(data?.netVat ?? 0))}`}
          tone={data && data.netVat >= 0 ? 'negative' : 'positive'}
        />
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray">Cash Flow Forecast</h2>
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpCircle size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-navy">Expected Cash In</span>
            </div>
            <span className="font-display text-lg font-bold text-emerald-600" dir="ltr">AED {formatAED(data?.cashIn ?? 0)}</span>
          </div>
          <p className="mt-2 text-xs text-gray">Total from all sent/overdue customer invoices not yet paid.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-navy">Expected Cash Out</span>
            </div>
            <span className="font-display text-lg font-bold text-red-500" dir="ltr">AED {formatAED(data?.cashOut ?? 0)}</span>
          </div>
          <p className="mt-2 text-xs text-gray">Total from all unpaid supplier bills.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-navy/5">
        <h3 className="font-display text-sm font-semibold text-navy">Supplier Bills Due — by Time Range</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Due within 30 days', value: data?.buckets.due30 ?? 0 },
            { label: 'Due in 31–60 days', value: data?.buckets.due60 ?? 0 },
            { label: 'Due in 61–90 days', value: data?.buckets.due90 ?? 0 },
            { label: 'Due beyond 90 days', value: data?.buckets.beyond ?? 0 },
            { label: 'No due date set', value: data?.buckets.noDate ?? 0 },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-navy">{row.label}</span>
                <span className="font-semibold text-navy" dir="ltr">AED {formatAED(row.value)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(row.value / maxBucket) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray">
        Based on {data?.docCount ?? 0} paid document{data?.docCount === 1 ? '' : 's'}, {data?.expenseCount ?? 0} expense{data?.expenseCount === 1 ? '' : 's'}, and {data?.billCount ?? 0} paid supplier bill{data?.billCount === 1 ? '' : 's'} in this period.
      </p>
    </div>
  )
}
