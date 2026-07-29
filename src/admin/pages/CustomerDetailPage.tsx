import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Trash2, FileText, Phone, MapPin, Hash } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { CustomerModal } from '@/admin/components/CustomerModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { calcTotals, formatAED, DOC_TYPE_LABELS } from '@/admin/utils/documentCalc'
import type { AlSururDocument, Customer } from '@/admin/types'

async function fetchCustomerDetail(id: number) {
  const [customerRes, documentsRes] = await Promise.all([
    supabase.from('customers').select('*').eq('id', id).single(),
    supabase.from('documents').select('*, items:document_items(*)').eq('customer_id', id).order('doc_date', { ascending: false }),
  ])
  if (customerRes.error) throw customerRes.error

  const documents = ((documentsRes.data ?? []) as AlSururDocument[]).map((doc) => {
    const { net } = calcTotals(doc.items ?? [], doc.discount, doc.vat_rate)
    return { ...doc, total: net }
  })

  return { customer: customerRes.data as Customer, documents }
}

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const customerId = Number(id)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer-detail', customerId],
    queryFn: () => fetchCustomerDetail(customerId),
    enabled: !!customerId,
  })
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('customers').delete().eq('id', customerId)
    setDeleting(false)
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    navigate('/dashboard/customers', { replace: true })
  }

  if (isLoading) return <p className="text-sm text-gray">Loading...</p>
  if (!data) return null

  const { customer, documents } = data
  const lifetimeValue = documents.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.total, 0)
  const outstanding = documents.filter((d) => d.status === 'sent' || d.status === 'overdue').reduce((sum, d) => sum + d.total, 0)
  const lastOrderDate = documents[0]?.doc_date

  return (
    <div className="pb-16">
      <Link to="/dashboard/customers" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray">
            {customer.phone && <span className="flex items-center gap-1.5" dir="ltr"><Phone size={14} /> {customer.phone}</span>}
            {customer.address && <span className="flex items-center gap-1.5"><MapPin size={14} /> {customer.address}</span>}
            {customer.trn_no && <span className="flex items-center gap-1.5" dir="ltr"><Hash size={14} /> {customer.trn_no}</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowEdit(true)} icon={<Pencil size={14} />}>Edit</Button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Lifetime Value (Paid)</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy" dir="ltr">AED {formatAED(lifetimeValue)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Outstanding</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary" dir="ltr">AED {formatAED(outstanding)}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Total Documents</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy">{documents.length}</p>
          {lastOrderDate && <p className="mt-1 text-xs text-gray">Last: {new Date(lastOrderDate).toLocaleDateString()}</p>}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <div className="border-b border-navy/5 px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-navy">Documents</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Number</th>
              <th className="px-5 py-3 text-start font-semibold">Type</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
              <th className="px-5 py-3 text-start font-semibold">Total</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link to={`/dashboard/documents/${d.id}`} className="flex items-center gap-2 font-semibold text-primary" dir="ltr">
                    <FileText size={14} /> {d.doc_number}
                  </Link>
                </td>
                <td className="px-5 py-4 text-gray">{DOC_TYPE_LABELS[d.doc_type]}</td>
                <td className="px-5 py-4 text-xs text-gray">{new Date(d.doc_date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(d.total)}</td>
                <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 && <p className="py-10 text-center text-sm text-gray">No documents for this customer yet.</p>}
      </div>

      {showEdit && (
        <CustomerModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', customerId] })
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete customer?"
          description={`"${customer.name}" will be removed. Documents already linked keep their record but lose the customer reference.`}
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
