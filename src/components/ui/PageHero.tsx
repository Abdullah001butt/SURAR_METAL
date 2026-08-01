import { motion } from 'framer-motion'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'

interface PageHeroProps {
  eyebrow: string
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}

export function PageHero({ eyebrow, title, description, breadcrumbs }: PageHeroProps) {
  return (
    <section className="bg-navy pb-20 pt-40">
      <div className="container-px mx-auto max-w-4xl text-center">
        {breadcrumbs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <Breadcrumb items={breadcrumbs} light />
          </motion.div>
        )}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 font-display text-4xl font-semibold text-white md:text-5xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-white/70"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}
