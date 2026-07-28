import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ChevronRight, ShieldCheck, Award, Truck, Factory } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import heroImg from '@/assets/images/warehouse-hero.jpg'

const floatingCards = [
  { icon: Award, key: 'experience' },
  { icon: ShieldCheck, key: 'projects' },
  { icon: Truck, key: 'installation' },
  { icon: Factory, key: 'quality' },
]

interface HeroProps {
  onRequestQuote: () => void
}

export function Hero({ onRequestQuote }: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-20">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />

      <div className="container-px relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            {t('hero.badge')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')} <span className="text-gradient">{t('hero.titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={onRequestQuote}>
              {t('hero.ctaPrimary')}
            </Button>
            <Button variant="outline-light" size="lg" icon={<ChevronRight size={18} className="rtl:rotate-180" />}>
              {t('hero.ctaSecondary')}
            </Button>
          </motion.div>
        </div>

        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ y: -6 }}
                className={`glass rounded-2xl p-6 ${i % 2 === 1 ? 'mt-8' : ''}`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary">
                  <card.icon size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-white">{t(`hero.cards.${card.key}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  )
}
