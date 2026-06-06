'use client'

import { useState, useMemo } from 'react'
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { useData } from '@/contexts/DataContext'
import ExpenseForm from '@/components/forms/ExpenseForm'
import { Expense } from '@/types'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function ExpenseList() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = state.expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || expense.category.id === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [state.expenses, searchTerm, selectedCategory, sortBy, sortOrder])

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    const ok = await confirm({
      title: 'Delete expense?',
      message: 'This action is permanent and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger'
    })
    if (ok) actions.deleteExpense(expenseId)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpense(undefined)
  }

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Expenses</h2>
          <p className="text-neutral-600">Track and manage your expenses</p>
          {filteredExpenses.length > 0 && (
            <p className="text-sm text-accent-600 mt-1">
              Total: ₹{totalExpenses.toLocaleString()} ({filteredExpenses.length} transactions)
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field min-w-40"
          >
            <option value="">All Categories</option>
            {state.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as 'date' | 'amount' | 'category')
              setSortOrder(order as 'asc' | 'desc')
            }}
            className="input-field min-w-40"
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="category-asc">Category A-Z</option>
            <option value="category-desc">Category Z-A</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || selectedCategory ? 'No matching expenses' : 'No expenses yet'}
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters.'
                : 'Start tracking your expenses by adding your first transaction.'
              }
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: expense.category.color }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium text-text-primary truncate">
                      {expense.description}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                      <span>{expense.category.icon} {expense.category.name}</span>
                      {expense.merchant && (
                        <>
                          <span>•</span>
                          <span>{expense.merchant}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(expense.date, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-text-primary">
                      ₹{expense.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {expense.paymentMode.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                      title="Edit expense"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-neutral-400 hover:text-error transition-colors"
                      title="Delete expense"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleCloseForm}
          onSuccess={() => {
            // Show success notification
            actions.addNotification({
              title: editingExpense ? 'Expense Updated' : 'Expense Added',
              message: `${editingExpense ? 'Updated' : 'Added'} expense: ${editingExpense?.description || 'New expense'}`,
              type: 'success',
              date: new Date(),
              read: false
            })
          }}
        />
      )}
    </div>
  )
}
