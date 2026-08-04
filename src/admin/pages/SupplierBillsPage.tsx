import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { SupplierBillModal } from '@/admin/components/SupplierBillModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { formatAED } from '@/admin/utils/documentCalc'
import type { SupplierBill, SupplierBillStatus } from '@/admin/types'

const STATUS_COLORS: Record<SupplierBillStatus, string> = {
  unpaid: 'bg-amber-50 text-amber-600',
  paid: 'bg-emerald-50 text-emerald-600',
  overdue: 'bg-red-50 text-red-600',
}

async function fetchBills(): Promise<SupplierBill[]> {
  const { data, error } = await supabase.from('supplier_bills').select('*').order('due_date', { ascending: true, nullsFirst: false })
  if (error) throw error

  const today = new Date().toISOString().slice(0, 10)
  return (data as SupplierBill[]).map((b) =>
    b.status === 'unpaid' && b.due_date && b.due_date < today ? { ...b, status: 'overdue' as const } : b,
  )
}

export function SupplierBillsPage() {
  const queryClient = useQueryClient()
  const { data: bills, isLoading } = useQuery({ queryKey: ['admin-supplier-bills'], queryFn: fetchBills })
  const [modalBill, setModalBill] = useState<SupplierBill | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupplierBill | null>(null)
  const [deleting, setDeleting] = useState(false)

  const unpaidTotal = useMemo(
    () => (bills ?? []).filter((b) => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0),
    [bills],
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('supplier_bills').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-supplier-bills'] })
  }

  const markPaid = async (bill: SupplierBill) => {
    await supabase.from('supplier_bills').update({ status: 'paid', paid_date: new Date().toISOString().slice(0, 10) }).eq('id', bill.id)
    queryClient.invalidateQueries({ queryKey: ['admin-supplier-bills'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Supplier Bills</h1>
          <p className="mt-1 text-sm text-gray">What you owe your suppliers — feeds cash flow forecasting.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Outstanding</p>
            <p className="font-display text-lg font-bold text-primary" dir="ltr">AED {formatAED(unpaidTotal)}</p>
          </div>
          <Button onClick={() => setModalBill('new')} icon={<Plus size={16} />}>New Bill</Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Supplier</th>
              <th className="px-5 py-3 text-start font-semibold">Bill No.</th>
              <th className="px-5 py-3 text-start font-semibold">Due Date</th>
              <th className="px-5 py-3 text-start font-semibold">Amount</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="w-28 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bills?.map((b) => (
              <tr key={b.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4 font-medium text-navy">{b.supplier_name}</td>
                <td className="px-5 py-4 text-gray" dir="ltr">{b.bill_number ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-gray">{b.due_date ? new Date(b.due_date).toLocaleDateString() : '—'}</td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(b.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {b.status !== 'paid' && (
                      <button onClick={() => markPaid(b)} aria-label="Mark paid" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-emerald-50 hover:text-emerald-600 text-xs font-bold">
                        ✓
                      </button>
                    )}
                    <button onClick={() => setModalBill(b)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(b)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && bills?.length === 0 && <p className="py-10 text-center text-sm text-gray">No supplier bills logged yet.</p>}
      </div>

      {modalBill && (
        <SupplierBillModal
          bill={modalBill === 'new' ? null : modalBill}
          onClose={() => setModalBill(null)}
          onSaved={() => {
            setModalBill(null)
            queryClient.invalidateQueries({ queryKey: ['admin-supplier-bills'] })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete bill?"
          description={`The bill from "${deleteTarget.supplier_name}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
