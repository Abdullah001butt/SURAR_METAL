import { FadeIn } from '@/components/ui/FadeIn'
import { RevealHeading } from '@/components/ui/RevealHeading'
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
          <FadeIn y={0} immediate className="mb-5">
            <Breadcrumb items={breadcrumbs} light />
          </FadeIn>
        )}
        <FadeIn
          as="span"
          immediate
          y={12}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          {eyebrow}
        </FadeIn>
        <RevealHeading as="h1" delay={0.1} className="mt-5 font-display text-4xl font-semibold text-white md:text-5xl">
          {title}
        </RevealHeading>
        {description && (
          <FadeIn as="p" immediate delay={0.2} y={20} className="mx-auto mt-4 max-w-xl text-white/70">
            {description}
          </FadeIn>
        )}
      </div>
    </section>
  )
}
