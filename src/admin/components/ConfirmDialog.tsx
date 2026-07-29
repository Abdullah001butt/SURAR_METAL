import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, onClose, loading }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <button onClick={onClose}><X size={18} className="text-gray" /></button>
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-sm text-gray">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>Cancel</Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
