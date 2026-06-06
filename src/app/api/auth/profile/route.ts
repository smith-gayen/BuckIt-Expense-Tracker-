import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { UserModel } from '@/models'
import { readAuthCookie, verifyToken } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest) {
  try {
    const token = await readAuthCookie()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token, 'access')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, email, avatar, preferences } = body || {}

    await connectDB()
    const updates: any = {}
    if (typeof name === 'string') updates.name = name
    if (typeof email === 'string') updates.email = String(email).toLowerCase().trim()
    if (typeof avatar === 'string' || avatar === null) updates.avatar = avatar
    if (preferences && typeof preferences === 'object') {
      updates.preferences = {
        ...(preferences.currency ? { currency: preferences.currency } : {}),
        ...(preferences.locale ? { locale: preferences.locale } : {}),
        ...(preferences.theme ? { theme: preferences.theme } : {}),
      }
    }

    const updated = await UserModel.findByIdAndUpdate(payload.sub, updates, { new: true }).lean()
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      user: {
        id: String((updated as any)._id),
        email: (updated as any).email,
        name: (updated as any).name,
        avatar: (updated as any).avatar || null,
        preferences: (updated as any).preferences || { currency: 'INR', locale: 'en-IN', theme: 'system' },
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update profile' }, { status: 500 })
  }
}
