import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'

export function ProjectsPage() {
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  return (
    <>
      <Seo
        title="Featured Projects"
        description="500+ warehouse racking, shelving and mezzanine floor installations delivered across the UAE, including government and enterprise contracts."
        path="/projects"
      />
      <PageHero
        eyebrow={t('projectsPage.eyebrow')}
        title={t('projectsPage.title')}
        description={t('projectsPage.description')}
        breadcrumbs={[{ label: t('nav.projects') }]}
      />
      <FeaturedProjects />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
