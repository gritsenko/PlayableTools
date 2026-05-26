const sessionStore = new Map();
const cacheNamePrefix = 'zip-preview-session:';

const getSessionCacheName = (sessionId) => `${cacheNamePrefix}${sessionId}`;

const buildAssetRequestUrl = (sessionId, assetPath) => {
  const scopeUrl = new URL(self.registration.scope);
  return `${scopeUrl.origin}${scopeUrl.pathname}${sessionId}/${normalizePath(assetPath)}`;
};

const buildAssetResponse = (asset) => new Response(asset.buffer.slice(0), {
  status: 200,
  headers: {
    'Content-Type': asset.mime || 'application/octet-stream',
    'Cache-Control': 'no-store',
  },
});

const persistSessionAssets = async (sessionId, assetMap) => {
  const cache = await caches.open(getSessionCacheName(sessionId));
  const writes = [];
  for (const [assetPath, asset] of assetMap.entries()) {
    writes.push(cache.put(buildAssetRequestUrl(sessionId, assetPath), buildAssetResponse(asset)));
  }
  await Promise.all(writes);
};

const persistSessionAsset = async (sessionId, assetPath, asset) => {
  const cache = await caches.open(getSessionCacheName(sessionId));
  await cache.put(buildAssetRequestUrl(sessionId, assetPath), buildAssetResponse(asset));
};

const restoreAssetFromCache = async (sessionId, requestUrl) => {
  const cache = await caches.open(getSessionCacheName(sessionId));
  const canonicalUrl = new URL(requestUrl);
  canonicalUrl.search = '';
  return cache.match(canonicalUrl.toString(), { ignoreSearch: true });
};

const clearSessionCache = async (sessionId) => {
  await caches.delete(getSessionCacheName(sessionId));
};

// ============================================================================
// Cache API Error Handler
// Patch Cache.prototype.put to gracefully handle concurrent cache operations
// ============================================================================
if (self.Cache) {
  const originalPut = Cache.prototype.put;
  Cache.prototype.put = async function(request, response) {
    try {
      return await originalPut.call(this, request, response);
    } catch (error) {
      // Handle "Entry already exists" error gracefully
      if (error instanceof DOMException && error.name === 'InvalidAccessError') {
        if (error.message && error.message.includes('Entry already exists')) {
          console.debug('[ZIP Preview SW] Cache entry already exists, skipping duplicate put operation');
          return;
        }
      }
      throw error;
    }
  };
  console.debug('[ZIP Preview SW] Cache API error handler installed');
}

const normalizePath = (path) => {
  if (!path) return "";
  return path.replace(/^\/+/, "").replace(/\/+/g, "/");
};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || !data.type) {
    return;
  }

  const replyPort = event.ports && event.ports.length > 0 ? event.ports[0] : null;

  const respond = (ok, errorMessage) => {
    if (!replyPort || typeof replyPort.postMessage !== 'function') {
      return;
    }

    try {
      replyPort.postMessage({
        ok,
        error: errorMessage || null,
      });
    } catch (error) {
      console.warn('[ZIP Preview SW] Failed to post ZIP_SESSION_ACK', error);
    }
  };

  event.waitUntil((async () => {
    try {
      switch (data.type) {
        case "ZIP_SESSION_REGISTER": {
          const { sessionId, assets } = data;
          if (!sessionId || !Array.isArray(assets)) {
            respond(false, 'Invalid ZIP_SESSION_REGISTER payload');
            return;
          }
          const t0 = (self.performance && self.performance.now) ? self.performance.now() : Date.now();
          const assetMap = new Map();
          let totalBytes = 0;
          for (const asset of assets) {
            if (!asset || !asset.path || !asset.buffer) continue;
            totalBytes += asset.buffer.byteLength || 0;
            assetMap.set(normalizePath(asset.path), {
              mime: asset.mime || "application/octet-stream",
              buffer: asset.buffer,
            });
          }
          sessionStore.set(sessionId, assetMap);
          const t1 = (self.performance && self.performance.now) ? self.performance.now() : Date.now();
          console.debug(`[ZIP Preview SW] REGISTER ${sessionId}: ${assetMap.size} assets, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB, in-memory map ready in ${Math.round(t1 - t0)}ms; persisting to Cache Storage…`);
          await persistSessionAssets(sessionId, assetMap);
          const t2 = (self.performance && self.performance.now) ? self.performance.now() : Date.now();
          console.debug(`[ZIP Preview SW] REGISTER ${sessionId}: Cache Storage persist done in ${Math.round(t2 - t1)}ms (total ${Math.round(t2 - t0)}ms)`);
          break;
        }
        case "ZIP_SESSION_UPDATE_ENTRY": {
          const { sessionId, asset } = data;
          if (!sessionId || !asset) {
            respond(false, 'Invalid ZIP_SESSION_UPDATE_ENTRY payload');
            return;
          }

          const normalizedPath = normalizePath(asset.path);
          const normalizedAsset = {
            mime: asset.mime || "text/html",
            buffer: asset.buffer,
          };

          const session = sessionStore.get(sessionId);
          if (session) {
            session.set(normalizedPath, normalizedAsset);
          }

          await persistSessionAsset(sessionId, normalizedPath, normalizedAsset);
          break;
        }
        case "ZIP_SESSION_CLEAR": {
          const { sessionId } = data;
          if (sessionId) {
            sessionStore.delete(sessionId);
            await clearSessionCache(sessionId);
          } else {
            sessionStore.clear();
            const cacheKeys = await caches.keys();
            await Promise.all(
              cacheKeys
                .filter((cacheKey) => cacheKey.startsWith(cacheNamePrefix))
                .map((cacheKey) => caches.delete(cacheKey))
            );
          }
          break;
        }
        default:
          break;
      }

      respond(true);
    } catch (error) {
      console.error('[ZIP Preview SW] Failed to handle message', data.type, error);
      respond(false, error instanceof Error ? error.message : String(error));
    }
  })());
});

self.addEventListener("fetch", (event) => {
  const scopeUrl = new URL(self.registration.scope);
  const requestUrl = new URL(event.request.url);
  if (!requestUrl.pathname.startsWith(scopeUrl.pathname)) {
    return;
  }

  const relativePath = requestUrl.pathname.slice(scopeUrl.pathname.length);
  const parts = relativePath.split("/").filter(Boolean);
  if (parts.length < 2) {
    return;
  }

  const [sessionId, ...assetParts] = parts;
  const assetPath = normalizePath(assetParts.join("/"));
  const session = sessionStore.get(sessionId);
  if (!session) {
    event.respondWith((async () => {
      const cachedResponse = await restoreAssetFromCache(sessionId, requestUrl.toString());
      return cachedResponse || new Response("ZIP session expired", { status: 410 });
    })());
    return;
  }

  const asset = session.get(assetPath);
  if (!asset) {
    event.respondWith((async () => {
      const cachedResponse = await restoreAssetFromCache(sessionId, requestUrl.toString());
      return cachedResponse || new Response("Asset not found", { status: 404 });
    })());
    return;
  }

  const body = asset.buffer.slice(0);
  event.respondWith(
    new Response(body, {
      status: 200,
      headers: {
        "Content-Type": asset.mime || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    })
  );
});
