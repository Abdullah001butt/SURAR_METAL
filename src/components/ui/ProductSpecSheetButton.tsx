import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, Loader2, AlertCircle } from 'lucide-react'
import type { ProductCategory } from '@/types'
import logo from '@/assets/logo.png'

interface ProductSpecSheetButtonProps {
  product: ProductCategory
  title: string
  description: string
  features: string[]
  servingLine: string
}

function waitForImages(container: HTMLElement): Promise<void[]> {
  const images = Array.from(container.querySelectorAll('img'))
  return Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true }) // don't hang the whole export on one broken image
      })
    }),
  )
}

export function ProductSpecSheetButton({ product, title, description, features, servingLine }: ProductSpecSheetButtonProps) {
  const { t } = useTranslation()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setGenerating(true)
    setError(null)
    try {
      await waitForImages(sheetRef.current)
      // Loaded on demand — jsPDF + html2canvas are a heavy chunk (~600KB) that
      // shouldn't be in every visitor's initial bundle just for this button.
      const { exportElementToPdf } = await import('@/admin/utils/pdfExport')
      await exportElementToPdf(sheetRef.current, `Al-Surur-${title}-Spec-Sheet`)
    } catch (err) {
      console.error('Spec sheet export failed:', err)
      setError(t('productDetail.specSheetError'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
          {generating ? t('productDetail.generating') : t('productDetail.downloadSpecSheet')}
        </button>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={13} /> {error}
          </p>
        )}
      </div>

      {/* Hidden template captured to PDF on click. Deliberately NOT opacity-0 —
          html2canvas renders based on actual computed styles, and an ancestor
          with opacity:0 (or visibility:hidden) produces a blank/transparent
          capture. Instead: a zero-size, overflow-hidden, fixed-position wrapper
          keeps it off-screen and non-interactive while the captured element
          itself stays at full opacity so html2canvas renders it correctly. */}
      <div className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden" aria-hidden>
        <div ref={sheetRef} className="w-[210mm] bg-white p-12 text-[#111827]" dir="ltr">
          <div className="flex items-center justify-between border-b-4 border-[#DC2626] pb-5">
            <img src={logo} alt="Al Surur" className="h-14 w-auto" />
            <div className="text-end">
              <p className="text-xl font-bold text-[#DC2626]">Product Spec Sheet</p>
              <p className="text-sm text-[#6b7280]">Al Surur General Store Equipment Trading LLC</p>
            </div>
          </div>

          <div className="mt-8 flex gap-8">
            <img src={product.image} alt={title} className="h-56 w-72 shrink-0 rounded-2xl object-cover" />
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
