import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Phone } from 'lucide-react'
import { fetchLeads, updateLeadStatus, LEAD_STATUS_OPTIONS, type UnifiedLead } from '@/admin/utils/leads'
import type { LeadStatus } from '@/admin/types'
import { cn } from '@/utils/cn'

const COLUMN_META: Record<LeadStatus, { label: string; accent: string; headerBg: string }> = {
  new: { label: 'New', accent: 'border-t-blue-500', headerBg: 'bg-blue-50 text-blue-700' },
  contacted: { label: 'Contacted', accent: 'border-t-amber-500', headerBg: 'bg-amber-50 text-amber-700' },
  quoted: { label: 'Quoted', accent: 'border-t-violet-500', headerBg: 'bg-violet-50 text-violet-700' },
  won: { label: 'Won', accent: 'border-t-emerald-500', headerBg: 'bg-emerald-50 text-emerald-700' },
  lost: { label: 'Lost', accent: 'border-t-red-500', headerBg: 'bg-red-50 text-red-700' },
}

function LeadCard({ lead, onDragStart }: { lead: UnifiedLead; onDragStart: (e: React.DragEvent, lead: UnifiedLead) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className="cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-navy/5 transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <p className="text-sm font-semibold text-navy">{lead.name}</p>
      {lead.company && <p className="text-xs text-gray">{lead.company}</p>}
      {lead.interest && (
        <span className="mt-2 inline-block rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-gray">{lead.interest}</span>
      )}
      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray" dir="ltr">
        <span className="flex items-center gap-1 truncate"><Mail size={11} /> {lead.email}</span>
        {lead.phone && <span className="flex items-center gap-1 shrink-0"><Phone size={11} /> {lead.phone}</span>}
      </div>
    </div>
  )
}

export function SalesPipelinePage() {
  const queryClient = useQueryClient()
  const { data: leads } = useQuery({ queryKey: ['admin-leads'], queryFn: fetchLeads })
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)

  const columns = useMemo(() => {
    const grouped: Record<LeadStatus, UnifiedLead[]> = { new: [], contacted: [], quoted: [], won: [], lost: [] }
    for (const lead of leads ?? []) grouped[lead.status].push(lead)
    return grouped
  }, [leads])

  const handleDragStart = (e: React.DragEvent, lead: UnifiedLead) => {
    e.dataTransfer.setData('text/plain', lead.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const leadId = e.dataTransfer.getData('text/plain')
    const lead = (leads ?? []).find((l) => l.id === leadId)
    if (!lead || lead.status === status) return

    queryClient.setQueryData<UnifiedLead[]>(['admin-leads'], (prev) =>
      (prev ?? []).map((l) => (l.id === leadId ? { ...l, status } : l)),
    )
    await updateLeadStatus(lead, status)
    queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy">Sales Pipeline</h1>
      <p className="mt-1 text-sm text-gray">Drag leads between stages to update their status.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
        {LEAD_STATUS_OPTIONS.map((status) => {
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
                {items.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} />
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
    </div>
  )
}
