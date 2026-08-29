const CACHE_PREFIX = "ampilogov-map-json:";
const cleanedVersions = new Set<string>();

function versionedUrl(pathname: string, version: string) {
  const url = new URL(pathname, window.location.origin);
  url.searchParams.set("v", version);
  return url.toString();
}

async function removeStaleMapCaches(currentCacheName: string) {
  if (cleanedVersions.has(currentCacheName)) return;
  cleanedVersions.add(currentCacheName);

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames
    .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== currentCacheName)
    .map((cacheName) => caches.delete(cacheName)));
}

export async function readVersionedMapJson<T>(
  pathname: string,
  version: string,
  signal?: AbortSignal,
): Promise<T> {
  const url = versionedUrl(pathname, version);
  if (!("caches" in window)) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);
    return response.json() as Promise<T>;
  }

  const cacheName = `${CACHE_PREFIX}${version}`;
  const cache = await caches.open(cacheName);
  void removeStaleMapCaches(cacheName).catch(() => undefined);

  const cached = await cache.match(url);
  if (cached) return cached.json() as Promise<T>;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);

  try {
    await cache.put(url, response.clone());
  } catch {
    // A full or restricted browser cache must not prevent the live response.
  }
  return response.json() as Promise<T>;
}
