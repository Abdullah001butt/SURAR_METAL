import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Plus, X } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { formatAED } from '@/admin/utils/documentCalc'
import { cn } from '@/utils/cn'
import type { Product } from '@/admin/types'

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('description')
  if (error) throw error
  return data
}

export function ProductCatalogPage() {
  const queryClient = useQueryClient()
  const { data: products, isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: fetchProducts })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ item_code: '', description: '', unit: 'pcs', default_unit_price: '', stock_qty: '', reorder_level: '' })
  const [saving, setSaving] = useState(false)

  const resetForm = () => setForm({ item_code: '', description: '', unit: 'pcs', default_unit_price: '', stock_qty: '', reorder_level: '' })

  const lowStock = products?.filter((p) => p.stock_qty <= p.reorder_level && p.reorder_level > 0) ?? []

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('products').insert({
      item_code: form.item_code || null,
      description: form.description,
      unit: form.unit,
      default_unit_price: Number(form.default_unit_price) || 0,
      stock_qty: Number(form.stock_qty) || 0,
      reorder_level: Number(form.reorder_level) || 0,
    })
    setSaving(false)
    setOpen(false)
    resetForm()
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  const updateStock = async (product: Product, stockQty: number) => {
    await supabase.from('products').update({ stock_qty: stockQty }).eq('id', product.id)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Product Catalog</h1>
          <p className="mt-1 text-sm text-gray">Saved rack types and dimensions for fast line-item entry.</p>
        </div>
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />}>New Product</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{lowStock.length} product{lowStock.length > 1 ? 's' : ''} at or below reorder level</p>
            <p className="mt-1 text-xs">{lowStock.map((p) => p.description).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Code</th>
              <th className="px-5 py-3 text-start font-semibold">Description</th>
              <th className="px-5 py-3 text-start font-semibold">Unit</th>
              <th className="px-5 py-3 text-start font-semibold">Default Price</th>
              <th className="px-5 py-3 text-start font-semibold">Stock</th>
              <th className="px-5 py-3 text-start font-semibold">Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const isLow = p.reorder_level > 0 && p.stock_qty <= p.reorder_level
              return (
                <tr key={p.id} className="border-b border-navy/5 last:border-0 hover:bg-bg">
                  <td className="px-5 py-4 text-gray" dir="ltr">{p.item_code ?? '—'}</td>
                  <td className="px-5 py-4 font-semibold text-navy">{p.description}</td>
                  <td className="px-5 py-4 text-gray">{p.unit}</td>
                  <td className="px-5 py-4 text-gray" dir="ltr">AED {formatAED(p.default_unit_price)}</td>
                  <td className="px-5 py-4" dir="ltr">
                    <input
                      type="number"
                      defaultValue={p.stock_qty}
                      onBlur={(e) => updateStock(p, Number(e.target.value))}
                      className={cn(
                        'w-20 rounded-lg border px-2 py-1 text-sm outline-none focus:border-primary',
                        isLow ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-navy/10 bg-bg',
                      )}
                    />
                  </td>
                  <td className="px-5 py-4 text-gray" dir="ltr">{p.reorder_level}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!isLoading && products?.length === 0 && <p className="py-10 text-center text-sm text-gray">No products yet.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-navy">New Product</h2>
              <button onClick={() => setOpen(false)}><X size={18} className="text-gray" /></button>
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
              <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
