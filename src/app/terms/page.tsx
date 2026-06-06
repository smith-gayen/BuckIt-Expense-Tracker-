'use client'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-heading font-bold text-text-primary">Terms of Service</h1>
      <p className="text-sm text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-neutral-700">By using Trackify, you agree to these terms. If you do not agree, do not use the service.</p>
      <h2 className="text-xl font-semibold text-text-primary">Use of Service</h2>
      <p className="text-neutral-700">You are responsible for your account and entries. Do not upload illegal content.</p>
      <h2 className="text-xl font-semibold text-text-primary">No Financial Advice</h2>
      <p className="text-neutral-700">Insights are informational and not financial advice. Consult a professional for financial decisions.</p>
      <h2 className="text-xl font-semibold text-text-primary">Limitation of Liability</h2>
      <p className="text-neutral-700">Trackify is provided "as is" without warranties. We are not liable for damages arising from use.</p>
      <h2 className="text-xl font-semibold text-text-primary">Changes</h2>
      <p className="text-neutral-700">We may update these terms. Continued use after changes constitutes acceptance.</p>
      <h2 className="text-xl font-semibold text-text-primary">Contact</h2>
      <p className="text-neutral-700">legal@trackify.app</p>
    </div>
  )
}


