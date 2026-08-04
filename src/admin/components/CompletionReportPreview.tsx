import { useRef, useState } from 'react'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { calcReportTotal } from '@/admin/utils/completionReportCalc'
import { amountToWordsAED } from '@/admin/utils/numberToWords'
import { formatAED } from '@/admin/utils/documentCalc'
import { exportElementToPdf } from '@/admin/utils/pdfExport'
import type { CompletionReport } from '@/admin/types'
import logo from '@/assets/logo.png'

interface CompletionReportPreviewProps {
  report: CompletionReport
  onClose: () => void
}

export function CompletionReportPreview({ report, onClose }: CompletionReportPreviewProps) {
  const items = report.items ?? []
  const total = calcReportTotal(items)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const filename = `Work-Completion-Report-${report.client_name || 'Al-Surur'}`

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
        <div className="flex flex-wrap items-center justify-end gap-3">
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
        <div className="flex items-center justify-between border-b-4 border-[#dc2626] pb-4">
          <p className="max-w-[45%] font-display text-base font-bold leading-tight text-[#dc2626]">
            AL SURUR GENERAL STORE EQUIPMENT TRADING LLC
          </p>
          <img src={logo} alt="Al Surur" className="h-14 w-auto" crossOrigin="anonymous" />
          <p dir="rtl" className="max-w-[45%] text-end text-sm font-bold leading-tight text-[#dc2626]">
            شركة السرور للتجارة العامة لمعدات المتاجر ذ.م.م
          </p>
        </div>

        <h1 className="mt-6 text-center text-xl font-bold tracking-widest">WORK COMPLETION REPORT</h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed">
          <div>
            <p className="font-semibold">To:</p>
            <p>{report.client_name}</p>
            {report.client_location && <p>{report.client_location}</p>}
          </div>

          <div>
            <p className="font-semibold">From:</p>
            <p>{report.staff_name}</p>
            {report.staff_email && <p>{report.staff_email}</p>}
          </div>

          <p><span className="font-semibold">Date:</span> {new Date(report.report_date).toLocaleDateString('en-GB')}</p>

          <p>
            <span className="font-semibold">Subject: </span>
            <span className="font-semibold underline">{report.subject}</span>
          </p>

          <p>Dear Sir,</p>

          <p>{report.intro_text}</p>

          <div>
            <p className="font-semibold underline">Details of Completed Work:</p>
            <p className="mt-1">{report.work_details}</p>
          </div>

          <div>
            <p className="font-semibold underline">Invoice Summary (Completed &amp; Delivered)</p>
            <table className="mt-2 w-full border-collapse border border-[#000000] text-xs">
              <thead>
                <tr className="bg-[#f3f4f6]">
                  <th className="border border-[#000000] p-2">LPO No.</th>
                  <th className="border border-[#000000] p-2">Invoice No.</th>
                  <th className="border border-[#000000] p-2">Date</th>
                  <th className="border border-[#000000] p-2">Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-[#000000] p-2 text-center">{item.lpo_no}</td>
                    <td className="border border-[#000000] p-2 text-center">{item.invoice_no}</td>
                    <td className="border border-[#000000] p-2 text-center">{item.item_date ? new Date(item.item_date).toLocaleDateString('en-GB') : ''}</td>
                    <td className="border border-[#000000] p-2 text-end">{formatAED(item.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-[#000000] p-2 font-semibold" colSpan={3}>TOTAL</td>
                  <td className="border border-[#000000] p-2 text-end font-semibold">{formatAED(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="italic">Amount in words: {amountToWordsAED(total)}</p>

          <div>
            <p className="font-semibold underline">Confirmation:</p>
            <p className="mt-1">{report.confirmation_text}</p>
            <p className="mt-2">Thank you for your cooperation.</p>
          </div>

          <div className="pt-6">
            <p>Sincerely,</p>
            <p className="mt-4 font-semibold">{report.staff_name}</p>
          </div>
        </div>

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
