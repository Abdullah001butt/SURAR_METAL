import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TiltCard } from '@/components/ui/TiltCard'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { productCategories } from '@/data/products'

export function ProductCategories() {
  const { t } = useTranslation()

  return (
    <section className="bg-bg py-24 lg:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            eyebrow={t('productCategories.eyebrow')}
            title={t('productCategories.title')}
            description={t('productCategories.description')}
          />
        </div>

        <GsapStagger className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((product) => (
            <div
              key={product.id}
              className="group relative transition-transform duration-300 hover:-translate-y-2"
            >
              <TiltCard maxTilt={6} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/5">
                <Link to={product.href}>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={product.image}
                      alt={t(`productsData.${product.id}.title`)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl font-semibold text-navy">{t(`productsData.${product.id}.title`)}</h3>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white rtl:-scale-x-100">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray">{t(`productsData.${product.id}.description`)}</p>
                  </div>
                </Link>
              </TiltCard>
            </div>
          ))}
        </GsapStagger>
      </div>
    </section>
  )
}
