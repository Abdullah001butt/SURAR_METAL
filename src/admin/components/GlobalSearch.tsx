import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Users, Inbox } from 'lucide-react'
import { supabase } from '@/services/supabase'

interface SearchResults {
  documents: { id: number; doc_number: string; customerName: string | null }[]
  customers: { id: number; name: string }[]
  leads: { id: number; name: string; email: string; source: 'quote' | 'contact' }[]
}

const EMPTY: SearchResults = { documents: [], customers: [], leads: [] }

export function GlobalSearch() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      const q = query.trim()
      const [docsRes, customersRes, quotesRes, contactsRes] = await Promise.all([
        supabase.from('documents').select('id, doc_number, customer:customers(name)').ilike('doc_number', `%${q}%`).limit(6),
        supabase.from('customers').select('id, name').ilike('name', `%${q}%`).limit(6),
        supabase.from('quote_requests').select('id, name, email').or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`).limit(4),
        supabase.from('contact_messages').select('id, name, email').or(`name.ilike.%${q}%,email.ilike.%${q}%`).limit(4),
      ])

      setResults({
        documents: (docsRes.data ?? []).map((d) => ({ id: d.id, doc_number: d.doc_number, customerName: (d.customer as { name?: string } | null)?.name ?? null })),
        customers: customersRes.data ?? [],
        leads: [
          ...(quotesRes.data ?? []).map((l) => ({ ...l, source: 'quote' as const })),
          ...(contactsRes.data ?? []).map((l) => ({ ...l, source: 'contact' as const })),
        ],
      })
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const hasResults = useMemo(
    () => results.documents.length > 0 || results.customers.length > 0 || results.leads.length > 0,
    [results],
  )

  const close = () => {
    setOpen(false)
    setQuery('')
    setResults(EMPTY)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-gray hover:border-primary/40"
      >
        <Search size={15} />
        Search everything...
        <kbd className="ms-auto rounded bg-bg px-1.5 py-0.5 text-[10px] font-semibold text-gray">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/60 p-4 pt-24" onClick={close}>
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-navy/5 px-5 py-4">
              <Search size={18} className="text-gray" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, documents, customers..."
                className="flex-1 text-sm outline-none"
              />
              <button onClick={close}><X size={18} className="text-gray" /></button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading && <p className="px-3 py-6 text-center text-sm text-gray">Searching...</p>}

              {!loading && query && !hasResults && <p className="px-3 py-6 text-center text-sm text-gray">No results for "{query}".</p>}

              {results.documents.length > 0 && (
                <div className="p-2">
                  <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray">Documents</p>
                  {results.documents.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { navigate(`/dashboard/documents/${d.id}`); close() }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm hover:bg-bg"
                    >
                      <FileText size={15} className="text-primary" />
                      <span className="font-semibold text-navy" dir="ltr">{d.doc_number}</span>
                      {d.customerName && <span className="text-xs text-gray">{d.customerName}</span>}
                    </button>
                  ))}
                </div>
              )}

              {results.customers.length > 0 && (
                <div className="p-2">
                  <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray">Customers</p>
                  {results.customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { navigate('/dashboard/customers'); close() }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm hover:bg-bg"
                    >
                      <Users size={15} className="text-primary" />
                      <span className="text-navy">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.leads.length > 0 && (
                <div className="p-2">
                  <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray">Leads</p>
                  {results.leads.map((l) => (
                    <button
                      key={`${l.source}-${l.id}`}
                      onClick={() => { navigate('/dashboard/leads'); close() }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm hover:bg-bg"
                    >
                      <Inbox size={15} className="text-primary" />
                      <span className="text-navy">{l.name}</span>
                      <span className="text-xs text-gray" dir="ltr">{l.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
