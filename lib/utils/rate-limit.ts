interface Attempt {
  count: number;
  resetAt: number;
}

const store = new Map<string, Attempt>();

export function checkRateLimit(ip: string, max = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
