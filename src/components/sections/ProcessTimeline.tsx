import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { BoltCorners } from '@/components/ui/BoltCorners'
import { processSteps } from '@/data/process'

function StepRow({ step, index }: { step: (typeof processSteps)[number]; index: number }) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
      className="relative flex gap-6 pb-14 last:pb-0"
    >
      {/* Marker sits on the connecting line, z-indexed above it */}
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white font-accent text-lg font-bold text-primary ring-2 ring-primary/20">
          {step.step}
        </span>
      </div>

      <div className="relative flex-1 rounded-2xl bg-bg p-6 ring-1 ring-navy/5 sm:p-7">
        <BoltCorners />
        <h3 className="font-display text-lg font-semibold text-navy sm:text-xl">{t(`processData.${step.id}.title`)}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray">{t(`processData.${step.id}.description`)}</p>
      </div>
    </motion.div>
  )
}

export function ProcessTimeline() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 0.75', 'end 0.4'] })
  const lineProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  const lineHeight = useTransform(lineProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-px mx-auto max-w-3xl">
        <SectionTitle eyebrow={t('process.eyebrow')} title={t('process.title')} align="center" size="sm" />

        <div ref={containerRef} className="relative mt-16">
          {/* Static track */}
          <div className="absolute start-7 top-0 h-full w-0.5 -translate-x-1/2 bg-navy/10 rtl:translate-x-1/2" />
          {/* Animated fill that "draws" itself as you scroll through the section */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute start-7 top-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-primary/40 rtl:translate-x-1/2"
          />

          {processSteps.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} />
          ))}

          {/* Final checkmark once the line reaches the bottom */}
          <motion.div
            style={{ opacity: useTransform(lineProgress, [0.92, 1], [0, 1]) }}
            className="relative z-10 -mt-4 flex items-center gap-6"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-white">
              <Check size={22} />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
