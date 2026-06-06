'use client'

import { useMemo } from 'react'
import { useData } from '@/contexts/DataContext'
import { forecastExpenses } from '@/lib/analytics'

export default function PredictiveInsights() {
  const { state } = useData()
  const result = useMemo(() => forecastExpenses(state.expenses, 12), [state.expenses])

  return (
    <div className="card">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Predictive Insights</h3>
      <div className="space-y-2">
        <p className="text-sm text-neutral-600">Trend: <span className="font-medium text-text-primary capitalize">{result.trend}</span></p>
        <p className="text-sm text-neutral-600">Confidence: <span className="font-medium text-text-primary">{result.confidence}%</span></p>
        <div>
          <p className="text-sm font-medium text-text-primary mb-2">Next 3 months (estimated)</p>
          <div className="grid grid-cols-3 gap-2">
            {result.forecastNext3.map((p) => (
              <div key={p.monthLabel} className="p-3 rounded border border-neutral-200 text-center">
                <p className="text-xs text-neutral-600">{p.monthLabel}</p>
                <p className="text-sm font-semibold text-text-primary">₹{p.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


