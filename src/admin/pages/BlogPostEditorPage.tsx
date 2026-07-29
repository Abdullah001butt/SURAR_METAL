import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { marked } from 'marked'
import { ArrowLeft, Save, ExternalLink } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/admin/utils/slugify'
import type { BlogPost } from '@/admin/types'

async function fetchPost(id: number): Promise<BlogPost> {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export function BlogPostEditorPage() {
  const location = useLocation()
  return <BlogPostEditorPageInner key={location.pathname} />
}

function BlogPostEditorPageInner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id
  const { data: existingPost } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: () => fetchPost(Number(id)),
    enabled: !isNew,
  })

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title)
      setSlug(existingPost.slug)
      setExcerpt(existingPost.excerpt)
      setContent(existingPost.content)
      setCoverImage(existingPost.cover_image ?? '')
      setMetaTitle(existingPost.meta_title ?? '')
      setMetaDescription(existingPost.meta_description ?? '')
      setKeywords(existingPost.keywords ?? '')
      setPublished(existingPost.published)
      setSlugTouched(true)
    }
  }, [existingPost])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        title,
        slug: slug || slugify(title),
        excerpt,
        content,
        cover_image: coverImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        keywords: keywords || null,
        published,
        published_at: published ? (existingPost?.published_at ?? new Date().toISOString()) : existingPost?.published_at ?? null,
      }

      if (existingPost) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', existingPost.id)
        if (error) throw error
        queryClient.invalidateQueries({ queryKey: ['admin-blog-post', id] })
      } else {
        const { data, error } = await supabase.from('blog_posts').insert(payload).select('id').single()
        if (error) throw error
        navigate(`/dashboard/blog/${data.id}`, { replace: true })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard/blog" className="flex items-center gap-2 text-sm font-medium text-gray hover:text-navy">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        <div className="flex gap-3">
          {existingPost?.published && (
            <a
              href={`/blog/${existingPost.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              <ExternalLink size={14} /> View Live
            </a>
          )}
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <Button onClick={save} disabled={saving || !title || !content} icon={<Save size={16} />}>
            {saving ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray">Title</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Best Steel Gate Design 2026"
              className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary"
            />
            <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-gray">URL Slug</label>
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm" dir="ltr">
              <span className="text-gray">/blog/</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-gray">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Short summary shown on the blog listing page"
              className="mt-1 w-full resize-none rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-gray">Cover Image URL</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-navy">Content</h2>
              <span className="text-xs text-gray">Markdown supported</span>
            </div>
            {showPreview ? (
              <div
                className="prose prose-sm mt-4 max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(content || '*Nothing to preview yet.*') as string }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={22}
                placeholder="## Heading&#10;&#10;Write your article in Markdown..."
                className="mt-4 w-full resize-y rounded-lg border border-navy/10 bg-bg px-3 py-3 font-mono text-sm outline-none focus:border-primary"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">Visibility</h2>
            <label className="mt-4 flex items-center gap-3">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5 rounded border-navy/20" />
              <span className="text-sm font-medium text-navy">Published (visible on website)</span>
            </label>
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
            <h2 className="font-display text-lg font-semibold text-navy">SEO</h2>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-gray">Meta Title</label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={title || 'Defaults to article title'}
              className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-[11px] text-gray">{(metaTitle || title).length}/60 characters</p>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-widest text-gray">Meta Description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder={excerpt || 'Defaults to excerpt'}
              className="mt-1 w-full resize-none rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-[11px] text-gray">{(metaDescription || excerpt).length}/160 characters</p>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-widest text-gray">Focus Keywords</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="steel gate design, gate price UAE"
              className="mt-1 w-full rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
