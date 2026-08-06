import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/** Architectural-drawing-style corner brackets + a dimension line overlaid on
 *  a product image — deliberately carries no fabricated numbers (no "2.5m"
 *  or similar implying a specific spec for a generic stock photo), just the
 *  visual language of a technical drawing plus an honest label. */
export function DimensionOverlay() {
  const { t } = useTranslation()
  const bracket = 'absolute h-5 w-5 border-primary/70'

  return (
    <div className="pointer-events-none absolute inset-3 sm:inset-4" aria-hidden>
      <span className={`${bracket} left-0 top-0 border-t-2 border-l-2 rtl:border-l-0 rtl:border-r-2`} />
      <span className={`${bracket} right-0 top-0 border-t-2 border-r-2 rtl:border-r-0 rtl:border-l-2`} />
      <span className={`${bracket} bottom-0 left-0 border-b-2 border-l-2 rtl:border-l-0 rtl:border-r-2`} />
      <span className={`${bracket} bottom-0 right-0 border-b-2 border-r-2 rtl:border-r-0 rtl:border-l-2`} />

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute inset-x-6 bottom-3 flex origin-left items-center gap-2"
      >
        <span className="h-px flex-1 bg-primary/60" />
        <span className="shrink-0 rounded-full bg-navy/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          {t('productDetail.customEngineered')}
        </span>
        <span className="h-px flex-1 bg-primary/60" />
      </motion.div>
    </div>
  )
}
