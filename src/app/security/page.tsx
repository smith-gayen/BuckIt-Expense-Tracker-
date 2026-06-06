'use client'

export default function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-heading font-bold text-text-primary">Security</h1>
      <p className="text-neutral-700">We take security seriously and follow industry best practices.</p>
      <ul className="list-disc pl-6 text-neutral-700 space-y-1">
        <li>Transport security via HTTPS/TLS</li>
        <li>Local data encrypted at rest (browser storage constraints apply)</li>
        <li>Least-privilege access for services</li>
        <li>Dependency updates and vulnerability scans</li>
        <li>Incident response playbook</li>
      </ul>
      <p className="text-neutral-700">Report a vulnerability: security@trackify.app</p>
    </div>
  )
}


