import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import type { SupplierBill, SupplierBillStatus } from '@/admin/types'

const STATUSES: SupplierBillStatus[] = ['unpaid', 'paid', 'overdue']

interface SupplierBillModalProps {
  bill?: SupplierBill | null
  onClose: () => void
  onSaved: () => void
}

export function SupplierBillModal({ bill, onClose, onSaved }: SupplierBillModalProps) {
  const isEdit = !!bill
  const [form, setForm] = useState({
    supplier_name: bill?.supplier_name ?? '',
    bill_number: bill?.bill_number ?? '',
    amount: bill?.amount ?? 0,
    vat_amount: bill?.vat_amount ?? 0,
    bill_date: bill?.bill_date ?? new Date().toISOString().slice(0, 10),
    due_date: bill?.due_date ?? '',
    status: bill?.status ?? 'unpaid',
    paid_date: bill?.paid_date ?? '',
    notes: bill?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      due_date: form.due_date || null,
      paid_date: form.status === 'paid' ? (form.paid_date || new Date().toISOString().slice(0, 10)) : null,
    }
    const query = isEdit
      ? supabase.from('supplier_bills').update(payload).eq('id', bill!.id)
      : supabase.from('supplier_bills').insert(payload)
    const { error } = await query
    setSaving(false)
    if (!error) onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Supplier Bill' : 'New Supplier Bill'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input autoFocus required placeholder="Supplier name" value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="Bill number" value={form.bill_number} onChange={(e) => setForm({ ...form, bill_number: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray">Amount (AED)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray">VAT (AED)</label>
              <input type="number" value={form.vat_amount} onChange={(e) => setForm({ ...form, vat_amount: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray">Bill Date</label>
              <input type="date" value={form.bill_date} onChange={(e) => setForm({ ...form, bill_date: e.target.value })} className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SupplierBillStatus })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary capitalize">
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Bill'}</Button>
        </form>
      </div>
    </div>
  )
}
