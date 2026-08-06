import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { supabase } from '@/services/supabase'
import type { BlogPost } from '@/admin/types'

async function fetchLatestPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3)
  if (error) throw error
  return data
}

export function BlogTeaser() {
  const { t } = useTranslation()
  const { data: posts } = useQuery({ queryKey: ['public-blog-teaser'], queryFn: fetchLatestPosts })

  // Nothing published yet (or still loading) — skip the section rather than show an empty shell.
  if (!posts || posts.length === 0) return null

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow={t('blogTeaser.eyebrow')} title={t('blogTeaser.title')} />
          <Link to="/blog" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            {t('blogTeaser.viewAll')}
            <ArrowUpRight size={15} className="rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block overflow-hidden rounded-2xl bg-bg ring-1 ring-navy/5 transition-shadow hover:shadow-lg">
                {post.cover_image && (
                  <div className="aspect-16/10 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold text-navy group-hover:text-primary">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray">{post.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
