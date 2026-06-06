import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { UserModel } from '@/models'
import { readAuthCookie, verifyToken } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const token = await readAuthCookie()
    if (!token) return NextResponse.json({ user: null })

    const payload = verifyToken(token, 'access')
    if (!payload) return NextResponse.json({ user: null })

    await connectDB()
    const raw: any = await (UserModel as any).findById(payload.sub).lean()
    const user: any = raw && !Array.isArray(raw) ? raw : null
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({
      user: {
        id: String((user as any)._id),
        email: (user as any).email,
        name: (user as any).name,
        avatar: (user as any).avatar || null,
        preferences: (user as any).preferences || { currency: 'INR', locale: 'en-IN', theme: 'system' },
      }
    })
  } catch (e: any) {
    return NextResponse.json({ user: null })
  }
}
