import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { UserModel } from '@/models'
import { signToken, setAuthCookie } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }

    await connectDB()

    const normEmail = String(email).toLowerCase().trim()
    const user = await UserModel.findOne({ email: normEmail })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ sub: String(user._id), email: user.email, name: user.name }, 'access')
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
        preferences: user.preferences || { currency: 'INR', locale: 'en-IN', theme: 'system' },
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Login failed' }, { status: 500 })
  }
}
