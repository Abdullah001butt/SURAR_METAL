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
        title="Warehouse Racking & Shelving Products"
        description="Pallet racking, shelving systems, mezzanine floors, cantilever racks, industrial lockers and warehouse trolleys — engineered and installed across the UAE."
        path="/products"
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
