import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { formatAED } from '@/admin/utils/documentCalc'
import { ProductModal } from '@/admin/components/ProductModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
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
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const lowStock = products?.filter((p) => p.stock_qty <= p.reorder_level && p.reorder_level > 0) ?? []

  const updateStock = async (product: Product, stockQty: number) => {
    await supabase.from('products').update({ stock_qty: stockQty }).eq('id', product.id)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('products').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Product Catalog</h1>
          <p className="mt-1 text-sm text-gray">Saved rack types and dimensions for fast line-item entry.</p>
        </div>
        <Button onClick={() => setModalProduct('new')} icon={<Plus size={16} />}>New Product</Button>
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

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="w-14 px-5 py-3"></th>
              <th className="px-5 py-3 text-start font-semibold">Description</th>
              <th className="px-5 py-3 text-start font-semibold">Category</th>
              <th className="px-5 py-3 text-start font-semibold">Price</th>
              <th className="px-5 py-3 text-start font-semibold">MOQ</th>
              <th className="px-5 py-3 text-start font-semibold">Stock</th>
              <th className="px-5 py-3 text-start font-semibold">Reorder Level</th>
              <th className="w-24 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const isLow = p.reorder_level > 0 && p.stock_qty <= p.reorder_level
              return (
                <tr key={p.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                  <td className="px-5 py-4">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-bg" />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-navy">{p.description}</p>
                        {p.item_code && <p className="text-xs text-gray" dir="ltr">{p.item_code}</p>}
                      </div>
                      {p.pdf_catalog_url && (
                        <a href={p.pdf_catalog_url} target="_blank" rel="noreferrer" aria-label="PDF catalog" className="text-primary hover:text-primary-dark">
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray">{p.category ?? '—'}</td>
                  <td className="px-5 py-4 text-gray" dir="ltr">AED {formatAED(p.default_unit_price)}</td>
                  <td className="px-5 py-4 text-gray" dir="ltr">{p.moq}</td>
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
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => setModalProduct(p)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!isLoading && products?.length === 0 && <p className="py-10 text-center text-sm text-gray">No products yet.</p>}
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct === 'new' ? null : modalProduct}
          onClose={() => setModalProduct(null)}
          onSaved={() => {
            setModalProduct(null)
            queryClient.invalidateQueries({ queryKey: ['admin-products'] })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product?"
          description={`"${deleteTarget.description}" will be removed from the catalog. Documents that already reference it keep their line items.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
