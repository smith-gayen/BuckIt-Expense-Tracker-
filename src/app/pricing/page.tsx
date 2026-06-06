'use client'

export default function PricingPage() {
  const tiers = [
    { name: 'Free', price: '₹0', desc: 'For personal tracking', features: ['Manual expenses', 'Basic charts', 'Local storage'] },
    { name: 'Pro', price: '₹299/mo', desc: 'For power users', features: ['OCR receipts', 'AI chatbot', 'Predictive insights', 'Export CSV/Excel'] },
    { name: 'Business', price: 'Contact', desc: 'Teams and finance ops', features: ['Multi-user', 'Admin controls', 'Priority support'] },
  ]
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-text-primary text-center mb-10">Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(t => (
          <div key={t.name} className="card flex flex-col">
            <h3 className="text-xl font-semibold text-text-primary">{t.name}</h3>
            <p className="text-3xl font-bold text-text-primary mt-2">{t.price}</p>
            <p className="text-sm text-neutral-600 mb-4">{t.desc}</p>
            <ul className="text-sm text-neutral-700 space-y-1 mb-6">
              {t.features.map(f => (<li key={f}>• {f}</li>))}
            </ul>
            <button className="btn-primary mt-auto">Choose {t.name}</button>
          </div>
        ))}
      </div>
    </div>
  )
}


