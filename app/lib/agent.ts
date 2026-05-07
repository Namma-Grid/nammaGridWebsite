const AGENT_BASE = (
  process.env.NEXT_PUBLIC_BESCOM_AGENT_URL ?? 'https://bescom-ev-agent.vercel.app'
).replace(/\/$/, '');

type CacheEntry = { data: string; ts: number };
const _cache = new Map<string, CacheEntry>();
const _inflight = new Map<string, Promise<string>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function clearAgentCache(message?: string): void {
  if (message) _cache.delete(message);
  else _cache.clear();
}

export function hasAgentCache(message: string): boolean {
  const hit = _cache.get(message);
  return !!hit && Date.now() - hit.ts < CACHE_TTL_MS;
}

export async function queryAgent(message: string, bust = false): Promise<string> {
  if (!bust) {
    const hit = _cache.get(message);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;
    const pending = _inflight.get(message);
    if (pending) return pending;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${AGENT_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`Agent error: ${res.status}`);
      const data = await res.json();
      const reply = data.reply as string;
      _cache.set(message, { data: reply, ts: Date.now() });
      return reply;
    } finally {
      _inflight.delete(message);
    }
  })();

  _inflight.set(message, promise);
  return promise;
}
