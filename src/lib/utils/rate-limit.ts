type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

type Options = { max: number; windowMs: number };

export async function rateLimit(
  identifier: string,
  endpoint: string,
  { max, windowMs }: Options
): Promise<boolean> {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= max) return true;

  entry.count += 1;
  return false;
}
