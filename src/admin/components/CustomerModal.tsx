import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/admin/types'

interface CustomerModalProps {
  customer?: Customer | null
  onClose: () => void
  onSaved: (customer: Customer) => void
}

export function CustomerModal({ customer, onClose, onSaved }: CustomerModalProps) {
  const isEdit = !!customer
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    state_country: customer?.state_country ?? '',
    trn_no: customer?.trn_no ?? '',
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const query = isEdit
      ? supabase.from('customers').update(form).eq('id', customer!.id).select('*').single()
      : supabase.from('customers').insert(form).select('*').single()
    const { data, error } = await query
    setSaving(false)
    if (!error && data) onSaved(data as Customer)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input autoFocus required placeholder="Customer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="State & Country" value={form.state_country} onChange={(e) => setForm({ ...form, state_country: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="TRN No." value={form.trn_no} onChange={(e) => setForm({ ...form, trn_no: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save & Use Customer'}</Button>
        </form>
      </div>
    </div>
  )
}
