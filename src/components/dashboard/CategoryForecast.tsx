'use client'

import { useMemo, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { forecastByCategory } from '@/lib/analytics'

export default function CategoryForecast() {
  const { state } = useData()
  const [selected, setSelected] = useState<string>('')

  const categories = state.categories.map(c => c.name)
  const active = selected || categories[0]
  const forecast = useMemo(() => forecastByCategory(state.expenses, active), [state.expenses, active])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-text-primary">Category Forecast</h3>
        <select className="input-field min-w-40" value={active} onChange={(e) => setSelected(e.target.value)}>
          {categories.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-neutral-600">Trend: <span className="font-medium text-text-primary capitalize">{forecast.trend}</span></p>
        <p className="text-sm text-neutral-600">Confidence: <span className="font-medium text-text-primary">{forecast.confidence}%</span></p>
        <div className="grid grid-cols-3 gap-2">
          {forecast.forecastNext3.map((p) => (
            <div key={p.monthLabel} className="p-3 rounded border border-neutral-200 text-center">
              <p className="text-xs text-neutral-600">{p.monthLabel}</p>
              <p className="text-sm font-semibold text-text-primary">₹{p.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


