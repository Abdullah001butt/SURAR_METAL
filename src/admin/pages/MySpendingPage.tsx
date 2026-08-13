import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { PersonalExpenseModal } from '@/admin/components/PersonalExpenseModal'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { formatAED } from '@/admin/utils/documentCalc'
import type { PersonalExpense, PersonalExpenseCategory } from '@/admin/types'

const CATEGORY_COLORS: Record<PersonalExpenseCategory, string> = {
  transport: 'bg-amber-50 text-amber-600',
  food: 'bg-orange-50 text-orange-600',
  subscriptions: 'bg-blue-50 text-blue-600',
  family: 'bg-pink-50 text-pink-600',
  income: 'bg-emerald-50 text-emerald-600',
  other: 'bg-navy/5 text-gray',
}

async function fetchPersonalExpenses(): Promise<PersonalExpense[]> {
  const { data, error } = await supabase.from('personal_expenses').select('*').order('expense_date', { ascending: false })
  if (error) throw error
  return data
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function MySpendingPage() {
  const queryClient = useQueryClient()
  const { data: entries, isLoading } = useQuery({ queryKey: ['admin-personal-expenses'], queryFn: fetchPersonalExpenses })
  const [modalEntry, setModalEntry] = useState<PersonalExpense | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<PersonalExpense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { totalSpent, totalIncome, groups } = useMemo(() => {
    const list = entries ?? []
    let spent = 0
    let income = 0
    const byMonth = new Map<string, PersonalExpense[]>()
    for (const e of list) {
      if (e.category === 'income') income += e.amount
      else spent += e.amount
      const key = monthKey(e.expense_date)
      if (!byMonth.has(key)) byMonth.set(key, [])
      byMonth.get(key)!.push(e)
    }
    const sortedKeys = Array.from(byMonth.keys()).sort((a, b) => (a < b ? 1 : -1))
    return {
      totalSpent: spent,
      totalIncome: income,
      groups: sortedKeys.map((key) => {
        const monthEntries = byMonth.get(key)!
        const monthSpent = monthEntries.filter((e) => e.category !== 'income').reduce((s, e) => s + e.amount, 0)
        const monthIncome = monthEntries.filter((e) => e.category === 'income').reduce((s, e) => s + e.amount, 0)
        return { key, entries: monthEntries, monthSpent, monthIncome }
      }),
    }
  }, [entries])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('personal_expenses').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-personal-expenses'] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">My Spending</h1>
          <p className="mt-1 text-sm text-gray">Personal daily spending log — private, not part of company financial reports.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Total Spent</p>
            <p className="font-display text-lg font-bold text-navy" dir="ltr">AED {formatAED(totalSpent)}</p>
          </div>
          <div className="text-end">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray">Total Received</p>
            <p className="font-display text-lg font-bold text-emerald-600" dir="ltr">AED {formatAED(totalIncome)}</p>
          </div>
          <Button onClick={() => setModalEntry('new')} icon={<Plus size={16} />}>New Entry</Button>
        </div>
      </div>

      {!isLoading && groups.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white py-10 text-center text-sm text-gray ring-1 ring-navy/5">
          No entries logged yet.
        </div>
      )}

      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="font-display text-sm font-semibold text-navy">{monthLabel(group.key)}</h3>
              <p className="text-xs text-gray" dir="ltr">
                Spent: <span className="font-semibold text-navy">AED {formatAED(group.monthSpent)}</span>
                {group.monthIncome > 0 && (
                  <>
                    {' '}· Received: <span className="font-semibold text-emerald-600">AED {formatAED(group.monthIncome)}</span>
                  </>
                )}
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-navy/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/5 text-xs uppercase tracking-widest text-gray">
                    <th className="px-5 py-3 text-start font-semibold">Description</th>
                    <th className="px-5 py-3 text-start font-semibold">Category</th>
                    <th className="px-5 py-3 text-start font-semibold">Date</th>
                    <th className="px-5 py-3 text-start font-semibold">Amount</th>
                    <th className="w-24 px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.entries.map((e) => (
                    <tr key={e.id} className="group border-b border-navy/5 last:border-0 hover:bg-bg">
                      <td className="px-5 py-4 font-medium text-navy">
                        {e.description}
                        {e.notes && <p className="mt-0.5 text-xs font-normal text-gray">{e.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${CATEGORY_COLORS[e.category]}`}>{e.category}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray">{new Date(e.expense_date).toLocaleDateString()}</td>
                      <td className={`px-5 py-4 ${e.category === 'income' ? 'text-emerald-600' : 'text-navy'}`} dir="ltr">
                        {e.category === 'income' ? '+' : ''}AED {formatAED(e.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => setModalEntry(e)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-gray hover:bg-primary/10 hover:text-primary">
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
            </div>
          </div>
        ))}
      </div>

      {modalEntry && (
        <PersonalExpenseModal
          expense={modalEntry === 'new' ? null : modalEntry}
          onClose={() => setModalEntry(null)}
          onSaved={() => {
            setModalEntry(null)
            queryClient.invalidateQueries({ queryKey: ['admin-personal-expenses'] })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete entry?"
          description={`"${deleteTarget.description}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
