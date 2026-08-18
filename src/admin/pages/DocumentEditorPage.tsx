import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Camera, Copy, History, Lock, Plus, Printer, Save, Sparkles, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/admin/components/StatusBadge'
import { DocumentPreview } from '@/admin/components/DocumentPreview'
import { CustomerModal } from '@/admin/components/CustomerModal'
import { ActivityLog } from '@/admin/components/ActivityLog'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { ImportQuoteFromPhotoModal } from '@/admin/components/ImportQuoteFromPhotoModal'
import type { ExtractedQuote } from '@/admin/utils/extractQuoteFromPhoto'
import { calcTotals, calcMarginTotals, itemMargin, formatAED, DOC_TYPE_LABELS } from '@/admin/utils/documentCalc'
import { logActivity } from '@/admin/utils/activity'
import { fetchFrequentQuoteItems, fetchCustomerPriorQuotes } from '@/admin/utils/smartQuote'
import type { AlSururDocument, Customer, DocType, DocStatus, DocumentItem, PaymentMethodType, Product } from '@/admin/types'

const DOC_TYPES: DocType[] = ['quotation', 'invoice', 'tax_invoice', 'delivery_note', 'payment_receipt']
const QUOTATION_SEQ = 'quotation_number_seq'
const INVOICE_SEQ = 'invoice_number_seq'
const RECEIPT_SEQ = 'receipt_number_seq'

function emptyItem(srNo: number): DocumentItem {
  return { sr_no: srNo, item_code: null, description: '', weight: null, qty: 1, unit: 'pcs', unit_price: 0, cost_price: 0 }
}

async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('name')
  if (error) throw error
  return data
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('description')
  if (error) throw error
  return data
}

async function fetchDocument(id: number): Promise<AlSururDocument> {
  const { data, error } = await supabase.from('documents').select('*, customer:customers(*), items:document_items(*)').eq('id', id).single()
  if (error) throw error
  return data as AlSururDocument
}

async function nextDocNumber(docType: DocType): Promise<string> {
  const seqName = docType === 'quotation' ? QUOTATION_SEQ : docType === 'payment_receipt' ? RECEIPT_SEQ : INVOICE_SEQ
  const prefix = docType === 'payment_receipt' ? 'REC' : 'SUR'
  const { data, error } = await supabase.rpc('nextval_public', { seq_name: seqName })
  if (error) throw error
  return `${prefix}/${data}`
}

export function DocumentEditorPage() {
  const location = useLocation()
  return <DocumentEditorPageInner key={location.pathname + location.search} />
}

