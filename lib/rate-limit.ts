// Simple in-memory rate limiter.
//
// Limitations (by design, acceptable for a single-server deployment):
// - Counters live in server memory, so they reset when the process restarts.
// - If you ever run more than one Node instance behind a load balancer,
//   move this to a shared store (Redis) so all instances share counters.

type Bucket = {
  count: number
  resetAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __horizonRateLimitBuckets: Map<string, Bucket> | undefined
}

const buckets: Map<string, Bucket> =
  globalThis.__horizonRateLimitBuckets ?? new Map()

globalThis.__horizonRateLimitBuckets = buckets

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1

  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  }
}

export function resetRateLimit(key: string) {
  buckets.delete(key)
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = req.headers.get("x-real-ip")

  if (realIp) {
    return realIp
  }

  return "unknown"
}
