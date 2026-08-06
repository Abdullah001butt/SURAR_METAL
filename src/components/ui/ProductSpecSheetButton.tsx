import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, Loader2 } from 'lucide-react'
import type { ProductCategory } from '@/types'
import logo from '@/assets/logo.png'

interface ProductSpecSheetButtonProps {
  product: ProductCategory
  title: string
  description: string
  features: string[]
  servingLine: string
}

export function ProductSpecSheetButton({ product, title, description, features, servingLine }: ProductSpecSheetButtonProps) {
  const { t } = useTranslation()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setGenerating(true)
    try {
      // Loaded on demand — jsPDF + html2canvas are a heavy chunk (~600KB) that
      // shouldn't be in every visitor's initial bundle just for this button.
      const { exportElementToPdf } = await import('@/admin/utils/pdfExport')
      await exportElementToPdf(sheetRef.current, `Al-Surur-${title}-Spec-Sheet`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {generating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        {generating ? t('productDetail.generating') : t('productDetail.downloadSpecSheet')}
      </button>

      {/* Off-screen template captured to PDF on click — stays mounted (not display:none)
          so its image has actually finished loading by the time html2canvas runs. */}
      <div className="fixed -left-[9999px] top-0" aria-hidden>
        <div ref={sheetRef} className="w-[210mm] bg-white p-12 text-[#111827]" dir="ltr">
          <div className="flex items-center justify-between border-b-4 border-[#DC2626] pb-5">
            <img src={logo} alt="Al Surur" className="h-14 w-auto" />
            <div className="text-end">
              <p className="text-xl font-bold text-[#DC2626]">Product Spec Sheet</p>
              <p className="text-sm text-[#6b7280]">Al Surur General Store Equipment Trading LLC</p>
            </div>
          </div>

          <div className="mt-8 flex gap-8">
            <img src={product.image} alt={title} className="h-56 w-72 shrink-0 rounded-2xl object-cover" crossOrigin="anonymous" />
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">{title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{description}</p>
              {servingLine && <p className="mt-3 text-xs font-semibold text-[#DC2626]">{servingLine}</p>}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#0F172A]">Why Choose This System</h2>
            <ul className="mt-3 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 rounded-2xl bg-[#0F172A] p-6 text-white">
            <p className="text-sm font-bold">Get a Free Site Survey & Quote</p>
            <p className="mt-1 text-xs text-white/70">
              Tel: +971 55 493 9866 &nbsp;|&nbsp; WhatsApp: +971 55 493 9866 &nbsp;|&nbsp; www.alsururmetals.com
            </p>
            <p className="mt-1 text-xs text-white/70">Al Owan, Al Nakhil 1, Ajman, UAE</p>
          </div>

          <p className="mt-6 text-center text-[10px] text-[#9ca3af]">
            18+ Years Experience &middot; 500+ Projects Delivered &middot; UAE-Wide Installation
          </p>
        </div>
      </div>
    </>
  )
}
