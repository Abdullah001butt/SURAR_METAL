import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import type { Expense, ExpenseCategory, PaymentMethod } from '@/admin/types'

const CATEGORIES: ExpenseCategory[] = ['rent', 'salaries', 'fuel', 'utilities', 'materials', 'transport', 'marketing', 'other']
const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'bank', 'card', 'cheque']

interface ExpenseModalProps {
  expense?: Expense | null
  onClose: () => void
  onSaved: () => void
}

export function ExpenseModal({ expense, onClose, onSaved }: ExpenseModalProps) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    category: expense?.category ?? 'other',
    description: expense?.description ?? '',
    vendor: expense?.vendor ?? '',
    amount: expense?.amount ?? 0,
    vat_amount: expense?.vat_amount ?? 0,
    payment_method: expense?.payment_method ?? 'bank',
    expense_date: expense?.expense_date ?? new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const query = isEdit
      ? supabase.from('expenses').update(form).eq('id', expense!.id)
      : supabase.from('expenses').insert(form)
    const { error } = await query
    setSaving(false)
    if (!error) onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Expense' : 'New Expense'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input autoFocus required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })} className="rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary capitalize">
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })} className="rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary capitalize">
              {PAYMENT_METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
          <input placeholder="Vendor (optional)" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
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
          <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Expense'}</Button>
        </form>
      </div>
    </div>
  )
}
