'use client'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-heading font-bold text-text-primary">Privacy Policy</h1>
      <p className="text-sm text-neutral-600">Last updated: {new Date().toLocaleDateString()}</p>
      <p className="text-neutral-700">We respect your privacy. This policy explains what data we collect, how we use it, and your rights.</p>
      <h2 className="text-xl font-semibold text-text-primary">Data We Collect</h2>
      <ul className="list-disc pl-6 text-neutral-700 space-y-1">
        <li>Account info (name, email)</li>
        <li>Financial entries you add (expenses, income, budgets, goals)</li>
        <li>Receipts you upload for OCR processing</li>
        <li>Usage analytics (with consent)</li>
      </ul>
      <h2 className="text-xl font-semibold text-text-primary">How We Use Data</h2>
      <ul className="list-disc pl-6 text-neutral-700 space-y-1">
        <li>Provide and improve the service</li>
        <li>Generate insights and predictions</li>
        <li>Communicate updates and support</li>
      </ul>
      <h2 className="text-xl font-semibold text-text-primary">Your Rights</h2>
      <p className="text-neutral-700">You can request access, correction, export, or deletion of your data. Contact us via the Contact section.</p>
      <h2 className="text-xl font-semibold text-text-primary">Data Retention</h2>
      <p className="text-neutral-700">We retain data as long as needed to provide the service or as required by law. You can delete your data from settings.</p>
      <h2 className="text-xl font-semibold text-text-primary">Contact</h2>
      <p className="text-neutral-700">For privacy inquiries, email privacy@trackify.app.</p>
    </div>
  )
}


