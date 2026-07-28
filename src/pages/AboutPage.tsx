import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { Statistics } from '@/components/sections/Statistics'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'

export function AboutPage() {
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  return (
    <>
      <Seo
        title="About Us"
        description="18+ years engineering warehouse storage solutions from Ajman, UAE. 500+ projects delivered for warehouses, factories, logistics companies and government clients."
        path="/about"
      />
      <PageHero
        eyebrow={t('aboutPage.eyebrow')}
        title={t('aboutPage.title')}
        description={t('aboutPage.description')}
      />
      <section className="container-px mx-auto max-w-4xl py-20 text-center">
        <p className="text-lg leading-relaxed text-gray">
          {t('aboutPage.body')}
        </p>
      </section>
      <Statistics />
      <ProcessTimeline />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
