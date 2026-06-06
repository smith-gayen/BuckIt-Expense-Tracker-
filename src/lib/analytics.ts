import { Expense } from '@/types'

export interface ForecastPoint {
  monthLabel: string
  amount: number
}

export interface ForecastResult {
  forecastNext3: ForecastPoint[]
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
}

export interface Anomaly {
  id: string
  date: Date
  amount: number
  description: string
  severity: 'low' | 'medium' | 'high'
}

// Simple moving average + seasonal index approach (lightweight heuristic)
export function forecastExpenses(expenses: Expense[], monthsBack: number = 12): ForecastResult {
  const now = new Date()
  const series: number[] = []
  const labels: string[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth(), y = d.getFullYear()
    labels.push(`${d.toLocaleString('default', { month: 'short' })} ${String(y).slice(-2)}`)
    const sum = expenses.filter(e => e.date.getMonth() === m && e.date.getFullYear() === y)
      .reduce((s, e) => s + e.amount, 0)
    series.push(sum)
  }

  const n = series.length
  const window = Math.min(3, n)
  const movingAvg = (idx: number) => {
    const start = Math.max(0, idx - window + 1)
    const slice = series.slice(start, idx + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  }

  const last = series[n - 1] || 0
  const prev = series[n - 2] || last
  const trend: ForecastResult['trend'] = last > prev * 1.05 ? 'increasing' : last < prev * 0.95 ? 'decreasing' : 'stable'

  const next: ForecastPoint[] = []
  const seasonality = seasonalIndex(series)
  for (let k = 1; k <= 3; k++) {
    const base = movingAvg(n - 1)
    const seasonal = seasonality[(n + k) % 12] || 1
    const estimate = base * seasonal
    const date = new Date(now.getFullYear(), now.getMonth() + k, 1)
    next.push({ monthLabel: date.toLocaleString('default', { month: 'short' }), amount: Math.max(0, Math.round(estimate)) })
  }

  // crude confidence: inverse of variance in last 6 points
  const last6 = series.slice(-6)
  const mean = last6.reduce((s, v) => s + v, 0) / (last6.length || 1)
  const variance = last6.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (last6.length || 1)
  const confidence = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) / (mean || 1) * 100)))

  return { forecastNext3: next, trend, confidence }
}

function seasonalIndex(series: number[]): number[] {
  if (series.length < 12) return Array(12).fill(1)
  const idx: number[] = Array(12).fill(0)
  const counts: number[] = Array(12).fill(0)
  for (let i = 0; i < series.length; i++) {
    const m = i % 12
    idx[m] += series[i]
    counts[m]++
  }
  const avg = series.reduce((s, v) => s + v, 0) / series.length
  return idx.map((sum, i) => (sum / (counts[i] || 1)) / (avg || 1) || 1)
}

// Anomaly detection: z-score over rolling mean/standard deviation
export function detectAnomalies(expenses: Expense[], window: number = 6): Anomaly[] {
  const byDay = aggregateByDay(expenses)
  const values = byDay.map((b) => b.amount)
  const anomalies: Anomaly[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window)
    const ref = values.slice(start, i)
    if (ref.length < Math.max(3, Math.floor(window / 2))) continue
    const mean = ref.reduce((s, v) => s + v, 0) / ref.length
    const sd = Math.sqrt(ref.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / ref.length) || 1
    const z = (values[i] - mean) / sd
    if (z > 3) {
      anomalies.push({
        id: String(byDay[i].date.getTime()),
        date: byDay[i].date,
        amount: values[i],
        description: `Unusually high spend (z=${z.toFixed(2)}) vs rolling average`,
        severity: z > 5 ? 'high' : z > 4 ? 'medium' : 'low',
      })
    }
  }
  return anomalies
}

function aggregateByDay(expenses: Expense[]): { date: Date; amount: number }[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const key = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,'0')}-${String(e.date.getDate()).padStart(2,'0')}`
    map.set(key, (map.get(key) || 0) + e.amount)
  }
  return Array.from(map.entries()).map(([k, v]) => ({ date: new Date(k), amount: v })).sort((a,b) => a.date.getTime() - b.date.getTime())
}

// Category-level helpers
export function forecastByCategory(expenses: Expense[], categoryName: string): ForecastResult {
  const filtered = expenses.filter(e => e.category.name === categoryName)
  return forecastExpenses(filtered, 12)
}

export function anomaliesByCategory(expenses: Expense[], categoryName: string, window: number = 6): Anomaly[] {
  const filtered = expenses.filter(e => e.category.name === categoryName)
  return detectAnomalies(filtered, window)
}


