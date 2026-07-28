import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Send } from 'lucide-react'
import { fetchActivity, logActivity } from '@/admin/utils/activity'

const EVENT_LABELS: Record<string, string> = {
  created: 'Document created',
  status_change: 'Status changed',
  note: 'Note',
  converted: 'Converted',
}

export function ActivityLog({ documentId }: { documentId: number }) {
  const queryClient = useQueryClient()
  const { data: activity } = useQuery({ queryKey: ['admin-document-activity', documentId], queryFn: () => fetchActivity(documentId) })
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const addNote = async () => {
    if (!note.trim()) return
    setSaving(true)
    await logActivity(documentId, 'note', note.trim())
    setNote('')
    setSaving(false)
    queryClient.invalidateQueries({ queryKey: ['admin-document-activity', documentId] })
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-navy/5">
      <h2 className="font-display text-lg font-semibold text-navy">Activity Log</h2>

      <div className="mt-3 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Log a note (e.g. followed up by phone)..."
          className="flex-1 rounded-lg border border-navy/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={addNote}
          disabled={saving}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white disabled:opacity-60"
        >
          <Send size={14} />
        </button>
      </div>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
        {activity?.map((a) => (
          <div key={a.id} className="flex items-start gap-3 text-xs">
            <Clock size={13} className="mt-0.5 shrink-0 text-gray" />
            <div>
              <p className="text-navy">
                <span className="font-semibold">{EVENT_LABELS[a.event_type] ?? a.event_type}</span>
                {a.note ? `: ${a.note}` : ''}
              </p>
              <p className="text-gray">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {activity?.length === 0 && <p className="py-4 text-center text-xs text-gray">No activity logged yet.</p>}
      </div>
    </div>
  )
}
