import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { CustomerModal } from '@/admin/components/CustomerModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import type { Customer } from '@/admin/types'

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

export function CustomersPage() {
  const queryClient = useQueryClient()
  const { data: customers, isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
  const [modalCustomer, setModalCustomer] = useState<Customer | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('customers').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Customers</h1>
          <p className="mt-1 text-sm text-gray">Reusable customer records for quotations and invoices.</p>
        </div>
        <Button onClick={() => setModalCustomer('new')} icon={<Plus size={16} />}>New Customer</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Name</th>
              <th className="px-5 py-3 text-start font-semibold">Phone</th>
              <th className="px-5 py-3 text-start font-semibold">Address</th>
              <th className="px-5 py-3 text-start font-semibold">TRN</th>
              <th className="w-24 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link to={`/dashboard/customers/${c.id}`} className="font-semibold text-navy hover:text-primary">{c.name}</Link>
                </td>
                <td className="px-5 py-4 text-gray" dir="ltr">{c.phone ?? '—'}</td>
                <td className="px-5 py-4 text-gray">{c.address ?? '—'}</td>
                <td className="px-5 py-4 text-gray" dir="ltr">{c.trn_no ?? '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setModalCustomer(c)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && customers?.length === 0 && <p className="py-10 text-center text-sm text-gray">No customers yet.</p>}
      </div>

      {modalCustomer && (
        <CustomerModal
          customer={modalCustomer === 'new' ? null : modalCustomer}
          onClose={() => setModalCustomer(null)}
          onSaved={() => {
            setModalCustomer(null)
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete customer?"
          description={`"${deleteTarget.name}" will be removed. Documents already linked to this customer keep their record but lose the customer reference.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
