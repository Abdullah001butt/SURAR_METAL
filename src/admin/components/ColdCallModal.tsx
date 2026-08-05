import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { upsertColdCall, type ColdCall, type ColdCallSource } from '@/admin/utils/coldCalls'

const SOURCES: ColdCallSource[] = ['cold_call', 'directory', 'referral', 'linkedin', 'other']
const SOURCE_LABELS: Record<ColdCallSource, string> = {
  cold_call: 'Cold Call',
  directory: 'Directory',
  referral: 'Referral',
  linkedin: 'LinkedIn',
  other: 'Other',
}

interface ColdCallModalProps {
  prospect?: ColdCall | null
  onClose: () => void
  onSaved: () => void
}

export function ColdCallModal({ prospect, onClose, onSaved }: ColdCallModalProps) {
  const isEdit = !!prospect
  const [form, setForm] = useState({
    name: prospect?.name ?? '',
    company: prospect?.company ?? '',
    phone: prospect?.phone ?? '',
    source: prospect?.source ?? 'cold_call',
    notes: prospect?.notes ?? '',
    follow_up_date: prospect?.follow_up_date ?? '',
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await upsertColdCall(
      { ...form, follow_up_date: form.follow_up_date || null },
      prospect?.id,
    )
    setSaving(false)
    if (!error) onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">{isEdit ? 'Edit Prospect' : 'Add Prospect'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            autoFocus
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Company (optional)"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Phone"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value as ColdCallSource })}
              className="rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray">Follow-up date (optional)</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
              className="mt-1 w-full rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <textarea
            placeholder="Notes (what they said, next steps...)"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Prospect'}
          </Button>
        </form>
      </div>
    </div>
  )
}
