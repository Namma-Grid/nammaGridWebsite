// Wraps fetch with timeout, sessionStorage cache, and silent fallback.
// Never throws — returns fallback data and sets fromFallback=true on failure.

const _fallbackKeys = new Set<string>();

export function isFromFallback(cacheKey: string): boolean {
  return _fallbackKeys.has(cacheKey);
}

export async function fetchWithFallback<T>(
  url: string,
  fallback: T,
  cacheKey?: string,
): Promise<T> {
  try {
    if (cacheKey && typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        _fallbackKeys.delete(cacheKey);
        return JSON.parse(cached) as T;
      }
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as T;
    if (cacheKey && typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    if (cacheKey) _fallbackKeys.delete(cacheKey);
    return data;
  } catch {
    if (cacheKey) _fallbackKeys.add(cacheKey);
    return fallback;
  }
}
