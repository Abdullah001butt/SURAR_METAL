import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/services/supabase'
import type { BlogPost } from '@/admin/types'

// Maps each product category id to the blog articles most relevant to it —
// static and explicit rather than a keyword search, since it's a handful of
// deliberate editorial links, not a generic "related content" algorithm.
const PRODUCT_RELATED_SLUGS: Record<string, string[]> = {
  'pallet-racking': [
    'pallet-racking-ajman-guide',
    'warehouse-racking-cost-uae',
    'selective-vs-drive-in-racking',
    'warehouse-racking-safety-inspection-checklist-uae',
    'how-to-calculate-warehouse-storage-capacity',
  ],
  'shelving-systems': ['shelving-systems-ajman-guide', 'how-to-calculate-warehouse-storage-capacity'],
  'mezzanine-floors': ['mezzanine-floor-cost-uae', 'how-to-calculate-warehouse-storage-capacity'],
  'cantilever-racks': ['cantilever-racking-uae-guide'],
}

async function fetchRelatedPosts(slugs: string[]): Promise<BlogPost[]> {
  if (slugs.length === 0) return []
  const { data, error } = await supabase.from('blog_posts').select('*').eq('published', true).in('slug', slugs)
  if (error) throw error
  // Preserve the curated order from PRODUCT_RELATED_SLUGS rather than whatever order the DB returns
  return slugs.map((slug) => data.find((p) => p.slug === slug)).filter((p): p is BlogPost => !!p)
}

export function RelatedArticles({ productId }: { productId: string }) {
  const { t } = useTranslation()
  const slugs = PRODUCT_RELATED_SLUGS[productId] ?? []
  const { data: posts } = useQuery({
    queryKey: ['related-articles', productId],
    queryFn: () => fetchRelatedPosts(slugs),
    enabled: slugs.length > 0,
  })

  if (!posts || posts.length === 0) return null

  return (
    <section className="bg-bg py-16">
      <div className="container-px mx-auto max-w-6xl">
        <h2 className="font-display text-2xl font-semibold text-navy">{t('productDetail.relatedReading')}</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-navy/5 transition-shadow hover:shadow-lg"
            >
              <div>
                <p className="font-display text-base font-semibold text-navy group-hover:text-primary">{post.title}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray">{post.excerpt}</p>
              </div>
              <span className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Read article <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
