'use client'

import { useMemo, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { anomaliesByCategory } from '@/lib/analytics'

export default function CategoryAnomalies() {
  const { state } = useData()
  const [selected, setSelected] = useState<string>('')

  const categories = state.categories.map(c => c.name)
  const active = selected || categories[0]
  const anomalies = useMemo(() => anomaliesByCategory(state.expenses, active, 10), [state.expenses, active])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-text-primary">Category Anomalies</h3>
        <select className="input-field min-w-40" value={active} onChange={(e) => setSelected(e.target.value)}>
          {categories.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      {anomalies.length === 0 ? (
        <p className="text-sm text-neutral-600">No anomalies detected for {active}.</p>
      ) : (
        <div className="space-y-2">
          {anomalies.slice(-5).map((a) => (
            <div key={a.id} className={`p-3 rounded border ${a.severity === 'high' ? 'border-red-300 bg-red-50' : a.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-neutral-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">₹{a.amount.toLocaleString()} on {a.date.toLocaleDateString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${a.severity === 'high' ? 'bg-red-200 text-red-800' : a.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-neutral-200 text-neutral-700'}`}>{a.severity}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


