import { useTranslation } from 'react-i18next'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TiltCard } from '@/components/ui/TiltCard'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { projects } from '@/data/projects'
import { cn } from '@/utils/cn'

interface ProjectMetric {
  value: string
  label: string
}

export function FeaturedProjects() {
  const { t } = useTranslation()

  return (
    <section className="bg-bg py-24 lg:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={t('projects.eyebrow')}
          title={t('projects.title')}
          description={t('projects.description')}
        />

        <GsapStagger className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {projects.map((project) => {
            const metrics = t(`projectsData.${project.id}.metrics`, { returnObjects: true }) as ProjectMetric[]
            const heroMetric = metrics[0]
            const title = t(`projectsData.${project.id}.title`)
            const category = t(`projectsData.${project.id}.category`)
            const location = t(`projectsData.${project.id}.location`)
            const result = t(`projectsData.${project.id}.result`)

            return (
              <div
                key={project.id}
                className={cn('group', project.size === 'large' ? 'sm:row-span-2 h-[560px]' : 'h-[270px]')}
              >
                <TiltCard maxTilt={5} className="h-full w-full overflow-hidden rounded-3xl">
                  <img
                    src={project.image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/25 to-navy/10 transition-opacity group-hover:from-navy/95 group-hover:via-navy/60" />

                  <div className="absolute start-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/20">
                    <TrendingUp size={13} className="text-primary" />
                    <span className="font-display text-sm font-bold text-white">{heroMetric.value}</span>
                    <span className="text-[11px] text-white/70">{heroMetric.label}</span>
                  </div>

                  <span className="absolute end-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 rtl:-scale-x-100">
                    <ArrowUpRight size={16} />
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">{category}</span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs text-white/60">{location}</p>

                    <div className="grid max-h-0 grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-40 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                      <div className="overflow-hidden">
                        <p className="text-xs leading-relaxed text-white/70">{result}</p>
                        {metrics.length > 1 && (
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3">
                            {metrics.slice(1).map((m) => (
                              <div key={m.label}>
                                <span className="font-display text-sm font-bold text-white">{m.value}</span>
                                <span className="ms-1 text-[11px] text-white/50">{m.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            )
          })}
        </GsapStagger>
      </div>
    </section>
  )
}
