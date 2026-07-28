import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { Industries } from '@/components/sections/Industries'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'

export function IndustriesPage() {
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  return (
    <>
      <Seo
        title="Industries We Serve"
        description="Warehouse storage solutions tailored for warehousing, retail, manufacturing, healthcare, food & beverage, automotive and logistics businesses across the UAE."
        path="/industries"
      />
      <PageHero
        eyebrow={t('industriesPage.eyebrow')}
        title={t('industriesPage.title')}
        description={t('industriesPage.description')}
      />
      <Industries />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
