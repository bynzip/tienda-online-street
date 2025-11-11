import { useState, useEffect } from 'react';

// Caché simple en memoria con TTL y SWR
const CACHE_TTL_MS = 60_000; // 60s
const cache = new Map<string, { ts: number; data: unknown }>();

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const buildUrl = (u: string) => {
      if (/^https?:\/\//i.test(u)) return u;
      const base = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
      if (base && base.trim().length > 0) {
        const cleanBase = base.replace(/\/+$/, '');
        const cleanPath = u.startsWith('/') ? u : `/${u}`;
        return `${cleanBase}${cleanPath}`;
      }
      return u; // relativo (por ejemplo, proxied /api)
    };

    const finalUrl = buildUrl(url);

    // 1) Intentar servir desde caché inmediatamente (stale)
    const cached = cache.get(finalUrl);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.data as T);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    // 2) Revalidar en background
    const load = async () => {
      try {
        const response = await fetch(finalUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue satisfactoria');
        }
        const fetchedData = (await response.json()) as T;
        cache.set(finalUrl, { ts: Date.now(), data: fetchedData });
        if (!isActive) return;
        setData(fetchedData);
      } catch (fetchError: any) {
        if (!isActive) return;
        if (!cached) setError(fetchError?.message || 'Error desconocido');
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [url]);

  return { data, loading, error };
}
