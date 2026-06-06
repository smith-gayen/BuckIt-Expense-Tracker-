'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { categorySchema, CategoryFormData } from '@/lib/validations'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function CategoryManager() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormData>({ name: '', icon: '📋', color: '#0A3D62' })

  const reset = () => { setEditingId(null); setForm({ name: '', icon: '📋', color: '#0A3D62' }) }

  const handleSubmit = () => {
    const parsed = categorySchema.safeParse(form)
    if (!parsed.success) return
    if (editingId) {
      const existing = state.categories.find(c => c.id === editingId)
      if (!existing) return
      actions.updateCategory({ ...existing, ...form })
    } else {
      actions.addCategory({ ...form })
    }
    reset()
  }

  const startEdit = (id: string) => {
    const existing = state.categories.find(c => c.id === id)
    if (!existing) return
    setEditingId(id)
    setForm({ name: existing.name, icon: existing.icon, color: existing.color, budget: existing.budget, isCustom: existing.isCustom })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading font-semibold text-text-primary">Categories</h3>
          <p className="text-sm text-neutral-600">Manage your expense categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="font-medium text-text-primary mb-4">Add / Edit Category</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Icon *</label>
              <input className="input-field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Emoji or short text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Color (hex) *</label>
              <input className="input-field" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#0A3D62" />
            </div>
            <div className="flex space-x-4 pt-2">
              {editingId && (
                <button type="button" className="btn-secondary flex-1" onClick={reset}>Cancel</button>
              )}
              <button type="button" className="btn-primary flex-1" onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Category</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="font-medium text-text-primary mb-4">Existing Categories</h4>
          <div className="space-y-2">
            {state.categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                <div className="flex items-center min-w-0">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: c.color }} />
                  <div className="truncate">
                    <p className="text-sm font-medium text-text-primary truncate">{c.icon} {c.name}</p>
                    {c.budget && <p className="text-xs text-neutral-600">Budget: ₹{c.budget.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-neutral-400 hover:text-primary-500" title="Edit" onClick={() => startEdit(c.id)}>
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-neutral-400 hover:text-error"
                    title="Delete"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Delete category?',
                        message: 'This will remove the category from your list. Existing expenses using it will keep the old label.',
                        confirmText: 'Delete',
                        cancelText: 'Cancel',
                        tone: 'danger'
                      })
                      if (ok) actions.deleteCategory(c.id)
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