function DocumentEditorPageInner() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const convertFromId = searchParams.get('from')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const { data: customers } = useQuery({ queryKey: ['admin-customers'], queryFn: fetchCustomers })
  const { data: products } = useQuery({ queryKey: ['admin-products'], queryFn: fetchProducts })
  const { data: existingDoc } = useQuery({
    queryKey: ['admin-document', id],
    queryFn: () => fetchDocument(Number(id)),
    enabled: !isNew,
  })
  const { data: sourceDoc } = useQuery({
    queryKey: ['admin-document', convertFromId],
    queryFn: () => fetchDocument(Number(convertFromId)),
    enabled: isNew && !!convertFromId,
  })

  const [docType, setDocType] = useState<DocType>('quotation')
  const [docNumber, setDocNumber] = useState('')
  const [status, setStatus] = useState<DocStatus>('draft')
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [docDate, setDocDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentTerms, setPaymentTerms] = useState('50% advance and 50% balance on completion')
  const [salesConsultant, setSalesConsultant] = useState('')
  const [poRef, setPoRef] = useState('')
  const [placeOfSupply, setPlaceOfSupply] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [durationNote, setDurationNote] = useState('')
  const [loadCapacity, setLoadCapacity] = useState('')
  const [validityDays, setValidityDays] = useState(10)
  const [discount, setDiscount] = useState(0)
  const [vatRate, setVatRate] = useState(5)
  const [manualTotal, setManualTotal] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash')
  const [referenceNo, setReferenceNo] = useState('')
  const [bankName, setBankName] = useState('')
  const [items, setItems] = useState<DocumentItem[]>([emptyItem(1)])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loadedId, setLoadedId] = useState<number | null>(null)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [initialStatus, setInitialStatus] = useState<DocStatus | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showImportPhoto, setShowImportPhoto] = useState(false)

  // Hydrate from an existing document (edit mode)
  useEffect(() => {
    if (existingDoc && loadedId !== existingDoc.id) {
      setDocType(existingDoc.doc_type)
      setDocNumber(existingDoc.doc_number)
      setStatus(existingDoc.status)
      setCustomerId(existingDoc.customer_id)
      setDocDate(existingDoc.doc_date)
      setPaymentTerms(existingDoc.payment_terms ?? '')
      setSalesConsultant(existingDoc.sales_consultant ?? '')
      setPoRef(existingDoc.po_ref ?? '')
      setPlaceOfSupply(existingDoc.place_of_supply ?? '')
      setPreparedBy(existingDoc.prepared_by ?? '')
      setApprovedBy(existingDoc.approved_by ?? '')
      setDurationNote(existingDoc.duration_note ?? '')
      setLoadCapacity(existingDoc.load_capacity ?? '')
      setValidityDays(existingDoc.validity_days ?? 10)
      setDiscount(existingDoc.discount)
      setVatRate(existingDoc.vat_rate)
      setManualTotal(existingDoc.manual_total ?? null)
      setPaymentMethod(existingDoc.payment_method ?? 'cash')
      setReferenceNo(existingDoc.reference_no ?? '')
      setBankName(existingDoc.bank_name ?? '')
      setItems(existingDoc.items && existingDoc.items.length > 0 ? existingDoc.items : [emptyItem(1)])
      setLoadedId(existingDoc.id)
      setInitialStatus(existingDoc.status)
    }
  }, [existingDoc, loadedId])

  // Hydrate from a source document (conversion mode)
  useEffect(() => {
    if (sourceDoc && isNew && loadedId !== sourceDoc.id * -1) {
      setCustomerId(sourceDoc.customer_id)
      setPaymentTerms(sourceDoc.payment_terms ?? '')
      setSalesConsultant(sourceDoc.sales_consultant ?? '')
      setPoRef(sourceDoc.po_ref ?? '')
      setPlaceOfSupply(sourceDoc.place_of_supply ?? '')
      setDiscount(sourceDoc.discount)
      setVatRate(sourceDoc.vat_rate)
      setItems(sourceDoc.items && sourceDoc.items.length > 0 ? sourceDoc.items.map((it) => ({ ...it, id: undefined, document_id: undefined })) : [emptyItem(1)])
      setLoadedId(sourceDoc.id * -1)
    }
  }, [sourceDoc, isNew, loadedId])

  // When converting, adopt the target type from the URL immediately
  useEffect(() => {
    const typeParam = searchParams.get('type') as DocType | null
    if (isNew && convertFromId && typeParam && DOC_TYPES.includes(typeParam)) {
      setDocType(typeParam)
    }
  }, [isNew, convertFromId, searchParams])

  // Generate a fresh number for any brand-new document (including conversions)
  useEffect(() => {
    if (isNew && !docNumber) {
      nextDocNumber(docType).then(setDocNumber).catch(() => setDocNumber(''))
    }
  }, [isNew, docType, docNumber])

  const totals = useMemo(() => calcTotals(items, discount, vatRate, manualTotal), [items, discount, vatRate, manualTotal])
  const margin = useMemo(() => calcMarginTotals(items), [items])
  const selectedCustomer = customers?.find((c) => c.id === customerId) ?? null

  const updateItem = (index: number, patch: Partial<DocumentItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  const addItem = () => setItems((prev) => [...prev, emptyItem(prev.length + 1)])
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, sr_no: i + 1 })))

  const applyProduct = (index: number, productId: string) => {
    const product = products?.find((p) => p.id === Number(productId))
    if (!product) return
    updateItem(index, { item_code: product.item_code, description: product.description, unit: product.unit, unit_price: product.default_unit_price })
  }

  const showSmartAssistant = isNew && docType === 'quotation'
  const { data: frequentItems } = useQuery({
    queryKey: ['smart-quote-frequent-items'],
    queryFn: () => fetchFrequentQuoteItems(),
    enabled: showSmartAssistant,
  })
  const { data: priorQuotes } = useQuery({
    queryKey: ['smart-quote-prior', customerId],
    queryFn: () => fetchCustomerPriorQuotes(customerId!),
    enabled: showSmartAssistant && !!customerId,
  })

  const addSuggestedItem = (freq: { description: string; item_code: string | null; unit: string; avg_price: number }) => {
    setItems((prev) => {
      const base = prev.filter((it) => it.description.trim())
      return [...base, { sr_no: base.length + 1, item_code: freq.item_code, description: freq.description, weight: null, qty: 1, unit: freq.unit, unit_price: freq.avg_price, cost_price: 0 }]
    })
  }

  const copyFromPriorQuote = (quote: { items: DocumentItem[] }) => {
    setItems(quote.items.map((it, i) => ({ ...it, id: undefined, document_id: undefined, sr_no: i + 1 })))
  }

  const applyExtractedQuote = (extracted: ExtractedQuote) => {
    const extractedItems: DocumentItem[] = extracted.items
      .filter((it) => it.description?.trim())
      .map((it, i) => ({
        sr_no: i + 1,
        item_code: null,
        description: it.spec ? `${it.description} (${it.spec})` : it.description,
        weight: null,
        qty: it.qty ?? 1,
        unit: it.unit ?? 'pcs',
        unit_price: it.unit_price ?? 0,
        cost_price: 0,
      }))
    if (extractedItems.length > 0) setItems(extractedItems)
    setShowImportPhoto(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        doc_number: docNumber,
        doc_type: docType,
        status,
        customer_id: customerId,
        doc_date: docDate,
        payment_terms: paymentTerms,
        sales_consultant: salesConsultant || null,
        po_ref: poRef || null,
        place_of_supply: placeOfSupply || null,
        prepared_by: preparedBy || null,
        approved_by: approvedBy || null,
        duration_note: durationNote || null,
        load_capacity: loadCapacity || null,
        validity_days: validityDays,
        discount: docType === 'payment_receipt' ? 0 : discount,
        vat_rate: docType === 'payment_receipt' ? 0 : vatRate,
        manual_total: manualTotal,
        payment_method: docType === 'payment_receipt' ? paymentMethod : null,
        reference_no: docType === 'payment_receipt' ? referenceNo || null : null,
        bank_name: docType === 'payment_receipt' ? bankName || null : null,
        converted_from_id: convertFromId ? Number(convertFromId) : existingDoc?.converted_from_id ?? null,
      }

      let docId = existingDoc?.id
      const isCreate = !docId
      if (docId) {
        const { error } = await supabase.from('documents').update(payload).eq('id', docId)
        if (error) throw error
        await supabase.from('document_items').delete().eq('document_id', docId)
      } else {
        const { data, error } = await supabase.from('documents').insert(payload).select('id').single()
        if (error) throw error
        docId = data.id
      }

      const itemRows = items
        .filter((it) => it.description.trim())
        .map((it, i) => ({
          document_id: docId,
          sr_no: i + 1,
          item_code: it.item_code,
          description: it.description,
          weight: it.weight,
          qty: it.qty,
          unit: it.unit,
          unit_price: it.unit_price,
          cost_price: it.cost_price ?? 0,
        }))
      if (itemRows.length > 0) {
        const { error } = await supabase.from('document_items').insert(itemRows)
        if (error) throw error
      }

      if (isCreate) {
        const isDuplicate = convertFromId && sourceDoc?.doc_type === docType
        const note = convertFromId ? `${isDuplicate ? 'Duplicated' : 'Converted'} from document #${convertFromId}` : undefined
        await logActivity(docId!, convertFromId ? 'converted' : 'created', note)
      } else if (initialStatus && initialStatus !== status) {
        await logActivity(docId!, 'status_change', `${initialStatus} → ${status}`)
        setInitialStatus(status)
      }

      queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
      queryClient.invalidateQueries({ queryKey: ['admin-document-activity', docId] })
      queryClient.invalidateQueries({ queryKey: ['admin-document', String(docId)] })
      navigate(`/dashboard/documents/${docId}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDocument = async () => {
    if (!existingDoc) return
    setDeleting(true)
    await supabase.from('documents').delete().eq('id', existingDoc.id)
    setDeleting(false)
    setShowDeleteConfirm(false)
    queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
    navigate('/dashboard/documents', { replace: true })
  }

  const previewDoc: AlSururDocument = {
    id: existingDoc?.id ?? 0,
    doc_number: docNumber,
    doc_type: docType,
    status,
    customer_id: customerId,
    doc_date: docDate,
    payment_terms: paymentTerms,
    sales_consultant: salesConsultant,
    po_ref: poRef,
    place_of_supply: placeOfSupply,
    prepared_by: preparedBy,
    approved_by: approvedBy,
    delivery_note: null,
    duration_note: durationNote,
    load_capacity: loadCapacity,
    validity_days: validityDays,
    discount,
    vat_rate: vatRate,
    manual_total: manualTotal,
    payment_method: docType === 'payment_receipt' ? paymentMethod : null,
    reference_no: docType === 'payment_receipt' ? referenceNo || null : null,
    bank_name: docType === 'payment_receipt' ? bankName || null : null,
    converted_from_id: null,
    created_at: '',
    updated_at: '',
    customer: selectedCustomer ?? undefined,
    items,
  }

  if (showPreview) {
    return <DocumentPreview document={previewDoc} onClose={() => setShowPreview(false)} />
  }

  return (
    <div className="pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard/documents" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
          <ArrowLeft size={16} /> Back to Documents
        </Link>
        <div className="flex gap-3">
          {existingDoc && (
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} icon={<Trash2 size={16} />}>Delete</Button>
          )}
          {isNew && (
            <Button variant="ghost" onClick={() => setShowImportPhoto(true)} icon={<Camera size={16} />}>Import from Photo</Button>
          )}
          <Button variant="ghost" onClick={() => setShowPreview(true)} icon={<Printer size={16} />}>Preview / Print</Button>
          <Button onClick={save} disabled={saving} icon={<Save size={16} />}>{saving ? 'Saving...' : 'Save Document'}</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Number</label>
                <input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} dir="ltr" className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Date</label>
                <input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as DocStatus)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  {['draft', 'sent', 'paid', 'overdue'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray">Customer</label>
                  <button type="button" onClick={() => setShowQuickAddCustomer(true)} className="text-xs font-semibold text-primary">+ New Customer</button>
                </div>
                <select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)} className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select customer...</option>
                  {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {showSmartAssistant && priorQuotes && priorQuotes.length > 0 && (
            <div className="rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/10">
              <div className="flex items-center gap-2">
                <History size={15} className="text-primary" />
                <h2 className="text-sm font-semibold text-navy">This customer has {priorQuotes.length} previous quotation{priorQuotes.length > 1 ? 's' : ''}</h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {priorQuotes.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => copyFromPriorQuote(q)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy ring-1 ring-navy/10 hover:bg-primary hover:text-white hover:ring-primary"
                  >
                    Copy items from {q.doc_number} ({new Date(q.doc_date).toLocaleDateString()})
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSmartAssistant && frequentItems && frequentItems.length > 0 && (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-navy/5">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-primary" />
                <h2 className="text-sm font-semibold text-navy">Frequently quoted items</h2>
              </div>
              <p className="mt-1 text-xs text-gray">Learned from your past quotations — click to add at the average price used.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {frequentItems.map((freq) => (
                  <button
                    key={freq.description}
                    type="button"
                    onClick={() => addSuggestedItem(freq)}
                    className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-navy hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus size={11} />
                    {freq.description}
                    <span className="text-gray">· AED {formatAED(freq.avg_price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-navy">Line Items</h2>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-primary"><Plus size={14} /> Add Item</button>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((item, i) => {
                const rowMargin = itemMargin(item)
                return (
                <div key={i} className="rounded-xl bg-bg p-3">
                  <div className="grid grid-cols-12 items-center gap-2">
                    <select
                      onChange={(e) => applyProduct(i, e.target.value)}
                      className="col-span-12 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-xs outline-none focus:border-primary sm:col-span-3"
                      defaultValue=""
                    >
                      <option value="" disabled>From catalog...</option>
                      {products?.map((p) => <option key={p.id} value={p.id}>{p.description}</option>)}
                    </select>
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      className="col-span-12 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-4"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                      className="col-span-3 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-1"
                    />
                    <input
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => updateItem(i, { unit: e.target.value })}
                      className="col-span-3 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-1"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                      className="col-span-4 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary sm:col-span-2"
                    />
                    <span className="col-span-8 text-end text-sm font-semibold text-navy sm:col-span-1" dir="ltr">
                      {formatAED(item.qty * item.unit_price)}
                    </span>
                    <button onClick={() => removeItem(i)} className="col-span-4 flex justify-end text-red-400 hover:text-red-600 sm:col-span-1">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200/60">
                    <Lock size={11} className="text-amber-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Internal cost</span>
                    <input
                      type="number"
                      placeholder="Cost / unit"
                      value={item.cost_price}
                      onChange={(e) => updateItem(i, { cost_price: Number(e.target.value) })}
                      className="w-28 rounded-lg border border-amber-300/60 bg-white px-2 py-1 text-xs outline-none focus:border-primary"
                      dir="ltr"
                    />
                    {item.qty > 0 && item.unit_price > 0 && (
                      <span
                        className={`ms-auto flex items-center gap-1 text-xs font-semibold ${rowMargin.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                        dir="ltr"
                      >
                        {rowMargin.amount >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        AED {formatAED(rowMargin.amount)} ({rowMargin.pct.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">Terms & Notes</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input placeholder="Payment terms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Sales consultant" value={salesConsultant} onChange={(e) => setSalesConsultant(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="PO Ref" value={poRef} onChange={(e) => setPoRef(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Place of supply" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Prepared by" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Approved by" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Duration of job" value={durationNote} onChange={(e) => setDurationNote(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Load capacity" value={loadCapacity} onChange={(e) => setLoadCapacity(e.target.value)} className="rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {docType === 'payment_receipt' && (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
              <h2 className="font-display text-lg font-semibold text-navy">Payment Details</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                    className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary capitalize"
                  >
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                {paymentMethod === 'cheque' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray">Cheque No.</label>
                      <input
                        placeholder="e.g. 001077"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray">Bank name</label>
                      <input
                        placeholder="e.g. Emirates NBD"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}
                {paymentMethod === 'bank_transfer' && (
                  <div>
                    <label className="text-xs font-semibold text-gray">Transaction / Reference No.</label>
                    <input
                      placeholder="Transaction reference"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">{docType === 'payment_receipt' ? 'Amount' : 'Totals'}</h2>
            <div className="mt-4 space-y-2 text-sm">
              {docType === 'payment_receipt' ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray">Amount Received (AED)</span>
                  <input
                    type="number"
                    autoFocus
                    value={manualTotal ?? 0}
                    onChange={(e) => setManualTotal(Number(e.target.value))}
                    className="w-32 rounded-lg border border-primary/40 bg-primary/5 px-2 py-1 text-end text-sm font-semibold outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray">Gross</span>
                    <span className="font-semibold text-navy" dir="ltr">AED {formatAED(totals.gross)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray">Discount</span>
                    <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 rounded-lg border border-navy/10 bg-bg px-2 py-1 text-end text-sm outline-none focus:border-primary" dir="ltr" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray">VAT %</span>
                    <input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} className="w-24 rounded-lg border border-navy/10 bg-bg px-2 py-1 text-end text-sm outline-none focus:border-primary" dir="ltr" />
                  </div>

                  <label className="flex items-center justify-between border-t border-navy/10 pt-2">
                    <span className="text-gray">Set amount manually</span>
                    <input
                      type="checkbox"
                      checked={manualTotal != null}
                      onChange={(e) => setManualTotal(e.target.checked ? totals.gross : null)}
                      className="h-4 w-4 rounded border-navy/20"
                    />
                  </label>
                  {manualTotal != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray">Amount before VAT (AED)</span>
                      <input
                        type="number"
                        autoFocus
                        value={manualTotal}
                        onChange={(e) => setManualTotal(Number(e.target.value))}
                        className="w-32 rounded-lg border border-primary/40 bg-primary/5 px-2 py-1 text-end text-sm font-semibold outline-none focus:border-primary"
                        dir="ltr"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between border-t border-navy/10 pt-2">
                <span className="font-semibold text-navy">
                  {docType === 'payment_receipt' ? 'Amount Received' : 'Net Total'}
                  {manualTotal != null && docType !== 'payment_receipt' && <span className="ms-1 text-[10px] font-normal text-primary">(manual)</span>}
                </span>
                <span className="font-display text-lg font-bold text-primary" dir="ltr">
                  AED {formatAED(docType === 'payment_receipt' ? manualTotal ?? 0 : totals.net)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-navy p-6 ring-1 ring-navy/5">
            <div className="flex items-center gap-2">
              <Lock size={13} className="text-amber-400" />
              <h2 className="font-display text-sm font-semibold text-white">Margin (internal only)</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Total Cost</span>
                <span className="font-semibold text-white" dir="ltr">AED {formatAED(margin.cost)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="font-semibold text-white">Profit</span>
                <span
                  className={`font-display text-lg font-bold ${margin.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  dir="ltr"
                >
                  AED {formatAED(margin.profit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Margin</span>
                <span className={margin.pct >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
                  {margin.pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {existingDoc && (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
              <h2 className="font-display text-lg font-semibold text-navy">Duplicate</h2>
              <p className="mt-1 text-xs text-gray">Create a fresh {DOC_TYPE_LABELS[docType].toLowerCase()} with the same customer and items — a new number, status reset to draft.</p>
              <button
                onClick={() => navigate(`/dashboard/documents/new?from=${existingDoc.id}&type=${docType}`)}
                className="mt-4 flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-xs font-semibold text-navy hover:bg-primary/10 hover:text-primary"
              >
                <Copy size={14} /> Duplicate This Document
              </button>
            </div>
          )}

          {existingDoc && (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
              <h2 className="font-display text-lg font-semibold text-navy">Convert To</h2>
              <p className="mt-1 text-xs text-gray">Create a new document from this one, carrying over customer and items.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DOC_TYPES.filter((t) => t !== docType).map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/dashboard/documents/new?from=${existingDoc.id}&type=${t}`)}
                    className="rounded-full bg-bg px-3 py-1.5 text-xs font-semibold text-navy hover:bg-primary/10 hover:text-primary"
                  >
                    {DOC_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <div className="mt-4"><StatusBadge status={status} /></div>
            </div>
          )}

          {existingDoc && <ActivityLog documentId={existingDoc.id} />}
        </div>
      </div>

      {showQuickAddCustomer && (
        <CustomerModal
          onClose={() => setShowQuickAddCustomer(false)}
          onSaved={(customer) => {
            setCustomerId(customer.id)
            setShowQuickAddCustomer(false)
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
          }}
        />
      )}

      {showImportPhoto && (
        <ImportQuoteFromPhotoModal onClose={() => setShowImportPhoto(false)} onExtracted={applyExtractedQuote} />
      )}

      {showDeleteConfirm && existingDoc && (
        <ConfirmDialog
          title="Delete document?"
          description={`"${existingDoc.doc_number}" and its line items will be permanently deleted. This cannot be undone.`}
          onConfirm={handleDeleteDocument}
          onClose={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
