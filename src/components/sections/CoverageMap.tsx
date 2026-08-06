import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, Check } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'

// Ordered roughly west-to-east along the UAE coastline — this is a schematic
// coverage strip, not a literal cartographic map (no claim to precise
// geographic shapes/borders, just real relative order of the 7 Emirates).
const EMIRATES = [
  { id: 'abu-dhabi', hq: false },
  { id: 'dubai', hq: false },
  { id: 'sharjah', hq: false },
  { id: 'ajman', hq: true },
  { id: 'umm-al-quwain', hq: false },
  { id: 'ras-al-khaimah', hq: false },
  { id: 'fujairah', hq: false },
] as const

export function CoverageMap() {
  const { t } = useTranslation()
  const [active, setActive] = useState<string | null>(null)

  return (
    <section className="bg-navy relative overflow-hidden py-20 lg:py-24">
      <div className="dot-grid absolute inset-0 opacity-30" />
      <div className="container-px relative mx-auto max-w-6xl">
        <SectionTitle eyebrow={t('coverage.eyebrow')} title={t('coverage.title')} align="center" light size="sm" />
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/60">{t('coverage.description')}</p>

        <div className="relative mt-16">
          {/* Decorative connecting route line */}
          <div className="absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-7 md:gap-x-2">
            {EMIRATES.map((emirate, i) => (
              <motion.button
                key={emirate.id}
                type="button"
                onMouseEnter={() => setActive(emirate.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === emirate.id ? null : emirate.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative flex flex-col items-center gap-3 text-center"
              >
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/5 text-primary ring-1 ring-white/10 transition-colors group-hover:bg-primary/20 group-hover:ring-primary/40">
                  <MapPin size={20} />
                  {emirate.hq && (
                    <span className="absolute -end-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[8px] font-bold text-white">
                      HQ
                    </span>
                  )}
                </span>
                <span className="text-xs font-semibold text-white sm:text-sm">{t(`coverageData.${emirate.id}`)}</span>

                <motion.div
                  initial={false}
                  animate={{ opacity: active === emirate.id ? 1 : 0, y: active === emirate.id ? 0 : 6 }}
                  className="pointer-events-none absolute top-full z-10 mt-2 w-max max-w-[160px] rounded-xl bg-white px-3 py-2 text-[11px] font-medium text-navy shadow-xl"
                >
                  <span className="flex items-center gap-1.5">
                    <Check size={12} className="text-primary" />
                    {t('coverage.served')}
                  </span>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
