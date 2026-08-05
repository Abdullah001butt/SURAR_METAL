import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Phone, Plus, Building2, Calendar } from 'lucide-react'
import {
  fetchColdCalls,
  updateColdCallStatus,
  COLD_CALL_STATUS_OPTIONS,
  type ColdCall,
  type ColdCallStatus,
} from '@/admin/utils/coldCalls'
import { ColdCallModal } from '@/admin/components/ColdCallModal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const COLUMN_META: Record<ColdCallStatus, { label: string; accent: string; headerBg: string }> = {
  not_called: { label: 'Not Called', accent: 'border-t-gray-400', headerBg: 'bg-gray-100 text-gray-700' },
  called: { label: 'Called', accent: 'border-t-blue-500', headerBg: 'bg-blue-50 text-blue-700' },
  interested: { label: 'Interested', accent: 'border-t-amber-500', headerBg: 'bg-amber-50 text-amber-700' },
  follow_up: { label: 'Follow Up', accent: 'border-t-violet-500', headerBg: 'bg-violet-50 text-violet-700' },
  not_interested: { label: 'Not Interested', accent: 'border-t-red-400', headerBg: 'bg-red-50 text-red-600' },
  converted: { label: 'Converted', accent: 'border-t-emerald-500', headerBg: 'bg-emerald-50 text-emerald-700' },
}

function ProspectCard({
  prospect,
  onDragStart,
  onClick,
}: {
  prospect: ColdCall
  onDragStart: (e: React.DragEvent, prospect: ColdCall) => void
  onClick: () => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect)}
      onClick={onClick}
      className="cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <p className="text-sm font-semibold text-navy">{prospect.name}</p>
      {prospect.company && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray"><Building2 size={11} /> {prospect.company}</p>
      )}
      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray" dir="ltr">
        <span className="flex items-center gap-1"><Phone size={11} /> {prospect.phone}</span>
      </div>
      {prospect.follow_up_date && (
        <span className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
          <Calendar size={11} /> {new Date(prospect.follow_up_date).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

export function CallTrackerPage() {
  const queryClient = useQueryClient()
  const { data: prospects } = useQuery({ queryKey: ['admin-cold-calls'], queryFn: fetchColdCalls })
  const [dragOverColumn, setDragOverColumn] = useState<ColdCallStatus | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ColdCall | null>(null)

  const columns = useMemo(() => {
    const grouped: Record<ColdCallStatus, ColdCall[]> = {
      not_called: [], called: [], interested: [], follow_up: [], not_interested: [], converted: [],
    }
    for (const p of prospects ?? []) grouped[p.status].push(p)
    return grouped
  }, [prospects])

  const handleDragStart = (e: React.DragEvent, prospect: ColdCall) => {
    e.dataTransfer.setData('text/plain', String(prospect.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e: React.DragEvent, status: ColdCallStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const id = Number(e.dataTransfer.getData('text/plain'))
    const prospect = (prospects ?? []).find((p) => p.id === id)
    if (!prospect || prospect.status === status) return

    queryClient.setQueryData<ColdCall[]>(['admin-cold-calls'], (prev) =>
      (prev ?? []).map((p) => (p.id === id ? { ...p, status } : p)),
    )
    await updateColdCallStatus(id, status)
    queryClient.invalidateQueries({ queryKey: ['admin-cold-calls'] })
  }

  const openEdit = (prospect: ColdCall) => {
    setEditing(prospect)
    setModalOpen(true)
  }

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const onSaved = () => {
    closeModal()
    queryClient.invalidateQueries({ queryKey: ['admin-cold-calls'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Call Tracker</h1>
          <p className="mt-1 text-sm text-gray">Track outbound prospects — cold calls, directory finds, referrals. Drag to update status.</p>
        </div>
        <Button onClick={openNew} icon={<Plus size={16} />}>Add Prospect</Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-6">
        {COLD_CALL_STATUS_OPTIONS.map((status) => {
          const meta = COLUMN_META[status]
          const items = columns[status]
          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status) }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, status)}
              className={cn(
                'flex min-h-[400px] flex-col rounded-2xl border-t-4 bg-bg p-3 transition-colors',
                meta.accent,
                dragOverColumn === status && 'bg-primary/5 ring-2 ring-primary/30',
              )}
            >
              <div className={cn('flex items-center justify-between rounded-lg px-3 py-2', meta.headerBg)}>
                <span className="text-sm font-semibold">{meta.label}</span>
                <span className="text-xs font-bold">{items.length}</span>
              </div>
              <div className="mt-3 flex-1 space-y-2">
                {items.map((prospect) => (
                  <ProspectCard key={prospect.id} prospect={prospect} onDragStart={handleDragStart} onClick={() => openEdit(prospect)} />
                ))}
                {items.length === 0 && (
                  <div className="grid h-20 place-items-center rounded-xl border border-dashed border-navy/10 text-xs text-gray">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && <ColdCallModal prospect={editing} onClose={closeModal} onSaved={onSaved} />}
    </div>
  )
}
