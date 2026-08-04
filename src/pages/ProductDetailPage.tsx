import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { productCategories } from '@/data/products'
import { Button } from '@/components/ui/Button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  const product = productCategories.find((p) => p.id === slug)

  if (!product) return <Navigate to="/products" replace />

  const title = t(`productsData.${product.id}.title`)
  const description = t(`productsData.${product.id}.description`)
  const features = t('productDetail.features', { returnObjects: true }) as string[]

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    image: product.image,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Al Surur General Store Equipment Trading LLC',
      telephone: '+971554939866',
      address: { '@type': 'PostalAddress', addressLocality: 'Ajman', addressCountry: 'AE' },
    },
    areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
  }

  return (
    <>
      <Seo title={title} description={description} path={`/products/${product.id}`} image={product.image} jsonLd={serviceJsonLd} />
      <PageHero
        eyebrow={t('productDetail.eyebrow')}
        title={title}
        description={description}
        breadcrumbs={[{ label: t('nav.products'), href: '/products' }, { label: title }]}
      />
      <section className="container-px mx-auto max-w-5xl py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <img src={product.image} alt={title} className="aspect-4/3 w-full rounded-3xl object-cover" />
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">{t('productDetail.whyChoose')}</h2>
            <ul className="mt-6 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8" icon={<ArrowRight size={18} />} onClick={open}>
              {t('nav.requestQuote')}
            </Button>
          </div>
        </div>
      </section>
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
