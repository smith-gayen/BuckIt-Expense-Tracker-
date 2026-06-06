'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { useData } from '@/contexts/DataContext'
import IncomeForm from '@/components/forms/IncomeForm'
import { Income } from '@/types'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function IncomeList() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | undefined>()

  const filteredIncome = useMemo(() => {
    const lower = searchTerm.toLowerCase()
    return state.income
      .filter((inc) => (inc.source?.toLowerCase() || '').includes(lower) || (inc.description?.toLowerCase() || '').includes(lower))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [state.income, searchTerm])

  const totalIncome = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Income</h2>
          <p className="text-neutral-600">Track and manage your income</p>
          {filteredIncome.length > 0 && (
            <p className="text-sm text-accent-600 mt-1">Total: ₹{totalIncome.toLocaleString()} ({filteredIncome.length} records)</p>
          )}
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary mt-4 sm:mt-0">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Income
        </button>
      </div>

      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input type="text" placeholder="Search income..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
          </div>
        </div>
      </div>

      <div className="card">
        {filteredIncome.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-text-primary mb-2">{searchTerm ? 'No matching income' : 'No income records yet'}</h3>
            <p className="text-neutral-600 mb-4">{searchTerm ? 'Try adjusting your search.' : 'Add your first income entry.'}</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Income
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncome.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="min-w-0">
                  <h4 className="font-medium text-text-primary truncate">{inc.source}</h4>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    {inc.description && <span>{inc.description}</span>}
                    <span>•</span>
                    <span>{formatDistanceToNow(inc.date, { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-accent-600">+₹{inc.amount.toLocaleString()}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingIncome(inc); setShowForm(true) }} className="p-2 text-neutral-400 hover:text-primary-500" title="Edit">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={async () => { const ok = await confirm({ title: 'Delete income?', message: 'This action is permanent and cannot be undone.', confirmText: 'Delete', cancelText: 'Cancel', tone: 'danger' }); if (ok) actions.deleteIncome(inc.id) }} className="p-2 text-neutral-400 hover:text-error" title="Delete">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <IncomeForm income={editingIncome} onClose={() => { setShowForm(false); setEditingIncome(undefined) }} />
      )}
    </div>
  )
}


