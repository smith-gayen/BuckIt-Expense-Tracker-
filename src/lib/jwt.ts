import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'trackify_token'

export interface JWTPayload {
  sub: string
  email: string
  name: string
  type: 'access' | 'refresh'
}

const ACCESS_TOKEN_EXPIRY = '15m'  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'  // 7 days

export function signToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh'): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  
  const expiry = type === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY
  return jwt.sign({ ...payload, type }, secret, { 
    expiresIn: expiry,
    jwtid: crypto.randomUUID() // Add unique identifier for token revocation
  })
}

export function verifyToken(token: string, expectedType: 'access' | 'refresh'): JWTPayload | null {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  
  try {
    const payload = jwt.verify(token, secret) as JWTPayload
    // Verify token type matches expected type
    if (payload.type !== expectedType) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const store: any = await (cookies() as any)
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const store: any = await (cookies() as any)
  store.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function readAuthCookie(): Promise<string | null> {
  const store: any = await (cookies() as any)
  const c = store.get(COOKIE_NAME)
  return c?.value || null
}
