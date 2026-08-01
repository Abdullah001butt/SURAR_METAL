import { useTranslation } from 'react-i18next'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { industries } from '@/data/industries'

export function Industries() {
  const { t } = useTranslation()

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('industries.eyebrow')}
          title={t('industries.title')}
          description={t('industries.description')}
        />

        <GsapStagger className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" stagger={0.06} y={24}>
          {industries.map((industry) => (
            <div
              key={industry.id}
              id={industry.id}
              className="group flex flex-col items-center gap-4 rounded-2xl bg-bg p-8 text-center ring-1 ring-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-navy"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <industry.icon size={26} />
              </div>
              <p className="font-display text-sm font-semibold text-navy group-hover:text-white">{t(`industriesData.${industry.id}`)}</p>
            </div>
          ))}
        </GsapStagger>
      </div>
    </section>
  )
}
