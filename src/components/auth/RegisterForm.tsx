'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterForm() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Create Account</h3>
      <div className="space-y-3">
        <input className="input-field" type="text" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="btn-primary w-full" onClick={async()=>register(email, name, password)}>Create Account</button>
      </div>
    </div>
  )
}


