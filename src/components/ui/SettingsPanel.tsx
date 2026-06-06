'use client'

import { useState } from 'react'
import { ArrowUpTrayIcon, ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { exportCSV, exportExcelHTML, EXPORTABLE_DATASETS } from '@/lib/export'

export default function SettingsPanel() {
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const handleExport = () => {
    const payload: Record<string, unknown> = {}
    Object.values(STORAGE_KEYS).forEach((key) => {
      payload[key] = storage.get(key) ?? null
    })
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trackify_export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setImportSuccess(null)
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (typeof data !== 'object' || data === null) throw new Error('Invalid file format')
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          storage.set(key, data[key])
        }
      })
      setImportSuccess('Data imported successfully. Reload the page to see updates.')
    } catch (err: any) {
      setImportError(err?.message || 'Import failed')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Export Data</p>
            <p className="text-xs text-neutral-600">Download all your data as JSON, CSV, or Excel</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary" onClick={handleExport}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> JSON
            </button>
            <div className="relative">
              <details className="dropdown">
                <summary className="btn-secondary cursor-pointer list-none">CSV</summary>
                <div className="dropdown-menu card p-2 absolute right-0 mt-2 w-56 z-10">
                  {EXPORTABLE_DATASETS.map(d => (
                    <button key={d.key} className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 text-sm" onClick={() => exportCSV(d.key)}>
                      <DocumentArrowDownIcon className="inline h-4 w-4 mr-1" /> {d.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
            <div className="relative">
              <details className="dropdown">
                <summary className="btn-secondary cursor-pointer list-none">Excel</summary>
                <div className="dropdown-menu card p-2 absolute right-0 mt-2 w-56 z-10">
                  {EXPORTABLE_DATASETS.map(d => (
                    <button key={d.key} className="w-full text-left px-2 py-1 rounded hover:bg-neutral-100 text-sm" onClick={() => exportExcelHTML(d.key)}>
                      <DocumentArrowDownIcon className="inline h-4 w-4 mr-1" /> {d.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Import Data</p>
            <p className="text-xs text-neutral-600">Upload a previously exported JSON file</p>
          </div>
          <label className="btn-secondary cursor-pointer">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Import
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {importSuccess && <p className="text-xs text-accent-700 bg-accent-50 p-2 rounded">{importSuccess}</p>}
        {importError && <p className="text-xs text-error bg-red-50 p-2 rounded">{importError}</p>}
      </div>
    </div>
  )
}


