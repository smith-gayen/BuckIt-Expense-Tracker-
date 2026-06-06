import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

interface RateLimitConfig {
  maxRequests: number  // Maximum number of requests allowed
  windowMs: number     // Time window in milliseconds
}

export function getRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    for (const [key, timestamp] of rateLimit.entries()) {
      if (timestamp < windowStart) {
        rateLimit.delete(key)
      }
    }

    // Count requests from this IP in the current window
    const requestCount = Array.from(rateLimit.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length

    if (requestCount >= config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }

    // Record this request
    rateLimit.set(`${ip}-${now}`, now)
    
    return NextResponse.next()
  }
}