'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { SavingsRule } from '@/types'

interface SavingsRuleFormProps {
  rule?: SavingsRule
  onClose: () => void
  onSuccess?: () => void
}

type SavingsRuleFormData = {
  name: string
  type: 'roundup' | 'rainy_day' | 'sunny_day' | 'naughty' | 'custom'
  amount: number
  condition: string
}

export default function SavingsRuleForm({ rule, onClose, onSuccess }: SavingsRuleFormProps) {
  const { actions } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SavingsRuleFormData>({
    defaultValues: rule ? {
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
      condition: rule.condition,
    } : {
      name: '',
      type: 'roundup',
      amount: 10,
      condition: 'on every expense',
    }
  })

  const onSubmit = async (data: SavingsRuleFormData) => {
    setIsSubmitting(true)
    try {
      if (rule) {
        actions.updateSavingsRule({ ...rule, ...data })
      } else {
        actions.addSavingsRule({ ...data, isActive: true, totalSaved: 0 })
      }
      onSuccess?.()
      onClose()
    } catch (e) {
      console.error('Failed to save savings rule', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              {rule ? 'Edit Rule' : 'Add Rule'}
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
              <input className={`input-field ${errors.name ? 'border-error' : ''}`} {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
              <select className="input-field" {...register('type', { required: true })}>
                <option value="roundup">Round-up</option>
                <option value="rainy_day">Rainy Day</option>
                <option value="sunny_day">Sunny Day</option>
                <option value="naughty">Naughty</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Amount *</label>
              <input type="number" step="0.01" className={`input-field ${errors.amount ? 'border-error' : ''}`} {...register('amount', { valueAsNumber: true, required: 'Amount is required' })} />
              {errors.amount && <p className="text-sm text-error mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Condition *</label>
              <input className={`input-field ${errors.condition ? 'border-error' : ''}`} {...register('condition', { required: 'Condition is required' })} placeholder="e.g., on every expense" />
              {errors.condition && <p className="text-sm text-error mt-1">{errors.condition.message}</p>}
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : rule ? 'Update' : 'Add'} Rule</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
