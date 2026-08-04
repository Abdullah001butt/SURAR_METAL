import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Download } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TiltCard } from '@/components/ui/TiltCard'
import { Button } from '@/components/ui/Button'
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
          <a href="/al-surur-product-catalog.pdf" download className="shrink-0">
            <Button variant="secondary" icon={<Download size={16} />}>
              {t('productCategories.downloadCatalog')}
            </Button>
          </a>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productCategories.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <TiltCard maxTilt={6} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/5">
                <Link to={product.href}>
                  <div className="photo-duotone relative h-56 overflow-hidden">
                    <img
                      src={product.image}
                      alt={t(`productsData.${product.id}.title`)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
