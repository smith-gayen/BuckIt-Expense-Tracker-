'use client'

import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center mb-2">
          <Image src="/hero-poster.jpg" alt="Trackify" width={48} height={48} className="h-12 w-12 rounded object-cover" />
          <div className="mt-2 text-lg font-heading font-semibold text-text-primary">Trackify</div>
        </div>
        <LoginForm />
        <p className="text-sm text-center text-neutral-600">
          Don&apos;t have an account? <Link href="/signup" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}


