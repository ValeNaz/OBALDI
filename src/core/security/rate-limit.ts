type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();
let lastCleanupAt = 0;

const cleanup = (now: number) => {
  if (now - lastCleanupAt < 60_000) return;
  lastCleanupAt = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
};

export const rateLimit = (params: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  const now = Date.now();
  cleanup(now);

  const entry = store.get(params.key);
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + params.windowMs;
    store.set(params.key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: params.limit - 1,
      resetAt
    };
  }

  if (entry.count >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  store.set(params.key, entry);

  return {
    allowed: true,
    remaining: params.limit - entry.count,
    resetAt: entry.resetAt
  };
};

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  return "unknown";
};
