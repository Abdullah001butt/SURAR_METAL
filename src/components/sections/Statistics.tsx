import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { statistics } from '@/data/statistics'
import { useCountUp } from '@/hooks/useCountUp'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GradientOrbs } from '@/components/ui/GradientOrbs'

function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { ref, value: animated } = useCountUp(value)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="rounded-3xl bg-white/5 p-8 text-center backdrop-blur-sm ring-1 ring-white/10"
    >
      <p className="font-accent text-4xl font-semibold text-primary md:text-5xl">
        {animated}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-white/70">{label}</p>
    </motion.div>
  )
}

export function Statistics() {
  const { t } = useTranslation()

  return (
    <section className="seam-top-navy relative overflow-hidden bg-navy py-28 lg:py-36">
      <div className="dot-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,90,31,0.14),transparent_50%)]" />
      <GradientOrbs />
      <div className="container-px relative mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('statistics.eyebrow')}
          title={t('statistics.title')}
          align="center"
          light
          size="lg"
        />
        <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {statistics.map((stat, i) => (
            <StatCard
              key={stat.id}
              value={stat.value}
              suffix={stat.suffix}
              label={t(`statisticsData.${stat.id}`)}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
