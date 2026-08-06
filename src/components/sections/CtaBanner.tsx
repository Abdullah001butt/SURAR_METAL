import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GradientOrbs } from '@/components/ui/GradientOrbs'
import { Magnetic } from '@/components/ui/Magnetic'

interface CtaBannerProps {
  onRequestQuote: () => void
}

export function CtaBanner({ onRequestQuote }: CtaBannerProps) {
  const { t } = useTranslation()

  return (
    <section className="container-px mx-auto max-w-7xl py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="clip-notch relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-navy-light px-8 py-16 text-center sm:px-16"
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,90,31,0.25),transparent_60%)]" />
        <GradientOrbs />
        <div className="absolute -top-1 end-0 h-14 w-14 rounded-bl-2xl bg-primary" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
            {t('ctaBanner.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            {t('ctaBanner.description')}
          </p>
          <Magnetic className="mt-8 inline-block">
            <Button size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={onRequestQuote}>
              {t('ctaBanner.button')}
            </Button>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  )
}
