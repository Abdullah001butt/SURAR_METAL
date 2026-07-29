import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/ui/PageHero'
import { Seo } from '@/components/ui/Seo'

const posts = ['post1', 'post2', 'post3']

export function BlogPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title="Blog"
        description="Insights on warehouse design, racking systems and storage best practices from Al Surur's engineering team."
        path="/blog"
      />
      <PageHero eyebrow={t('blogPage.eyebrow')} title={t('blogPage.title')} breadcrumbs={[{ label: t('nav.blog') }]} />
      <section className="container-px mx-auto max-w-4xl py-20">
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post} className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t(`blogData.${post}.date`)}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-navy">{t(`blogData.${post}.title`)}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
