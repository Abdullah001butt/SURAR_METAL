import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import type { PersonalExpense, PersonalExpenseCategory } from '@/admin/types'

const CATEGORIES: PersonalExpenseCategory[] = ['transport', 'food', 'subscriptions', 'family', 'income', 'other']

interface PersonalExpenseModalProps {
  expense?: PersonalExpense | null
  onClose: () => void
  onSaved: () => void
}

export function PersonalExpenseModal({ expense, onClose, onSaved }: PersonalExpenseModalProps) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    category: expense?.category ?? 'other',
    description: expense?.description ?? '',
    amount: expense?.amount ?? 0,
    notes: expense?.notes ?? '',
    expense_date: expense?.expense_date ?? new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    const query = isEdit
      ? supabase.from('personal_expenses').update(payload).eq('id', expense!.id)
      : supabase.from('personal_expenses').insert(payload)
    const { error } = await query
    setSaving(false)
    if (!error) onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            required
            placeholder="Description (e.g. Taxi, Breakfast)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as PersonalExpenseCategory })}
              className="rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary capitalize"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c === 'income' ? 'Income (money received)' : c}</option>
              ))}
            </select>
            <div>
              <label className="text-xs font-semibold text-gray">Amount (AED)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <input
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Entry'}
          </Button>
        </form>
      </div>
    </div>
  )
}
