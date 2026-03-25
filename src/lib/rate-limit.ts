// Simple in-memory rate limiter (suitable for single-instance deployment)
// For multi-instance, use Redis/Upstash instead.

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface RequestRecord {
  timestamps: number[];
}

function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;
  const store = new Map<string, RequestRecord>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Allow the timer to not block Node process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Remove timestamps outside the current window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= maxRequests) {
      // Rate limit exceeded
      const oldestInWindow = record.timestamps[0]!;
      const resetAt = oldestInWindow + windowMs;
      return {
        success: false,
        remaining: 0,
        resetAt,
      };
    }

    // Allow the request
    record.timestamps.push(now);
    const remaining = maxRequests - record.timestamps.length;
    const resetAt = now + windowMs;

    return {
      success: true,
      remaining,
      resetAt,
    };
  }

  return { check };
}

/** 10 requests per minute — for AI endpoints (transcribe, parse, OCR) */
export const aiRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 10,
});

/** 30 requests per minute — general API (for future use) */
export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  maxRequests: 30,
});
