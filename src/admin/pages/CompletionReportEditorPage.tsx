import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Printer, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { CompletionReportPreview } from '@/admin/components/CompletionReportPreview'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { calcReportTotal } from '@/admin/utils/completionReportCalc'
import { amountToWordsAED } from '@/admin/utils/numberToWords'
import { formatAED } from '@/admin/utils/documentCalc'
import type { CompletionReport, CompletionReportItem, Customer } from '@/admin/types'

function emptyItem(srNo: number): CompletionReportItem {
  return { sr_no: srNo, lpo_no: '', invoice_no: '', item_date: null, amount: 0 }
}

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

async function fetchReport(id: number): Promise<CompletionReport> {
  const { data, error } = await supabase
    .from('completion_reports')
    .select('*, customer:customers(*), items:completion_report_items(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as CompletionReport
}

export function CompletionReportEditorPage() {
  const location = useLocation()
  return <CompletionReportEditorPageInner key={location.pathname} />
}

function CompletionReportEditorPageInner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const { data: customers } = useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
  const { data: existing } = useQuery({
    queryKey: ['admin-completion-report', id],
    queryFn: () => fetchReport(Number(id)),
    enabled: !isNew,
  })

  const [customerId, setCustomerId] = useState<number | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientLocation, setClientLocation] = useState('')
  const [staffName, setStaffName] = useState('MOHD FABEZ')
  const [staffEmail, setStaffEmail] = useState('alsururfabez@gmail.com')
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10))
  const [subject, setSubject] = useState('Work Completion Report.')
  const [introText, setIntroText] = useState(
    'This is to confirm that all assigned works under the below-mentioned invoices have been successfully completed as per the agreed scope, standards, and safety requirements.',
  )
  const [workDetails, setWorkDetails] = useState(
    'All tasks related to supply, installation, and execution have been fully carried out and inspected. The work has been completed to your satisfaction and the site has been handed over in good working condition.',
  )
  const [confirmationText, setConfirmationText] = useState(
    'We kindly request you to review and acknowledge the completion of work and process the pending payment at the earliest convenience.',
  )
  const [items, setItems] = useState<CompletionReportItem[]>([emptyItem(1)])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loadedId, setLoadedId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (existing && loadedId !== existing.id) {
      setCustomerId(existing.customer_id)
      setClientName(existing.client_name)
      setClientLocation(existing.client_location ?? '')
      setStaffName(existing.staff_name)
      setStaffEmail(existing.staff_email ?? '')
      setReportDate(existing.report_date)
      setSubject(existing.subject)
      setIntroText(existing.intro_text)
      setWorkDetails(existing.work_details)
      setConfirmationText(existing.confirmation_text)
      setItems(existing.items && existing.items.length > 0 ? existing.items : [emptyItem(1)])
      setLoadedId(existing.id)
    }
  }, [existing, loadedId])

  const total = useMemo(() => calcReportTotal(items), [items])
  const selectedCustomer = customers?.find((c) => c.id === customerId) ?? null

  const applyCustomer = (value: string) => {
    const cid = value ? Number(value) : null
    setCustomerId(cid)
    const customer = customers?.find((c) => c.id === cid)
    if (customer) {
      setClientName(customer.name)
      setClientLocation([customer.address, customer.state_country].filter(Boolean).join(', '))
    }
  }

  const updateItem = (index: number, patch: Partial<CompletionReportItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const addItem = () => setItems((prev) => [...prev, emptyItem(prev.length + 1)])
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, sr_no: i + 1 })))

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        customer_id: customerId,
        client_name: clientName,
        client_location: clientLocation || null,
        staff_name: staffName,
        staff_email: staffEmail || null,
        report_date: reportDate,
        subject,
        intro_text: introText,
        work_details: workDetails,
        confirmation_text: confirmationText,
      }

      let reportId = existing?.id
      if (reportId) {
        const { error } = await supabase.from('completion_reports').update(payload).eq('id', reportId)
        if (error) throw error
        await supabase.from('completion_report_items').delete().eq('report_id', reportId)
      } else {
        const { data, error } = await supabase.from('completion_reports').insert(payload).select('id').single()
        if (error) throw error
        reportId = data.id
      }

      const itemRows = items
        .filter((it) => it.lpo_no?.trim() || it.invoice_no?.trim() || it.amount)
        .map((it, i) => ({
          report_id: reportId,
          sr_no: i + 1,
          lpo_no: it.lpo_no || null,
          invoice_no: it.invoice_no || null,
          item_date: it.item_date || null,
          amount: it.amount,
        }))
      if (itemRows.length > 0) {
        const { error } = await supabase.from('completion_report_items').insert(itemRows)
        if (error) throw error
      }

      queryClient.invalidateQueries({ queryKey: ['admin-completion-reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin-completion-report', String(reportId)] })
      navigate(`/dashboard/completion-reports/${reportId}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existing) return
    setDeleting(true)
    await supabase.from('completion_reports').delete().eq('id', existing.id)
    setDeleting(false)
    setShowDeleteConfirm(false)
    queryClient.invalidateQueries({ queryKey: ['admin-completion-reports'] })
    navigate('/dashboard/completion-reports', { replace: true })
  }

  const previewReport: CompletionReport = {
    id: existing?.id ?? 0,
    client_name: clientName,
    client_location: clientLocation,
    staff_name: staffName,
    staff_email: staffEmail,
    report_date: reportDate,
    subject,
    intro_text: introText,
    work_details: workDetails,
    confirmation_text: confirmationText,
    customer_id: customerId,
    created_at: '',
    updated_at: '',
    customer: selectedCustomer ?? undefined,
    items,
  }

  if (showPreview) {
    return <CompletionReportPreview report={previewReport} onClose={() => setShowPreview(false)} />
  }

  return (
    <div className="pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard/completion-reports" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
          <ArrowLeft size={16} /> Back to Completion Reports
        </Link>
        <div className="flex gap-3">
          {existing && (
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} icon={<Trash2 size={16} />}>Delete</Button>
          )}
          <Button variant="ghost" onClick={() => setShowPreview(true)} icon={<Printer size={16} />}>Preview / Print</Button>
          <Button onClick={save} disabled={saving} icon={<Save size={16} />}>{saving ? 'Saving...' : 'Save Report'}</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">Client &amp; Staff</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Customer (optional, prefills below)</label>
                <select value={customerId ?? ''} onChange={(e) => applyCustomer(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select customer...</option>
                  {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Client Name</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Client Location</label>
                <input value={clientLocation} onChange={(e) => setClientLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Staff Name</label>
                <input value={staffName} onChange={(e) => setStaffName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Staff Email</label>
                <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Date</label>
                <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">Report Text</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Intro (confirmation statement)</label>
                <textarea value={introText} onChange={(e) => setIntroText(e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Details of Completed Work</label>
                <textarea value={workDetails} onChange={(e) => setWorkDetails(e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Confirmation / Payment Request</label>
                <textarea value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-navy">Invoice Summary</h2>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={14} /> Add Row</button>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-xl bg-bg p-3">
                  <input
                    placeholder="LPO No."
                    value={item.lpo_no ?? ''}
                    onChange={(e) => updateItem(i, { lpo_no: e.target.value })}
                    className="col-span-6 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-3"
                  />
                  <input
                    placeholder="Invoice No."
                    value={item.invoice_no ?? ''}
                    onChange={(e) => updateItem(i, { invoice_no: e.target.value })}
                    className="col-span-6 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-3"
                  />
                  <input
                    type="date"
                    value={item.item_date ?? ''}
                    onChange={(e) => updateItem(i, { item_date: e.target.value })}
                    className="col-span-6 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-3"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => updateItem(i, { amount: Number(e.target.value) })}
                    className="col-span-4 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-2"
                  />
                  <button onClick={() => removeItem(i)} className="col-span-2 flex justify-end text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">Total</h2>
            <p className="mt-2 font-display text-2xl font-bold text-primary" dir="ltr">AED {formatAED(total)}</p>
            <p className="mt-3 text-xs italic text-gray">{amountToWordsAED(total)}</p>
          </div>
        </div>
      </div>

      {showDeleteConfirm && existing && (
        <ConfirmDialog
          title="Delete report?"
          description={`The completion report for "${existing.client_name}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
