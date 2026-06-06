'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'trackify_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const v = localStorage.getItem(CONSENT_KEY)
    if (!v) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-50">
      <div className="max-w-4xl mx-auto bg-white border border-neutral-200 shadow rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-neutral-700 md:mr-4">We use cookies to personalize content and to analyze traffic. You can change your preferences anytime.
          <a href="/cookies" className="ml-1 text-primary-600 hover:underline">Learn more</a>
        </p>
        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <button className="btn-secondary" onClick={()=>{ localStorage.setItem(CONSENT_KEY, 'declined'); setVisible(false) }}>Decline</button>
          <button className="btn-primary" onClick={()=>{ localStorage.setItem(CONSENT_KEY, 'accepted'); setVisible(false) }}>Accept</button>
        </div>
      </div>
    </div>
  )
}


