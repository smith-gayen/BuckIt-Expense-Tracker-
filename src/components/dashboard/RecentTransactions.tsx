'use client'

import { useMemo } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { useData } from '@/contexts/DataContext'

export default function RecentTransactions() {
  const { state } = useData()

  const recentTransactions = useMemo(() => {
    // Combine expenses and income with type indicators
    const allTransactions = [
      ...state.expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category.name,
        date: expense.date,
        type: 'expense' as const,
        merchant: expense.merchant
      })),
      ...state.income.map(income => ({
        id: income.id,
        description: income.description || income.source,
        amount: income.amount,
        category: 'Income',
        date: income.date,
        type: 'income' as const,
        merchant: undefined
      }))
    ]
    
    // Sort by date (newest first) and take first 5
    return allTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  }, [state.expenses, state.income])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-primary">
            Recent Transactions
          </h3>
          <p className="text-sm text-neutral-600">Your latest financial activity</p>
        </div>
        <button className="btn-secondary text-sm">
          View All
        </button>
      </div>

      {recentTransactions.length > 0 ? (
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={`${transaction.type}-${transaction.id}`} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-4 ${
                  transaction.type === 'income' 
                    ? 'bg-accent-100 text-accent-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {transaction.category}
                    {transaction.merchant && ` • ${transaction.merchant}`}
                    {' • '}
                    {formatDistanceToNow(transaction.date, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-accent-600' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs">Add some expenses or income to see them here</p>
        </div>
      )}
    </div>
  )
}
