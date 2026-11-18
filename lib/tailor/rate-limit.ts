import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const redis = hasUpstash ? Redis.fromEnv() : undefined;

const burstLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'tailor:burst' })
  : undefined;

const dailyLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(15, '1 d'), prefix: 'tailor:daily' })
  : undefined;

// Fallback for local dev / single-instance deployments without Upstash
// configured. Resets on process restart and doesn't coordinate across
// instances — set UPSTASH_REDIS_REST_URL/TOKEN in production.
const memoryHits = new Map<string, number[]>();
function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  memoryHits.set(key, hits);
  return hits.length <= max;
}

export type TailorRateLimitResult = { allowed: true } | { allowed: false; reason: 'burst' | 'daily' };

export async function checkTailorRateLimit(ip: string): Promise<TailorRateLimitResult> {
  if (burstLimiter && dailyLimiter) {
    const [daily, burst] = await Promise.all([dailyLimiter.limit(ip), burstLimiter.limit(ip)]);
    if (!daily.success) return { allowed: false, reason: 'daily' };
    if (!burst.success) return { allowed: false, reason: 'burst' };
    return { allowed: true };
  }

  if (!memoryLimit(`daily:${ip}`, 15, 24 * 60 * 60 * 1000)) {
    return { allowed: false, reason: 'daily' };
  }
  if (!memoryLimit(`burst:${ip}`, 5, 10 * 60 * 1000)) {
    return { allowed: false, reason: 'burst' };
  }
  return { allowed: true };
}
