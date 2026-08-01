import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Zap, Check } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { parseQuickCapture } from '@/admin/utils/quickCapture'

export function QuickCaptureBar() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const parsed = text.trim() ? parseQuickCapture(text) : null

  const close = () => {
    setOpen(false)
    setText('')
    setSaved(false)
  }

  const submit = async () => {
    if (!parsed) return
    setSaving(true)
    await supabase.from('quote_requests').insert({
      name: parsed.name,
      phone: parsed.phone ?? '',
      product_interest: parsed.note,
      status: 'new',
      source: 'quick_capture',
    })
    setSaving(false)
    setSaved(true)
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
    queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    setTimeout(close, 1100)
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        aria-label="Quick capture"
        className="fixed bottom-6 end-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"
      >
        <Plus size={24} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-start justify-center bg-navy/60 p-4 pt-32"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            >
              {saved ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={24} />
                  </div>
                  <p className="mt-3 font-semibold text-navy">Lead captured</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-primary" />
                      <h2 className="font-display text-lg font-semibold text-navy">Quick Capture</h2>
                    </div>
                    <button onClick={close}><X size={18} className="text-gray" /></button>
                  </div>
                  <p className="mt-1 text-xs text-gray">
                    Type it however it comes to you — e.g. "Ahmed, 0501234567, wants pallet racking quote"
                  </p>
                  <textarea
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submit()
                      }
                    }}
                    rows={3}
                    placeholder="Name, phone, what they need..."
                    className="mt-4 w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                  />

                  {parsed && (
                    <div className="mt-3 rounded-xl bg-bg p-3 text-xs">
                      <p className="font-semibold uppercase tracking-widest text-gray">Will be logged as</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        <span><span className="text-gray">Name:</span> <strong className="text-navy">{parsed.name}</strong></span>
                        <span dir="ltr"><span className="text-gray">Phone:</span> <strong className="text-navy">{parsed.phone ?? 'not detected'}</strong></span>
                      </div>
                      <p className="mt-1"><span className="text-gray">Note:</span> <span className="text-navy">{parsed.note}</span></p>
                    </div>
                  )}

                  <button
                    onClick={submit}
                    disabled={!parsed || saving}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Add to Leads'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
