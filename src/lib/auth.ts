export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string | null
  preferences?: {
    currency?: string
    locale?: string
    theme?: 'light' | 'dark' | 'system'
  }
}

// Client-side: fetch current user via API (reads HTTP-only cookie on server)
export async function getCurrentUserClient(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.user || null
  } catch {
    return null
  }
}

// Server-side: helper to read user directly (for server components/routes)
// Note: Only call this on the server (typeof window === 'undefined')
// Server-only helpers moved to src/lib/auth.server.ts

export async function registerUser(email: string, name: string, password: string): Promise<UserProfile> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Registration failed')
  return data.user as UserProfile
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Login failed')
  return data.user as UserProfile
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Failed to update profile')
  return data.user as UserProfile
}


