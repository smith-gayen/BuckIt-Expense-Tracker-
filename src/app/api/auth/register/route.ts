import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { UserModel } from '@/models'
import { signToken, setAuthCookie } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'email, name, and password are required' }, { status: 400 })
    }

    await connectDB()

    const normEmail = String(email).toLowerCase().trim()
    const existing = await UserModel.findOne({ email: normEmail }).lean()
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const doc = await UserModel.create({ email: normEmail, name, passwordHash })

    const token = signToken({ sub: String(doc._id), email: doc.email, name: doc.name }, 'access')
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: String(doc._id),
        email: doc.email,
        name: doc.name,
        avatar: doc.avatar || null,
        preferences: doc.preferences || { currency: 'INR', locale: 'en-IN', theme: 'system' },
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Registration failed' }, { status: 500 })
  }
}
