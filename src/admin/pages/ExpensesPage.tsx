import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { ExpenseModal } from '@/admin/components/ExpenseModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { formatAED } from '@/admin/utils/documentCalc'
import type { Expense, ExpenseCategory } from '@/admin/types'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent: 'bg-purple-50 text-purple-600',
  salaries: 'bg-blue-50 text-blue-600',
  fuel: 'bg-amber-50 text-amber-600',
  utilities: 'bg-cyan-50 text-cyan-600',
  materials: 'bg-orange-50 text-orange-600',
  transport: 'bg-emerald-50 text-emerald-600',
  marketing: 'bg-pink-50 text-pink-600',
  other: 'bg-navy/5 text-gray',
}

async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })
  if (error) throw error
  return data
}

export function ExpensesPage() {
  const queryClient = useQueryClient()
  const { data: expenses, isLoading } = useQuery({ queryKey: ['admin-expenses'], queryFn: fetchExpenses })
  const [modalExpense, setModalExpense] = useState<Expense | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const total = useMemo(() => (expenses ?? []).reduce((sum, e) => sum + e.amount, 0), [expenses])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('expenses').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-expenses'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Expenses</h1>
          <p className="mt-1 text-sm text-gray">Operating costs — rent, salaries, fuel, and everything else that isn't a supplier bill.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Total</p>
            <p className="font-display text-lg font-bold text-navy" dir="ltr">AED {formatAED(total)}</p>
          </div>
          <Button onClick={() => setModalExpense('new')} icon={<Plus size={16} />}>New Expense</Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-navy/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
              <th className="px-5 py-3 text-start font-semibold">Description</th>
              <th className="px-5 py-3 text-start font-semibold">Category</th>
              <th className="px-5 py-3 text-start font-semibold">Vendor</th>
              <th className="px-5 py-3 text-start font-semibold">Date</th>
              <th className="px-5 py-3 text-start font-semibold">Amount</th>
              <th className="w-24 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((e) => (
              <tr key={e.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                <td className="px-5 py-4 font-medium text-navy">{e.description}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${CATEGORY_COLORS[e.category]}`}>{e.category}</span>
                </td>
                <td className="px-5 py-4 text-gray">{e.vendor ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-gray">{new Date(e.expense_date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-navy" dir="ltr">AED {formatAED(e.amount)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setModalExpense(e)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(e)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && expenses?.length === 0 && <p className="py-10 text-center text-sm text-gray">No expenses logged yet.</p>}
      </div>

      {modalExpense && (
        <ExpenseModal
          expense={modalExpense === 'new' ? null : modalExpense}
          onClose={() => setModalExpense(null)}
          onSaved={() => {
            setModalExpense(null)
            queryClient.invalidateQueries({ queryKey: ['admin-expenses'] })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete expense?"
          description={`"${deleteTarget.description}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
