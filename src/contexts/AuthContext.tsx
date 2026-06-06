'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile, getCurrentUserClient, registerUser, loginUser, logoutUser, updateUserProfile } from '@/lib/auth'

interface AuthContextShape {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextShape | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate from server-backed session (JWT cookie)
    getCurrentUserClient()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const u = await loginUser(email, password)
    setUser(u)
  }

  const register = async (email: string, name: string, password: string) => {
    const u = await registerUser(email, name, password)
    setUser(u)
  }

  const logout = () => {
    logoutUser().finally(() => setUser(null))
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    // Optimistic update
    const optimistic = { ...user, ...updates, preferences: { ...user.preferences, ...updates.preferences } }
    setUser(optimistic)
    try {
      const saved = await updateUserProfile(updates)
      setUser(saved)
    } catch (e) {
      // Revert if server fails (optional: show toast)
      setUser(user)
      throw e
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


