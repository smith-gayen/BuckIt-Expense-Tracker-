'use client'

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-heading font-bold text-text-primary">Cookie Policy</h1>
      <p className="text-sm text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-neutral-700">We use essential cookies for core functionality and, with consent, analytics cookies to improve the service.</p>
      <h2 className="text-xl font-semibold text-text-primary">Your Choices</h2>
      <p className="text-neutral-700">You can consent or withdraw consent to analytics cookies at any time using the cookie banner or your browser settings.</p>
    </div>
  )
}


