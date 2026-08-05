import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { ProductCategories } from '@/components/sections/ProductCategories'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'

export function ProductsPage() {
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  return (
    <>
      <Seo
        title="Warehouse Racking & Shelving Products Ajman"
        description="Pallet racking, mezzanine floors, shelving systems, cantilever racks, industrial lockers and warehouse trolleys — engineered and installed in Ajman & across the UAE."
        path="/products"
        keywords="warehouse storage solutions Ajman, pallet racking Ajman, mezzanine floor Ajman, warehouse trolleys Ajman"
      />
      <PageHero
        eyebrow={t('productsPage.eyebrow')}
        title={t('productsPage.title')}
        description={t('productsPage.description')}
        breadcrumbs={[{ label: t('nav.products') }]}
      />
      <ProductCategories />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
