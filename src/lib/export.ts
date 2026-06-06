import { storage, STORAGE_KEYS } from '@/lib/storage'

type DatasetKey = keyof typeof STORAGE_KEYS

function downloadFile(filename: string, mime: string, content: string | Blob) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function buildCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.map(escapeCSV).join(',')]
  for (const row of rows) lines.push(row.map(escapeCSV).join(','))
  return lines.join('\n')
}

function toISODate(d: any): string {
  try {
    const date = typeof d === 'string' ? new Date(d) : d
    if (date && !isNaN(date.getTime())) return date.toISOString()
  } catch {}
  return ''
}

function getData(dataset: DatasetKey): any[] {
  const key = STORAGE_KEYS[dataset]
  const data = storage.get<any[]>(key)
  return Array.isArray(data) ? data : []
}

export function exportCSV(dataset: DatasetKey) {
  const data = getData(dataset)
  let headers: string[] = []
  let rows: (string | number | null | undefined)[][] = []

  switch (dataset) {
    case 'EXPENSES': {
      headers = ['id', 'amount', 'category', 'description', 'date', 'paymentMode', 'merchant', 'tags', 'isRecurring', 'location']
      rows = data.map((e: any) => [
        e.id,
        e.amount,
        e.category?.name,
        e.description,
        toISODate(e.date),
        e.paymentMode,
        e.merchant,
        Array.isArray(e.tags) ? e.tags.join('|') : '',
        e.isRecurring ? 'true' : 'false',
        e.location || ''
      ])
      break
    }
    case 'INCOME': {
      headers = ['id', 'amount', 'source', 'date', 'isRecurring', 'description']
      rows = data.map((i: any) => [
        i.id,
        i.amount,
        i.source,
        toISODate(i.date),
        i.isRecurring ? 'true' : 'false',
        i.description || ''
      ])
      break
    }
    case 'BUDGETS': {
      headers = ['id', 'category', 'amount', 'spent', 'period', 'startDate', 'endDate']
      rows = data.map((b: any) => [
        b.id,
        b.category?.name,
        b.amount,
        b.spent,
        b.period,
        toISODate(b.startDate),
        toISODate(b.endDate)
      ])
      break
    }
    case 'SAVINGS_GOALS': {
      headers = ['id', 'name', 'targetAmount', 'currentAmount', 'deadline', 'description', 'isActive']
      rows = data.map((g: any) => [
        g.id,
        g.name,
        g.targetAmount,
        g.currentAmount,
        toISODate(g.deadline),
        g.description || '',
        g.isActive ? 'true' : 'false'
      ])
      break
    }
    case 'SAVINGS_RULES': {
      headers = ['id', 'name', 'type', 'amount', 'condition', 'isActive', 'totalSaved']
      rows = data.map((r: any) => [
        r.id,
        r.name,
        r.type,
        r.amount,
        r.condition,
        r.isActive ? 'true' : 'false',
        r.totalSaved
      ])
      break
    }
    case 'CATEGORIES': {
      headers = ['id', 'name', 'icon', 'color', 'budget', 'isCustom']
      rows = data.map((c: any) => [
        c.id,
        c.name,
        c.icon,
        c.color,
        c.budget || '',
        c.isCustom ? 'true' : 'false'
      ])
      break
    }
    case 'NOTIFICATIONS': {
      headers = ['id', 'title', 'message', 'type', 'date', 'read', 'actionUrl']
      rows = data.map((n: any) => [
        n.id,
        n.title,
        n.message,
        n.type,
        toISODate(n.date),
        n.read ? 'true' : 'false',
        n.actionUrl || ''
      ])
      break
    }
  }

  const csv = buildCSV(headers, rows)
  downloadFile(`trackify_${dataset.toLowerCase()}.csv`, 'text/csv;charset=utf-8', csv)
}

export function exportExcelHTML(dataset: DatasetKey) {
  const data = getData(dataset)
  const buildTable = (): string => {
    if (!Array.isArray(data) || data.length === 0) return '<table><tr><td>No data</td></tr></table>'
    const cols = new Set<string>()
    data.forEach((row: any) => Object.keys(row || {}).forEach((k) => cols.add(k)))
    const headers = Array.from(cols)
    const rows = data.map((row: any) => headers.map((h) => formatCell(row?.[h])))
    const thead = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`
    const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')
    return `<table border="1">${thead}${tbody}</table>`
  }
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${buildTable()}</body></html>`
  downloadFile(`trackify_${dataset.toLowerCase()}.xls`, 'application/vnd.ms-excel', html)
}

function escapeHtml(s: any): string {
  const str = s === null || s === undefined ? '' : String(s)
  return str.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

function formatCell(v: any): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') {
    if (v?.name) return String(v.name)
    try { return JSON.stringify(v) } catch { return String(v) }
  }
  return String(v)
}

export const EXPORTABLE_DATASETS: { key: DatasetKey; label: string }[] = [
  { key: 'EXPENSES', label: 'Expenses' },
  { key: 'INCOME', label: 'Income' },
  { key: 'BUDGETS', label: 'Budgets' },
  { key: 'SAVINGS_GOALS', label: 'Savings Goals' },
  { key: 'SAVINGS_RULES', label: 'Savings Rules' },
  { key: 'CATEGORIES', label: 'Categories' },
  { key: 'NOTIFICATIONS', label: 'Notifications' },
]


