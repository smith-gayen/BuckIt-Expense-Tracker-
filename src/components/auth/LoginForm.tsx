'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Login</h3>
      <div className="space-y-3">
        <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="text-xs text-error">{error}</p>}
        <button className="btn-primary w-full" onClick={async()=>{ try { setError(null); await login(email, password) } catch(e: any){ setError(e?.message || 'Login failed') } }}>Login</button>
      </div>
    </div>
  )
}


