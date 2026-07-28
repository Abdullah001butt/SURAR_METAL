import { useRef, useState } from 'react'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { calcTotals, formatAED, DOC_TYPE_LABELS } from '@/admin/utils/documentCalc'
import { amountToWordsAED } from '@/admin/utils/numberToWords'
import { exportElementToPdf } from '@/admin/utils/pdfExport'
import type { AlSururDocument } from '@/admin/types'
import logo from '@/assets/logo.png'

interface DocumentPreviewProps {
  document: AlSururDocument
  onClose: () => void
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const items = document.items ?? []
  const totals = calcTotals(items, document.discount, document.vat_rate)
  const isTaxInvoice = document.doc_type === 'tax_invoice'
  const isDeliveryNote = document.doc_type === 'delivery_note'
  const hasWeightColumn = isDeliveryNote || document.doc_type === 'invoice'
  const totalWeight = items.reduce((sum, it) => sum + (it.weight ?? 0), 0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const filename = `${document.doc_number || 'document'}-${document.customer?.name || 'Al-Surur'}`

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setDownloading(true)
    try {
      await exportElementToPdf(sheetRef.current, filename)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-navy/5">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-6 py-4">
        <button onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
          <ArrowLeft size={16} /> Back to Editor
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            <Download size={16} /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div ref={sheetRef} className="mx-auto max-w-[210mm] bg-[#ffffff] p-10 text-[#000000] print-sheet" dir="ltr">
        <div className="flex items-start justify-between border-b-4 border-[#dc2626] pb-4">
          <img src={logo} alt="Al Surur" className="h-16 w-auto" />
          <div className="text-end">
            <p className="font-display text-lg font-bold text-[#dc2626]">Al Surur General Store Equipment Trading LLC</p>
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-bold tracking-widest">{DOC_TYPE_LABELS[document.doc_type]}</h1>

        <div className="mt-4 grid grid-cols-2 gap-6 border border-[#000000] text-xs">
          <div className="space-y-1 border-e border-[#000000] p-3">
            <p><span className="font-semibold">{isTaxInvoice || document.doc_type === 'invoice' || isDeliveryNote ? 'Name' : 'Customer Name'}:</span> {document.customer?.name ?? ''}</p>
            <p><span className="font-semibold">Address:</span> {document.customer?.address ?? ''}</p>
            {document.customer?.state_country && <p><span className="font-semibold">State & Country:</span> {document.customer.state_country}</p>}
            <p><span className="font-semibold">Phone:</span> {document.customer?.phone ?? ''}</p>
            {isTaxInvoice && <p><span className="font-semibold">TRN No:</span> {document.customer?.trn_no ?? ''}</p>}
          </div>
          <div className="space-y-1 p-3">
            <p><span className="font-semibold">{DOC_TYPE_LABELS[document.doc_type]} No:</span> {document.doc_number}</p>
            <p><span className="font-semibold">Date:</span> {document.doc_date}</p>
            {document.po_ref && <p><span className="font-semibold">PO Ref:</span> {document.po_ref}</p>}
            {document.place_of_supply && <p><span className="font-semibold">Place of Supply:</span> {document.place_of_supply}</p>}
            {document.payment_terms && <p><span className="font-semibold">Payment Terms:</span> {document.payment_terms}</p>}
            {document.sales_consultant && <p><span className="font-semibold">Sales Consultant:</span> {document.sales_consultant}</p>}
          </div>
        </div>

        {document.doc_type === 'quotation' && (
          <p className="mt-3 text-xs italic">We thank you for the following enquiry. We would like to quote the best price as follows.</p>
        )}

        <table className="mt-4 w-full border-collapse border border-[#000000] text-xs">
          <thead>
            <tr className="bg-[#f3f4f6]">
              <th className="border border-[#000000] p-2">SR.NO.</th>
              {(isDeliveryNote || hasWeightColumn) && <th className="border border-[#000000] p-2">ITEM CODE</th>}
              <th className="border border-[#000000] p-2">DESCRIPTION</th>
              {(isDeliveryNote || hasWeightColumn) && <th className="border border-[#000000] p-2">WEIGHT</th>}
              <th className="border border-[#000000] p-2">QTY</th>
              <th className="border border-[#000000] p-2">UNIT</th>
              <th className="border border-[#000000] p-2">U/PRICE</th>
              <th className="border border-[#000000] p-2">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="border border-[#000000] p-2 text-center">{String(i + 1).padStart(2, '0')}.</td>
                {(isDeliveryNote || hasWeightColumn) && <td className="border border-[#000000] p-2 text-center">{item.item_code}</td>}
                <td className="border border-[#000000] p-2">{item.description}</td>
                {(isDeliveryNote || hasWeightColumn) && <td className="border border-[#000000] p-2 text-center">{item.weight ?? ''}</td>}
                <td className="border border-[#000000] p-2 text-center">{item.qty}</td>
                <td className="border border-[#000000] p-2 text-center">{item.unit}</td>
                <td className="border border-[#000000] p-2 text-end">{formatAED(item.unit_price)}</td>
                <td className="border border-[#000000] p-2 text-end">{formatAED(item.qty * item.unit_price)}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 3 - items.length) }).map((_, i) => (
              <tr key={`blank-${i}`}>
                <td className="border border-[#000000] p-4" colSpan={hasWeightColumn ? 8 : 6} />
              </tr>
            ))}
            {hasWeightColumn && (
              <tr>
                <td className="border border-[#000000] p-2 text-end font-semibold" colSpan={3}>TOTAL WEIGHT</td>
                <td className="border border-[#000000] p-2 text-center font-semibold">{totalWeight || ''}</td>
                <td className="border border-[#000000] p-2" colSpan={4} />
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 grid grid-cols-2 gap-0 border border-[#000000] text-xs">
          <div className="space-y-1 border-e border-[#000000] p-3">
            <p><span className="font-semibold">Amount in Words (AED):</span> {amountToWordsAED(totals.net)}</p>
            {document.payment_terms && <p><span className="font-semibold">Payment Terms:</span> {document.payment_terms}</p>}
            {document.duration_note && <p><span className="font-semibold">Duration of job:</span> {document.duration_note}</p>}
            {document.load_capacity && <p><span className="font-semibold">Load Capacity:</span> {document.load_capacity}</p>}
            {document.doc_type === 'quotation' && <p><span className="font-semibold">Note:</span> Quotation is valid for {document.validity_days} days.</p>}
            {isTaxInvoice && (
              <div className="mt-2">
                <p className="font-semibold">Account Details:</p>
                <p>AL SURUR GENERAL STORE EQUIPMENT TRADING LLC</p>
                <p>IBAN AE0 3086 0000009212330867</p>
                <p>WIOBAEADXXX</p>
              </div>
            )}
            <p className="mt-2">Received by: ..............................</p>
          </div>
          <div className="space-y-1 p-3">
            <div className="flex justify-between"><span>Gross Amt:</span><span>AED {formatAED(totals.gross)}</span></div>
            <div className="flex justify-between"><span>Discount:</span><span>AED {formatAED(totals.discount)}</span></div>
            <div className="flex justify-between"><span>VAT {document.vat_rate}%:</span><span>AED {formatAED(totals.vatAmount)}</span></div>
            <div className="flex justify-between border-t border-[#000000] pt-1 font-semibold"><span>{isTaxInvoice ? 'Invoice Total' : 'Net Amt'}:</span><span>AED {formatAED(totals.net)}</span></div>
            <p className="mt-4 text-end">Thanks, and best regards</p>
            <p className="text-end font-semibold">Al Surur General Store Equipment Trading LLC</p>
          </div>
        </div>

        {document.doc_type === 'quotation' && (
          <div className="mt-4 grid grid-cols-3 gap-0 border border-[#000000] text-xs">
            <div className="border-e border-[#000000] p-3">
              <p className="font-semibold">PREPARED BY</p>
              <p className="mt-4">{document.prepared_by}</p>
            </div>
            <div className="border-e border-[#000000] p-3">
              <p className="font-semibold">APPRV. BY</p>
              <p className="mt-4">{document.approved_by}</p>
            </div>
            <div className="p-3">
              <p className="font-semibold">RECEIVED BY</p>
              <p className="mt-4">CUSTOMER</p>
            </div>
          </div>
        )}

        <div className="mt-8 border-t-4 border-[#dc2626] pt-3 text-center text-xs">
          <p>Tel: 06 553 7662 | Mob: 050 2069 782 | E-mail: alsurur108@gmail.com</p>
          <p>P.O. Box: 5800 | Ajman - U.A.E</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}
