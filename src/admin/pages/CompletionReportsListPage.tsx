import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { calcReportTotal } from '@/admin/utils/completionReportCalc'
import { formatAED } from '@/admin/utils/documentCalc'
import type { CompletionReport } from '@/admin/types'

async function fetchReports(): Promise<CompletionReport[]> {
  const { data, error } = await supabase
    .from('completion_reports')
    .select('*, items:completion_report_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CompletionReport[]
}

export function CompletionReportsListPage() {
  const queryClient = useQueryClient()
  const { data: reports, isLoading } = useQuery({ queryKey: ['admin-completion-reports'], queryFn: fetchReports })
  const [deleteTarget, setDeleteTarget] = useState<CompletionReport | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('completion_reports').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-completion-reports'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Work Completion Reports</h1>
          <p className="mt-1 text-sm text-gray">Confirm completed jobs to clients with a signed-off summary and payment request.</p>
        </div>
        <Link to="/dashboard/completion-reports/new">
          <Button icon={<Plus size={16} />}>New Report</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Client</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
              <th className="px-5 py-3 text-start font-semibold">Invoices</th>
              <th className="px-5 py-3 text-start font-semibold">Total</th>
              <th className="w-24 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((report) => (
              <tr key={report.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4">
                  <Link to={`/dashboard/completion-reports/${report.id}`} className="font-semibold text-navy hover:text-primary">
                    {report.client_name}
                  </Link>
                  {report.client_location && <p className="text-xs text-gray">{report.client_location}</p>}
                </td>
                <td className="px-5 py-4 text-xs text-gray">{new Date(report.report_date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-gray">{(report.items ?? []).length}</td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(calcReportTotal(report.items ?? []))}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link to={`/dashboard/completion-reports/${report.id}`} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => setDeleteTarget(report)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && reports?.length === 0 && <p className="py-10 text-center text-sm text-gray">No completion reports yet. Create your first one.</p>}
        {isLoading && <p className="py-10 text-center text-sm text-gray">Loading...</p>}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete report?"
          description={`The completion report for "${deleteTarget.client_name}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
