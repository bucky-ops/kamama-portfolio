/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Scope & limitations (documented deliberately):
 * - State lives per server instance - correct for the single-node dev setup
 *   and per-warm-lambda on Vercel. A distributed limiter would need Redis.
 * - Buckets self-clean lazily on every check, so memory stays bounded even
 *   with many unique IPs.
 */

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client may retry (for the Retry-After header). */
  retryAfterSec: number;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  buckets.set(key, hits);

  // Opportunistic cleanup of stale buckets to keep memory bounded.
  if (buckets.size > 512) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || v[v.length - 1] < windowStart) {
        buckets.delete(k);
      }
    }
  }

  if (hits.length >= max) {
    const oldest = hits[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  hits.push(now);
  return { allowed: true, retryAfterSec: 0, remaining: max - hits.length };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIpFrom(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
