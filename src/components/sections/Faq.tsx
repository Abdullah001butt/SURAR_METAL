import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { faqItems } from '@/data/testimonials'
import { cn } from '@/utils/cn'

export function Faq() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<string | null>(faqItems[0].id)

  return (
    <section className="bg-bg py-20 lg:py-24">
      <div className="container-px mx-auto max-w-4xl">
        <SectionTitle eyebrow={t('faq.eyebrow')} title={t('faq.title')} align="center" size="sm" />

        <div className="mt-14 space-y-3">
          {faqItems.map((item) => {
            const isOpen = open === item.id
            return (
              <div key={item.id} className="rounded-2xl bg-white ring-1 ring-navy/5">
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="font-display text-base font-semibold text-navy">{t(`faqData.${item.id}.question`)}</span>
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform',
                      isOpen && 'rotate-45',
                    )}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-gray">{t(`faqData.${item.id}.answer`)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
