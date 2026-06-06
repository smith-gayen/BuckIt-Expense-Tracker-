'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { budgetSchema, BudgetFormData } from '@/lib/validations'
import { Budget } from '@/types'

interface BudgetFormProps {
  budget?: Budget
  onClose: () => void
  onSuccess?: () => void
}

export default function BudgetForm({ budget, onClose, onSuccess }: BudgetFormProps) {
  const { state, actions } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? {
          categoryId: budget.category.id,
          amount: budget.amount,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
        }
      : {
          period: 'monthly',
          startDate: new Date(),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
        },
  })

  const selectedCategoryId = watch('categoryId')
  const selectedCategory = state.categories.find((c) => c.id === selectedCategoryId)

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    try {
      const category = state.categories.find((c) => c.id === data.categoryId)
      if (!category) throw new Error('Category not found')

      const payload: Omit<Budget, 'id' | 'spent'> = {
        category,
        amount: data.amount,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
      }

      if (budget) {
        actions.updateBudget({ ...payload, id: budget.id, spent: budget.spent })
      } else {
        actions.addBudget(payload)
      }

      onSuccess?.()
      onClose()
    } catch (e) {
      console.error('Error saving budget', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-xl font-heading font-semibold text-text-primary">{budget ? 'Edit Budget' : 'Set Budget'}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Category *</label>
              <select {...register('categoryId')} className={`input-field ${errors.categoryId ? 'border-error' : ''}`}>
                <option value="">Select a category</option>
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-sm text-error mt-1">{errors.categoryId.message}</p>}
              {selectedCategory && (
                <div className="mt-2 flex items-center">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: selectedCategory.color }} />
                  <span className="text-sm text-neutral-600">{selectedCategory.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Amount *</label>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className={`input-field ${errors.amount ? 'border-error' : ''}`} placeholder="0.00" />
              {errors.amount && <p className="text-sm text-error mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Period *</label>
              <select {...register('period')} className={`input-field ${errors.period ? 'border-error' : ''}`}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.period && <p className="text-sm text-error mt-1">{errors.period.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date *</label>
                <input type="date" {...register('startDate', { valueAsDate: true })} className={`input-field ${errors.startDate ? 'border-error' : ''}`} />
                {errors.startDate && <p className="text-sm text-error mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">End Date *</label>
                <input type="date" {...register('endDate', { valueAsDate: true })} className={`input-field ${errors.endDate ? 'border-error' : ''}`} />
                {errors.endDate && <p className="text-sm text-error mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : budget ? 'Update' : 'Create'} Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


