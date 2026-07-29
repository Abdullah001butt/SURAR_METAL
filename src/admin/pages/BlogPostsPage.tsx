import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import type { BlogPost } from '@/admin/types'

async function fetchPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export function BlogPostsPage() {
  const queryClient = useQueryClient()
  const { data: posts, isLoading } = useQuery({ queryKey: ['admin-blog-posts'], queryFn: fetchPosts })
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const togglePublished = async (post: BlogPost) => {
    await supabase
      .from('blog_posts')
      .update({ published: !post.published, published_at: !post.published ? new Date().toISOString() : post.published_at })
      .eq('id', post.id)
    queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('blog_posts').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Blog</h1>
          <p className="mt-1 text-sm text-gray">SEO articles published on the public website.</p>
        </div>
        <Link to="/dashboard/blog/new">
          <Button icon={<Plus size={16} />}>New Article</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Title</th>
              <th className="px-5 py-3 text-start font-semibold">Slug</th>
              <th className="px-5 py-3 text-start font-semibold">Status</th>
              <th className="px-5 py-3 text-start font-semibold">Updated</th>
              <th className="w-32 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => (
              <tr key={post.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link to={`/dashboard/blog/${post.id}`} className="font-semibold text-navy hover:text-primary">{post.title}</Link>
                </td>
                <td className="px-5 py-4 text-gray" dir="ltr">/{post.slug}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => togglePublished(post)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${post.published ? 'bg-emerald-50 text-emerald-600' : 'bg-navy/5 text-gray'}`}
                  >
                    {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {post.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-5 py-4 text-xs text-gray">{new Date(post.updated_at).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link to={`/dashboard/blog/${post.id}`} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => setDeleteTarget(post)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && posts?.length === 0 && <p className="py-10 text-center text-sm text-gray">No articles yet. Create your first one.</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete article?"
          description={`"${deleteTarget.title}" will be permanently removed and unpublished from the website.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
