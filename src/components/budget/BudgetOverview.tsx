'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, ChartBarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import BudgetForm from '@/components/forms/BudgetForm'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function BudgetOverview() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const [showForm, setShowForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const budgets = state.budgets

  const budgetsWithProgress = useMemo(() => {
    return budgets.map((b) => {
      const percentage = Math.round((b.spent / b.amount) * 100)
      const isOverBudget = percentage > 100
      return { ...b, percentage, isOverBudget }
    })
  }, [budgets])

  const handleEdit = (id: string) => {
    setEditingBudgetId(id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete budget? ',
      message: 'This action is permanent and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger'
    })
    if (ok) actions.deleteBudget(id)
  }

  const activeEditingBudget = editingBudgetId ? budgets.find((b) => b.id === editingBudgetId) || undefined : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Budget</h2>
          <p className="text-neutral-600">Monitor your spending against your budget</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={() => setShowForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Set Budget
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Monthly Budget Status
          </h3>
          <div className="space-y-4">
            {budgetsWithProgress.length === 0 ? (
              <p className="text-sm text-neutral-600">No budgets yet. Create your first budget.</p>
            ) : (
              budgetsWithProgress.map((budget) => (
                <div key={budget.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center min-w-0">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: budget.category.color }} />
                      <span className="text-sm font-medium text-text-primary truncate">{budget.category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-600">₹{budget.spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</span>
                      <button className="p-2 text-neutral-400 hover:text-primary-500" title="Edit" onClick={() => handleEdit(budget.id)}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-error" title="Delete" onClick={() => handleDelete(budget.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${budget.isOverBudget ? 'bg-error' : 'bg-accent-500'}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${budget.isOverBudget ? 'text-error' : 'text-neutral-600'}`}>{budget.percentage}% used</span>
                    {budget.isOverBudget && <span className="text-xs text-error font-medium">Over budget!</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Budget Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-accent-50 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-accent-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-accent-800">Good Progress!</p>
                  <p className="text-xs text-accent-600">You&apos;re on track with most of your budgets</p>
                </div>
              </div>
            </div>
            {budgetsWithProgress
              .filter((b) => b.percentage >= 80)
              .slice(0, 2)
              .map((b) => (
                <div key={b.id} className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Watch {b.category.name}</p>
                      <p className="text-xs text-yellow-600">You've used {b.percentage}% of your {b.category.name} budget</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showForm && (
        <BudgetForm
          budget={activeEditingBudget}
          onClose={() => {
            setShowForm(false)
            setEditingBudgetId(null)
          }}
          onSuccess={() => {
            const updated = state.budgets.map((b) => {
              const expensesForBudget = state.expenses.filter((e) => {
                return e.category.id === b.category.id && e.date >= b.startDate && e.date <= b.endDate
              })
              const spent = expensesForBudget.reduce((sum, e) => sum + e.amount, 0)
              return { ...b, spent }
            })
            updated.forEach((b) => actions.updateBudget(b))
          }}
        />
      )}
    </div>
  )
}
