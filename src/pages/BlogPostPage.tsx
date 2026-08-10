import { useParams, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { marked } from 'marked'
import { ArrowRight, Calendar } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Seo } from '@/components/ui/Seo'
import { Button } from '@/components/ui/Button'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { supabase } from '@/services/supabase'
import type { BlogPost } from '@/admin/types'

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  if (error) throw error
  return data
}

export function BlogPostPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { open } = useQuoteModal()
  const { data: post, isLoading } = useQuery({
    queryKey: ['public-blog-post', slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug,
  })

  if (!isLoading && !post) return <Navigate to="/blog" replace />
  if (!post) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Al Surur General Store Equipment Trading LLC' },
    publisher: {
      '@type': 'Organization',
      name: 'Al Surur General Store Equipment Trading LLC',
      logo: { '@type': 'ImageObject', url: 'https://www.alsururmetals.com/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.alsururmetals.com/blog/${post.slug}` },
  }

  return (
    <>
      <Seo
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.cover_image || undefined}
        keywords={post.keywords || undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <PageHero
        eyebrow={t('blogPage.eyebrow')}
        title={post.title}
        breadcrumbs={[{ label: t('nav.blog'), href: '/blog' }, { label: post.title }]}
      />

      {post.published_at && (
        <div className="container-px mx-auto -mt-10 flex max-w-3xl justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray shadow-sm ring-1 ring-navy/5">
            <Calendar size={12} />
            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}

      {post.cover_image && (
        <div className="container-px mx-auto mt-8 max-w-4xl">
          <img src={post.cover_image} alt={post.title} className="aspect-video w-full rounded-3xl object-cover" />
        </div>
      )}

      <article className="container-px mx-auto max-w-3xl py-16">
        <div
          className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-p:text-gray prose-p:leading-relaxed prose-a:text-primary prose-strong:text-navy prose-li:text-gray"
          dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }}
        />

        <div className="mt-14 rounded-3xl bg-navy p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-white">{t('blogPostPage.ctaTitle')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            {t('blogPostPage.ctaDescription')}
          </p>
          <Button size="lg" className="mt-6" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={open}>
            {t('nav.requestQuote')}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
            {t('blogPostPage.backToArticles')}
          </Link>
        </div>
      </article>
    </>
  )
}
