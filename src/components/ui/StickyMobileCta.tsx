import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Phone, FileText } from 'lucide-react'

interface StickyMobileCtaProps {
  onRequestQuote: () => void
}

export function StickyMobileCta({ onRequestQuote }: StickyMobileCtaProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 26 }}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-navy/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        href="tel:+971554939866"
        className="flex flex-1 items-center justify-center gap-2 border-e border-white/10 py-4 text-sm font-semibold text-white"
      >
        <Phone size={16} />
        {t('stickyMobileCta.callNow')}
      </a>
      <button
        onClick={onRequestQuote}
        className="flex flex-1 items-center justify-center gap-2 bg-primary py-4 text-sm font-semibold text-white"
      >
        <FileText size={16} />
        {t('stickyMobileCta.requestQuote')}
      </button>
    </motion.div>
  )
}
