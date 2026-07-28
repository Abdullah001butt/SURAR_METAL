import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { QuickAddCustomerModal } from '@/admin/components/QuickAddCustomerModal'
import type { Customer } from '@/admin/types'

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

export function CustomersPage() {
  const queryClient = useQueryClient()
  const { data: customers, isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Customers</h1>
          <p className="mt-1 text-sm text-gray">Reusable customer records for quotations and invoices.</p>
        </div>
        <Button onClick={() => setOpen(true)} icon={<Plus size={16} />}>New Customer</Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Name</th>
              <th className="px-5 py-3 text-start font-semibold">Phone</th>
              <th className="px-5 py-3 text-start font-semibold">Address</th>
              <th className="px-5 py-3 text-start font-semibold">TRN</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4 font-semibold text-navy">{c.name}</td>
                <td className="px-5 py-4 text-gray" dir="ltr">{c.phone ?? '—'}</td>
                <td className="px-5 py-4 text-gray">{c.address ?? '—'}</td>
                <td className="px-5 py-4 text-gray" dir="ltr">{c.trn_no ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && customers?.length === 0 && <p className="py-10 text-center text-sm text-gray">No customers yet.</p>}
      </div>

      {open && (
        <QuickAddCustomerModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
          }}
        />
      )}
    </div>
  )
}
