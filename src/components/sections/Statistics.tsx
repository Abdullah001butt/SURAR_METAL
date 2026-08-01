import { useTranslation } from 'react-i18next'
import { statistics } from '@/data/statistics'
import { useCountUp } from '@/hooks/useCountUp'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { gsap } from '@/lib/gsap'

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: animated } = useCountUp(value)

  return (
    <div
      ref={ref}
      onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -6, duration: 0.3, ease: 'power2.out' })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.4, ease: 'power2.out' })}
      className="rounded-3xl bg-white/5 p-8 text-center backdrop-blur-sm ring-1 ring-white/10"
    >
      <p className="font-display text-4xl font-bold text-primary md:text-5xl">
        {animated}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-white/70">{label}</p>
    </div>
  )
}

export function Statistics() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,90,31,0.12),transparent_50%)]" />
      <div className="container-px relative mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('statistics.eyebrow')}
          title={t('statistics.title')}
          align="center"
          light
        />
        <GsapStagger className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4" stagger={0.08}>
          {statistics.map((stat) => (
            <StatCard
              key={stat.id}
              value={stat.value}
              suffix={stat.suffix}
              label={t(`statisticsData.${stat.id}`)}
            />
          ))}
        </GsapStagger>
      </div>
    </section>
  )
}
