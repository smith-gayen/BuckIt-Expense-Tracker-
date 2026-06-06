'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type ConfirmOptions = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  tone?: 'danger' | 'default'
}

type ConfirmContextShape = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextShape | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  const handleClose = (value: boolean) => {
    setOpen(false)
    if (resolver) resolver(value)
    setResolver(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => handleClose(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg border border-neutral-200 bg-white shadow-xl">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-base font-semibold text-text-primary">
                {options.title || 'Confirm action'}
              </h3>
            </div>
            <div className="p-4 text-sm text-neutral-700">
              {options.message || 'This action is permanent and cannot be undone.'}
            </div>
            <div className="p-3 flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50">
              <button
                className="btn-secondary"
                onClick={() => handleClose(false)}
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                className={`btn-primary ${options.tone === 'danger' ? '!bg-red-600 hover:!bg-red-700' : ''}`}
                onClick={() => handleClose(true)}
              >
                {options.confirmText || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
