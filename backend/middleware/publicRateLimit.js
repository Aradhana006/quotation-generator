import { errorResponse } from '../utils/response.js'

const buckets = new Map()

function pruneBuckets(now) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function publicRateLimit({ windowMs = 60_000, max = 60 } = {}) {
  return function rateLimit(req, res, next) {
    const now = Date.now()
    pruneBuckets(now)
    const key = `${req.ip}:${req.baseUrl}${req.path}:${req.method}`
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    current.count += 1
    if (current.count > max) {
      return errorResponse(
        res,
        'RATE_LIMITED',
        'Too many requests. Please try again shortly.',
        429,
      )
    }

    return next()
  }
}
