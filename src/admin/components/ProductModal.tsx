import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/admin/types'

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
  onSaved: (product: Product) => void
}

export function ProductModal({ product, onClose, onSaved }: ProductModalProps) {
  const isEdit = !!product
  const [form, setForm] = useState({
    item_code: product?.item_code ?? '',
    description: product?.description ?? '',
    unit: product?.unit ?? 'pcs',
    default_unit_price: String(product?.default_unit_price ?? ''),
    stock_qty: String(product?.stock_qty ?? ''),
    reorder_level: String(product?.reorder_level ?? ''),
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      item_code: form.item_code || null,
      description: form.description,
      unit: form.unit,
      default_unit_price: Number(form.default_unit_price) || 0,
      stock_qty: Number(form.stock_qty) || 0,
      reorder_level: Number(form.reorder_level) || 0,
    }
    const query = isEdit
      ? supabase.from('products').update(payload).eq('id', product!.id).select('*').single()
      : supabase.from('products').insert(payload).select('*').single()
    const { data, error } = await query
    setSaving(false)
    if (!error && data) onSaved(data as Product)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input placeholder="Item code (optional)" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input required placeholder="Description (e.g. Heavy Duty Frame 1200x4000)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Unit (pcs, m, kg...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input type="number" step="0.01" placeholder="Default price" value={form.default_unit_price} onChange={(e) => setForm({ ...form, default_unit_price: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Stock quantity" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input type="number" placeholder="Reorder level" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Product'}</Button>
        </form>
      </div>
    </div>
  )
}
