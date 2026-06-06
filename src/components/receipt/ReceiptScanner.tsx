'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import { Expense } from '@/types'
import { runOCR } from '@/lib/ocr'

export default function ReceiptScanner() {
  const { state, actions } = useData()
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const [extractedData, setExtractedData] = useState<{
    merchant: string
    amount: number
    date: string
    items: { name: string; price: number; quantity: number }[]
    category: string
    paymentMode: string
  } | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setIsProcessing(true)
    try {
      const file = acceptedFiles[0]
      // Try server OCR first (better preprocessing and performance)
      let result: any | null = null
      try {
        const fd = new FormData()
        fd.append('file', file)
        const ctrl = new AbortController()
        const to = setTimeout(() => ctrl.abort(), 20000) // 20s timeout
        const res = await fetch('/api/ocr', { method: 'POST', body: fd, signal: ctrl.signal as any })
        clearTimeout(to)
        if (res.ok) {
          const data = await res.json()
          result = data
        }
      } catch {
        // ignore, will fallback
      }
      // Fallback to client OCR if server failed
      if (!result) {
        result = await runOCR(file)
      }
      setOcrConfidence(typeof result.confidence === 'number' ? Math.round(result.confidence) : null)
      // Best-match category from existing categories (case-insensitive, includes)
      const guess = (result.categoryGuess || '').toLowerCase()
      const names = state.categories.map(c => c.name)
      const exact = names.find(n => n.toLowerCase() === guess)
      const partial = names.find(n => n.toLowerCase().includes(guess))
      const bestCategory = exact || partial || 'Other'

      setExtractedData({
        merchant: result.merchant || 'Unknown Merchant',
        amount: result.amount || 0,
        date: result.date || new Date().toISOString().split('T')[0],
        items: result.items || [],
        category: bestCategory,
        paymentMode: (result.paymentModeGuess as string) || 'digital_wallet',
      })
    } catch (e) {
      console.error('OCR failed', e)
      setExtractedData(null)
      setOcrConfidence(null)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  })

  const handleSaveExpense = () => {
    if (!extractedData) return
    const matchedCategory = state.categories.find((c) => c.name === extractedData.category) || state.categories[0]

    const hasItems = Array.isArray(extractedData.items) && extractedData.items.length > 0
    if (hasItems) {
      // Create one expense per item line with individual total (price * quantity)
      extractedData.items.forEach((it) => {
        const lineTotal = Number((it.price * (it.quantity || 1)).toFixed(2))
        const expense: Omit<Expense, 'id'> = {
          amount: lineTotal,
          category: matchedCategory,
          description: it.name,
          date: new Date(extractedData.date),
          paymentMode: extractedData.paymentMode as any,
          merchant: extractedData.merchant,
          tags: ['receipt', 'itemized'],
          isRecurring: false,
          location: undefined,
        }
        actions.addExpense(expense)
      })
    } else {
      // Fallback single expense using overall amount
      const expense: Omit<Expense, 'id'> = {
        amount: Number(extractedData.amount),
        category: matchedCategory,
        description: `${extractedData.merchant} purchase`,
        date: new Date(extractedData.date),
        paymentMode: extractedData.paymentMode as any,
        merchant: extractedData.merchant,
        tags: ['receipt'],
        isRecurring: false,
        location: undefined,
      }
      actions.addExpense(expense)
    }

    setExtractedData(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-text-primary">Receipt Scanner</h2>
        <p className="text-neutral-600">Upload receipt images to automatically extract expense data</p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-neutral-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps({ capture: 'environment' as any })} />
          
          {isProcessing ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-text-primary mb-2">Processing Receipt...</h3>
              <p className="text-neutral-600">Using AI to extract transaction details</p>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {isDragActive ? 'Drop your receipt here' : 'Upload Receipt'}
              </h3>
              <p className="text-neutral-600 mb-4">
                Drag and drop an image file, or click to select
              </p>
              <div className="flex justify-center space-x-4">
                <button className="btn-primary">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Choose File
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Extracted Data */}
      {extractedData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-text-primary">Extracted Data</h3>
            {ocrConfidence !== null && (
              <span className={`text-xs px-2 py-1 rounded-full border ${ocrConfidence >= 80 ? 'text-emerald-700 border-emerald-300 bg-emerald-50' : ocrConfidence >= 60 ? 'text-amber-700 border-amber-300 bg-amber-50' : 'text-rose-700 border-rose-300 bg-rose-50'}`}>
                OCR confidence: {ocrConfidence}%
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-text-primary mb-3">Transaction Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600">Merchant</label>
                  <input 
                    type="text" 
                    value={extractedData.merchant}
                    onChange={(e)=> setExtractedData({ ...extractedData, merchant: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Amount</label>
                  <input 
                    type="number" 
                    value={extractedData.amount}
                    onChange={(e)=> setExtractedData({ ...extractedData, amount: Number(e.target.value) || 0 })}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Date</label>
                  <input 
                    type="date" 
                    value={extractedData.date}
                    onChange={(e)=> setExtractedData({ ...extractedData, date: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Category</label>
                  <select 
                    className="input-field mt-1"
                    value={extractedData.category}
                    onChange={(e)=> setExtractedData({ ...extractedData, category: e.target.value })}
                  >
                    {state.categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {!state.categories.find(c=>c.name===extractedData.category) && (
                      <option value={extractedData.category}>{extractedData.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">Payment Mode</label>
                  <select 
                    className="input-field mt-1"
                    value={extractedData.paymentMode}
                    onChange={(e)=> setExtractedData({ ...extractedData, paymentMode: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="digital_wallet">Digital Wallet / UPI</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-3">Items ({extractedData.items.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {extractedData.items.map((item, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              onClick={() => setExtractedData(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveExpense}
              className="btn-primary"
            >
              Save Expense
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
