import "server-only"
import { CHAT_LIMITS } from "@/lib/chat/limits"

/**
 * Best-effort, in-memory rate limit per visitor.
 *
 * Limitation (documented on purpose): on serverless hosting each instance keeps
 * its own memory, so this slows down casual abuse but is not a hard guarantee.
 * The AI provider's own free-tier limits are the real backstop.
 */
const MINUTE = 60_000
const DAY = 86_400_000
const hits = new Map<string, number[]>()

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfterSeconds: number }

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  if (hits.size > 5000) hits.clear()

  const recent = (hits.get(key) ?? []).filter((time) => now - time < DAY)
  const lastMinute = recent.filter((time) => now - time < MINUTE)

  if (lastMinute.length >= CHAT_LIMITS.perMinute) {
    const wait = Math.ceil((MINUTE - (now - lastMinute[0])) / 1000)
    return { ok: false, retryAfterSeconds: Math.max(1, wait) }
  }

  if (recent.length >= CHAT_LIMITS.perDay) {
    const wait = Math.ceil((DAY - (now - recent[0])) / 1000)
    return { ok: false, retryAfterSeconds: Math.max(1, wait) }
  }

  recent.push(now)
  hits.set(key, recent)
  return { ok: true }
}
