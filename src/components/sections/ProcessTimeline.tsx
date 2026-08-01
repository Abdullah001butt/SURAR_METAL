import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { processSteps } from '@/data/process'

export function ProcessTimeline() {
  const { t } = useTranslation()

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('process.eyebrow')}
          title={t('process.title')}
          align="center"
        />

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-navy/10 lg:block" />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-20">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="relative rounded-3xl bg-bg p-8 ring-1 ring-navy/5"
              >
                <span className="font-display text-5xl font-bold text-primary/15">{step.step}</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-navy">{t(`processData.${step.id}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">{t(`processData.${step.id}.description`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
