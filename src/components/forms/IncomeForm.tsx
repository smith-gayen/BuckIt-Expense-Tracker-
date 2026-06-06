'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { incomeSchema, IncomeFormData } from '@/lib/validations'
import { Income } from '@/types'

interface IncomeFormProps {
  income?: Income
  onClose: () => void
}

export default function IncomeForm({ income, onClose }: IncomeFormProps) {
  const { actions } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income ? {
      amount: income.amount,
      source: income.source,
      date: income.date,
      isRecurring: income.isRecurring,
      description: income.description,
    } : {
      date: new Date(),
    }
  })

  const onSubmit = async (data: IncomeFormData) => {
    setIsSubmitting(true)
    try {
      const payload: Omit<Income, 'id'> = {
        amount: data.amount,
        source: data.source,
        date: data.date,
        isRecurring: data.isRecurring,
        description: data.description,
      }
      if (income) {
        actions.updateIncome({ ...payload, id: income.id })
      } else {
        actions.addIncome(payload)
      }
      onClose()
    } catch (e) {
      console.error('Error saving income', e)
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
            <h2 className="text-xl font-heading font-semibold text-text-primary">{income ? 'Edit Income' : 'Add Income'}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Amount *</label>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className={`input-field ${errors.amount ? 'border-error' : ''}`} placeholder="0.00" />
              {errors.amount && <p className="text-sm text-error mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Source *</label>
              <input type="text" {...register('source')} className={`input-field ${errors.source ? 'border-error' : ''}`} placeholder="Salary, freelance, etc." />
              {errors.source && <p className="text-sm text-error mt-1">{errors.source.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Date *</label>
              <input type="date" {...register('date', { valueAsDate: true })} className={`input-field ${errors.date ? 'border-error' : ''}`} />
              {errors.date && <p className="text-sm text-error mt-1">{errors.date.message}</p>}
            </div>

            <div className="flex items-center">
              <input type="checkbox" {...register('isRecurring')} className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-neutral-300 rounded" />
              <label className="ml-2 text-sm font-medium text-neutral-700">This is recurring income</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
              <input type="text" {...register('description')} className="input-field" placeholder="Optional description" />
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : income ? 'Update' : 'Add'} Income</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


