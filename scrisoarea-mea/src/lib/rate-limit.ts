/**
 * Simple in-memory rate limiter for MVP.
 * In production (Vercel/Serverless), use Vercel KV or Upstash.
 */
const RATELIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5

// Global store (warn: resets on server restart/function cold start)
const ipRequests = new Map<string, { count: number, resetAt: number }>()

export function checkRateLimit(identifier: string) {
    const now = Date.now()
    const record = ipRequests.get(identifier)

    if (record) {
        if (now > record.resetAt) {
            ipRequests.set(identifier, { count: 1, resetAt: now + RATELIMIT_WINDOW })
            return true
        }

        if (record.count >= MAX_REQUESTS) {
            return false
        }

        record.count++
        return true
    }

    ipRequests.set(identifier, { count: 1, resetAt: now + RATELIMIT_WINDOW })
    return true
}
