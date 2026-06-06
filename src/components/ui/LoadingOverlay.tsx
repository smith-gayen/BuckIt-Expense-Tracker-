'use client'

import React, { useEffect, useState } from 'react'

export default function LoadingOverlay({ show, durationMs = 500 }: { show: boolean, durationMs?: number }) {
  const [visible, setVisible] = useState(show)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!show) {
      setLeaving(true)
      const t = setTimeout(() => {
        setVisible(false)
        setLeaving(false)
      }, durationMs)
      return () => clearTimeout(t)
    }
    setVisible(true)
  }, [show, durationMs])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-[999] pointer-events-none flex items-center justify-center bg-white/80 dark:bg-neutral-950/70 backdrop-blur-sm transition-opacity duration-400 ease-out ${leaving ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        {/* Coin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-400 shadow-lg ring-4 ring-amber-300 animate-bounce-slow">
            <div className="w-full h-full rounded-full border-4 border-amber-500 flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl font-bold">₹</span>
            </div>
          </div>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent-500" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500" />
        </div>
      </div>
      <div className="absolute bottom-16 sm:bottom-20 text-center px-6">
        <p className="text-neutral-700 dark:text-neutral-100 font-heading text-lg sm:text-xl">Setting up your finance workspace…</p>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Loading budgets, expenses and insights</p>
      </div>

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 1.8s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
