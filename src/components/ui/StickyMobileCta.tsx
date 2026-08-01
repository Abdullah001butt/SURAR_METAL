import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Phone, FileText } from 'lucide-react'
import { gsap } from '@/lib/gsap'

interface StickyMobileCtaProps {
  onRequestQuote: () => void
}

export function StickyMobileCta({ onRequestQuote }: StickyMobileCtaProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(ref.current, { y: 80 }, { y: 0, duration: 0.6, delay: 0.8, ease: 'back.out(1.4)' })
  }, [])

  return (
    <div
      ref={ref}
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
    </div>
  )
}
