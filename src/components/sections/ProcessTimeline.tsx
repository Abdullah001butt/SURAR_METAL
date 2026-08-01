import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { processSteps } from '@/data/process'
import { gsap } from '@/lib/gsap'

export function ProcessTimeline() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineFillRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const fill = lineFillRef.current
    if (!section || !fill) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'bottom 70%',
            scrub: 0.6,
          },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('process.eyebrow')}
          title={t('process.title')}
          align="center"
        />

        <div ref={sectionRef} className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-navy/10 lg:block" />
          <div
            ref={lineFillRef}
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 origin-top bg-primary lg:block"
          />

          <GsapStagger className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-20" stagger={0.08}>
            {processSteps.map((step) => (
              <div
                key={step.id}
                className="relative rounded-3xl bg-bg p-8 ring-1 ring-navy/5"
              >
                <span className="font-display text-5xl font-bold text-primary/15">{step.step}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-navy">{t(`processData.${step.id}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">{t(`processData.${step.id}.description`)}</p>
              </div>
            ))}
          </GsapStagger>
        </div>
      </div>
    </section>
  )
}
