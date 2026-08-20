import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, MessageCircle, Phone, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import type { AbandonedQuote } from '@/admin/types'

async function fetchAbandonedQuotes(): Promise<AbandonedQuote[]> {
  const { data, error } = await supabase.from('abandoned_quotes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

const STEP_LABELS: Record<string, string> = {
  product: 'Stopped at: Product',
  project: 'Stopped at: Project details',
  contact: 'Stopped at: Contact info (typed, never hit Submit)',
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  const message = encodeURIComponent(
    "Hi, this is Al Surur General Store Equipment Trading. I noticed you were checking a quote on our website - happy to help if you still need pricing on racking or storage solutions. Let me know what you're looking for!",
  )
  return `https://wa.me/${digits.replace(/^\+/, '')}?text=${message}`
}

export function AbandonedQuotesPage() {
  const queryClient = useQueryClient()
  const { data: drafts, isLoading } = useQuery({ queryKey: ['admin-abandoned-quotes'], queryFn: fetchAbandonedQuotes })
  const [deleteTarget, setDeleteTarget] = useState<AbandonedQuote | null>(null)
  const [deleting, setDeleting] = useState(false)

  const toggleContacted = async (draft: AbandonedQuote) => {
    await supabase.from('abandoned_quotes').update({ contacted: !draft.contacted, updated_at: new Date().toISOString() }).eq('id', draft.id)
    queryClient.invalidateQueries({ queryKey: ['admin-abandoned-quotes'] })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('abandoned_quotes').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-abandoned-quotes'] })
  }

  const activeCount = (drafts ?? []).filter((d) => !d.contacted).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Abandoned Quotes</h1>
          <p className="mt-1 text-sm text-gray">
            Visitors who started the quote form but didn't submit it — real warm leads worth a follow-up call or WhatsApp.
          </p>
        </div>
        <div className="text-end">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray">Not yet contacted</p>
          <p className="font-display text-lg font-bold text-primary">{activeCount}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {!isLoading && drafts?.length === 0 && (
          <div className="rounded-2xl bg-white py-10 text-center text-sm text-gray ring-1 ring-navy/5">
            No abandoned quote drafts yet.
          </div>
        )}

        {drafts?.map((draft) => (
          <div
            key={draft.id}
            className={`rounded-2xl bg-white p-5 ring-1 ring-navy/5 ${draft.contacted ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-semibold text-navy">{draft.name ?? 'Unnamed visitor'}</p>
                  {draft.contacted && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">Contacted</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray">{STEP_LABELS[draft.step_reached] ?? draft.step_reached}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy">
                  {draft.phone && <span dir="ltr">📞 {draft.phone}</span>}
                  {draft.email && <span>✉️ {draft.email}</span>}
                  {draft.company && <span>🏢 {draft.company}</span>}
                  {draft.product_interest && <span>📦 {draft.product_interest}</span>}
                </div>
                {draft.message && <p className="mt-2 text-xs italic text-gray">"{draft.message}"</p>}
                <p className="mt-2 text-[11px] text-gray">{new Date(draft.created_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                {draft.phone && (
                  <>
                    <a
                      href={whatsappHref(draft.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <a
                      href={`tel:${draft.phone}`}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                      aria-label="Call"
                    >
                      <Phone size={16} />
                    </a>
                  </>
                )}
                <button
                  onClick={() => toggleContacted(draft)}
                  aria-label="Toggle contacted"
                  className={`grid h-9 w-9 place-items-center rounded-lg hover:bg-emerald-50 ${draft.contacted ? 'bg-emerald-50 text-emerald-600' : 'text-gray'}`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(draft)}
                  aria-label="Delete"
                  className="grid h-9 w-9 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this draft?"
          description={`The abandoned quote draft from "${deleteTarget.name ?? 'this visitor'}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
