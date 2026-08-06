import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { statistics } from '@/data/statistics'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GradientOrbs } from '@/components/ui/GradientOrbs'
import { BlueprintGrid } from '@/components/ui/BlueprintGrid'
import { BoltCorners } from '@/components/ui/BoltCorners'
import { Odometer } from '@/components/ui/Odometer'

function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="relative rounded-3xl bg-white/5 p-8 text-center backdrop-blur-sm ring-1 ring-white/10"
    >
      <BoltCorners light />
      <p className="font-accent text-4xl font-semibold text-primary md:text-5xl">
        <Odometer value={value} suffix={suffix} />
      </p>
      <p className="mt-2 text-sm font-medium text-white/70">{label}</p>

      {/* Decorative capacity-style fill bar — settles once the odometer above
          finishes rolling, purely a stylistic accent (not a claim tied to any
          specific percentage). */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full origin-left rounded-full bg-primary"
        />
      </div>
    </motion.div>
  )
}

export function Statistics() {
  const { t } = useTranslation()

  return (
    <section className="seam-top-navy relative overflow-hidden bg-navy py-28 lg:py-36">
      <BlueprintGrid />
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
