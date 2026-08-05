import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { productCategories } from '@/data/products'
import { Button } from '@/components/ui/Button'
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  const product = productCategories.find((p) => p.id === slug)

  if (!product) return <Navigate to="/products" replace />

  const title = t(`productsData.${product.id}.title`)
  const description = t(`productsData.${product.id}.description`)
  const seoTitle = t(`productsData.${product.id}.seoTitle`, { defaultValue: title })
  const seoDescription = t(`productsData.${product.id}.seoDescription`, { defaultValue: description })
  const servingLine = t(`productsData.${product.id}.servingLine`, { defaultValue: '' })
  const features = t('productDetail.features', { returnObjects: true }) as string[]

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: seoDescription,
    image: product.image,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Al Surur General Store Equipment Trading LLC',
      telephone: '+971554939866',
      address: { '@type': 'PostalAddress', streetAddress: 'Al Owan, Al Nakhil 1', addressLocality: 'Ajman', addressCountry: 'AE' },
    },
    areaServed: [
      { '@type': 'City', name: 'Ajman' },
      { '@type': 'City', name: 'Dubai' },
      { '@type': 'City', name: 'Sharjah' },
      { '@type': 'Country', name: 'United Arab Emirates' },
    ],
  }

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/products/${product.id}`}
        image={product.image}
        jsonLd={serviceJsonLd}
        keywords={`${title}, ${title} Ajman, ${title} UAE, warehouse storage solutions Ajman`}
      />
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
            {servingLine && (
              <p className="mt-6 flex items-center gap-2 text-sm text-gray">
                <MapPin size={16} className="shrink-0 text-primary" />
                {servingLine}
              </p>
            )}
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
