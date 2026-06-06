'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { savingsGoalSchema, SavingsGoalFormData } from '@/lib/validations'
import { SavingsGoal } from '@/types'

interface SavingsGoalFormProps {
  goal?: SavingsGoal
  onClose: () => void
  onSuccess?: () => void
}

export default function SavingsGoalForm({ goal, onClose, onSuccess }: SavingsGoalFormProps) {
  const { actions } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: goal ? {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      description: goal.description,
      isActive: goal.isActive,
    } : {
      deadline: new Date(),
      isActive: true,
      currentAmount: 0,
    }
  })

  const onSubmit = async (data: SavingsGoalFormData) => {
    setIsSubmitting(true)
    try {
      const payload: Omit<SavingsGoal, 'id'> = {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline,
        description: data.description,
        isActive: data.isActive ?? true,
      }

      if (goal) {
        actions.updateSavingsGoal({ ...payload, id: goal.id })
      } else {
        actions.addSavingsGoal(payload)
      }

      onSuccess?.()
      onClose()
    } catch (e) {
      console.error('Error saving goal', e)
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
            <h2 className="text-xl font-heading font-semibold text-text-primary">{goal ? 'Edit Goal' : 'Add Goal'}</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
              <input type="text" {...register('name')} className={`input-field ${errors.name ? 'border-error' : ''}`} placeholder="Goal name" />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Target Amount *</label>
              <input type="number" step="0.01" {...register('targetAmount', { valueAsNumber: true })} className={`input-field ${errors.targetAmount ? 'border-error' : ''}`} placeholder="0.00" />
              {errors.targetAmount && <p className="text-sm text-error mt-1">{errors.targetAmount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Current Amount</label>
              <input type="number" step="0.01" {...register('currentAmount', { valueAsNumber: true })} className={`input-field ${errors.currentAmount ? 'border-error' : ''}`} placeholder="0.00" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Deadline *</label>
                <input type="date" {...register('deadline', { valueAsDate: true })} className={`input-field ${errors.deadline ? 'border-error' : ''}`} />
                {errors.deadline && <p className="text-sm text-error mt-1">{errors.deadline.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Active</label>
                <select {...register('isActive')} className="input-field">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
              <textarea {...register('description')} className="input-field" rows={3} placeholder="Optional details" />
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : goal ? 'Update' : 'Create'} Goal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


