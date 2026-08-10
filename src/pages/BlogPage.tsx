import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Seo } from '@/components/ui/Seo'
import { supabase } from '@/services/supabase'
import type { BlogPost } from '@/admin/types'

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export function BlogPage() {
  const { t } = useTranslation()
  const { data: posts, isLoading } = useQuery({ queryKey: ['public-blog-posts'], queryFn: fetchPublishedPosts })

  return (
    <>
      <Seo
        title="Blog"
        description="Insights on warehouse design, steel fabrication, racking systems and storage best practices from Al Surur's engineering team in the UAE."
        path="/blog"
      />
      <PageHero eyebrow={t('blogPage.eyebrow')} title={t('blogPage.title')} breadcrumbs={[{ label: t('nav.blog') }]} />
      <section className="container-px mx-auto max-w-4xl py-20">
        <div className="space-y-6">
          {posts?.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-navy/5 transition-shadow hover:shadow-lg sm:flex-row sm:items-center"
            >
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="h-40 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-36" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-navy group-hover:text-primary">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray">{post.excerpt}</p>
              </div>
              <ArrowUpRight size={18} className="hidden shrink-0 text-gray group-hover:text-primary sm:block rtl:-scale-x-100" />
            </Link>
          ))}

          {!isLoading && posts?.length === 0 && (
            <p className="py-10 text-center text-sm text-gray">{t('blogPage.comingSoon')}</p>
          )}
        </div>
      </section>
    </>
  )
}
