import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, Loader2, AlertCircle, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductCategory } from '@/types'
import { Button } from '@/components/ui/Button'
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
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!sheetRef.current) return
    setGenerating(true)
    setError(null)
    try {
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
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
      >
        <FileDown size={18} />
        {t('productDetail.downloadSpecSheet')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-navy/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div className="mx-auto max-w-3xl py-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button onClick={handleDownload} disabled={generating} icon={generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}>
                    {generating ? t('productDetail.generating') : t('productDetail.downloadPdfButton')}
                  </Button>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" onClick={(e) => e.stopPropagation()}>
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              {/* Visible on-screen render, captured to PDF on demand — matches the
                  same proven approach used for the admin Catalog/Reports PDF
                  exports elsewhere in this codebase, rather than trying to
                  capture an invisible/off-screen element (which doesn't work
                  reliably with html2canvas). */}
              <div className="overflow-x-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div ref={sheetRef} className="w-[210mm] bg-[#ffffff] p-12 text-[#111827]" dir="ltr">
                  <div className="flex items-center justify-between border-b-4 border-[#DC2626] pb-5">
                    <img src={logo} alt="Al Surur" className="h-14 w-auto" />
                    <div className="text-end">
                      <p className="text-xl font-bold text-[#DC2626]">{t('productDetail.specSheetTitle')}</p>
                      <p className="text-sm text-[#6b7280]">{t('productDetail.specSheetCompany')}</p>
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
                    <h2 className="text-lg font-bold text-[#0F172A]">{t('productDetail.whyChoose')}</h2>
                    <ul className="mt-3 space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10 rounded-2xl bg-[#0F172A] p-6 text-[#ffffff]">
                    <p className="text-sm font-bold">{t('productDetail.specSheetCtaTitle')}</p>
                    <p className="mt-1 text-xs text-[#cbd5e1]">
                      {t('productDetail.specSheetContactLine')}
                    </p>
                    <p className="mt-1 text-xs text-[#cbd5e1]">{t('productDetail.specSheetAddress')}</p>
                  </div>

                  <p className="mt-6 text-center text-[10px] text-[#9ca3af]">
                    {t('productDetail.specSheetFooterStats')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
