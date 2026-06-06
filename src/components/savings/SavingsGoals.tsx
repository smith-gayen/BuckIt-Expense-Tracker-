'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, BanknotesIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { SavingsGoal, SavingsRule } from '@/types'
import SavingsGoalForm from '@/components/forms/SavingsGoalForm'
import SavingsRuleForm from '@/components/forms/SavingsRuleForm'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function SavingsGoals() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)

  const goals = state.savingsGoals
  const rules = state.savingsRules

  const goalsWithProgress = useMemo(() => {
    return goals.map((g) => {
      const percentage = Math.round((g.currentAmount / g.targetAmount) * 100)
      const remaining = Math.max(g.targetAmount - g.currentAmount, 0)
      return { ...g, percentage, remaining }
    })
  }, [goals])

  const handleEditGoal = (id: string) => {
    setEditingGoalId(id)
    setShowGoalForm(true)
  }

  const handleDeleteGoal = async (id: string) => {
    const ok = await confirm({
      title: 'Delete goal?',
      message: 'This action is permanent and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger'
    })
    if (ok) actions.deleteSavingsGoal(id)
  }

  const toggleRule = (rule: SavingsRule) => {
    actions.updateSavingsRule({ ...rule, isActive: !rule.isActive })
  }

  const handleAddRule = () => {
    setEditingRuleId(null)
    setShowRuleForm(true)
  }

  const handleEditRule = (id: string) => {
    setEditingRuleId(id)
    setShowRuleForm(true)
  }

  const handleDeleteRule = async (id: string) => {
    const ok = await confirm({
      title: 'Delete rule?',
      message: 'This action is permanent and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger'
    })
    if (ok) actions.deleteSavingsRule(id)
  }

  const activeEditingGoal = editingGoalId ? goals.find((g) => g.id === editingGoalId) || undefined : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Savings</h2>
          <p className="text-neutral-600">Track your savings goals and automated rules</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={() => setShowGoalForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Savings Goals */}
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-6">Savings Goals</h3>
        <div className="space-y-6">
          {goalsWithProgress.length === 0 ? (
            <p className="text-sm text-neutral-600">No goals yet. Create your first goal.</p>
          ) : (
            goalsWithProgress.map((goal) => (
              <div key={goal.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-text-primary">{goal.name}</h4>
                    <p className="text-sm text-neutral-600">Target: ₹{goal.targetAmount.toLocaleString()} by {goal.deadline.toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-neutral-400 hover:text-primary-500" title="Edit" onClick={() => handleEditGoal(goal.id)}>
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-error" title="Delete" onClick={() => handleDeleteGoal(goal.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div className="text-right ml-auto">
                    <p className="text-lg font-semibold text-text-primary">₹{goal.currentAmount.toLocaleString()}</p>
                    <p className="text-sm text-neutral-600">{goal.percentage}% complete</p>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3 mb-2">
                  <div className="h-3 rounded-full bg-accent-500" style={{ width: `${Math.min(goal.percentage, 100)}%` }} />
                </div>
                <p className="text-sm text-neutral-600">₹{goal.remaining.toLocaleString()} remaining to reach your goal</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Auto-Saver Rules */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">
              Auto-Saver Rules
            </h3>
            <p className="text-sm text-neutral-600">AI-powered saving rules based on your behavior</p>
          </div>
          <button className="btn-secondary" onClick={handleAddRule}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-accent-600 mr-2" />
                  <h4 className="font-medium text-text-primary">{rule.name}</h4>
                </div>
                <button
                  onClick={() => toggleRule(rule)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${rule.isActive ? 'bg-accent-100 text-accent-800' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-lg font-semibold text-accent-600 mb-1">₹{rule.totalSaved.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">Total saved</p>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn-secondary" onClick={() => handleEditRule(rule.id)}>Edit</button>
                <button className="btn-secondary" onClick={() => handleDeleteRule(rule.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showGoalForm && (
        <SavingsGoalForm
          goal={activeEditingGoal}
          onClose={() => {
            setShowGoalForm(false)
            setEditingGoalId(null)
          }}
        />
      )}
      {showRuleForm && (
        <SavingsRuleForm
          rule={editingRuleId ? rules.find(r => r.id === editingRuleId) : undefined}
          onClose={() => {
            setShowRuleForm(false)
            setEditingRuleId(null)
          }}
        />
      )}
    </div>
  )
}
