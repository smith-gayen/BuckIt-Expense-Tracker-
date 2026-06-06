'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { expenseSchema, ExpenseFormData } from '@/lib/validations'
import { Expense } from '@/types'

interface ExpenseFormProps {
  expense?: Expense
  onClose: () => void
  onSuccess?: () => void
}

export default function ExpenseForm({ expense, onClose, onSuccess }: ExpenseFormProps) {
  const { state, actions } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      ...expense,
      categoryId: expense.category.id,
      date: expense.date,
    } : {
      date: new Date(),
      paymentMode: 'credit_card',
      isRecurring: false,
    }
  })

  const selectedCategoryId = watch('categoryId')
  const selectedCategory = state.categories.find(cat => cat.id === selectedCategoryId)

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    
    try {
      const category = state.categories.find(cat => cat.id === data.categoryId)
      if (!category) {
        throw new Error('Category not found')
      }

      const expenseData: Omit<Expense, 'id'> = {
        amount: data.amount,
        category,
        description: data.description,
        date: data.date,
        paymentMode: data.paymentMode,
        merchant: data.merchant,
        tags: data.tags,
        isRecurring: data.isRecurring,
        location: data.location,
      }

      if (expense) {
        // Update existing expense
        actions.updateExpense({ ...expenseData, id: expense.id })
      } else {
        // Add new expense
        actions.addExpense(expenseData)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving expense:', error)
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
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              {expense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className={`input-field ${errors.amount ? 'border-error' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-error mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <input
                type="text"
                {...register('description')}
                className={`input-field ${errors.description ? 'border-error' : ''}`}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="text-sm text-error mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className={`input-field ${errors.categoryId ? 'border-error' : ''}`}
              >
                <option value="">Select a category</option>
                {state.categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-error mt-1">{errors.categoryId.message}</p>
              )}
              {selectedCategory && (
                <div className="mt-2 flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-sm text-neutral-600">
                    {selectedCategory.name}
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                {...register('date', { valueAsDate: true })}
                className={`input-field ${errors.date ? 'border-error' : ''}`}
              />
              {errors.date && (
                <p className="text-sm text-error mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Mode *
              </label>
              <select
                {...register('paymentMode')}
                className={`input-field ${errors.paymentMode ? 'border-error' : ''}`}
              >
                <option value="cash">💵 Cash</option>
                <option value="credit_card">💳 Credit Card</option>
                <option value="debit_card">💳 Debit Card</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="digital_wallet">📱 Digital Wallet</option>
                <option value="cheque">📄 Cheque</option>
              </select>
              {errors.paymentMode && (
                <p className="text-sm text-error mt-1">{errors.paymentMode.message}</p>
              )}
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Merchant
              </label>
              <input
                type="text"
                {...register('merchant')}
                className="input-field"
                placeholder="Store or merchant name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="input-field"
                placeholder="Location"
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-neutral-700">
                This is a recurring expense
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
