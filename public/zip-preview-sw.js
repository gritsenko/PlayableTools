const sessionStore = new Map();

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

  switch (data.type) {
    case "ZIP_SESSION_REGISTER": {
      const { sessionId, assets } = data;
      if (!sessionId || !Array.isArray(assets)) {
        return;
      }
      const assetMap = new Map();
      for (const asset of assets) {
        if (!asset || !asset.path || !asset.buffer) continue;
        assetMap.set(normalizePath(asset.path), {
          mime: asset.mime || "application/octet-stream",
          buffer: asset.buffer,
        });
      }
      sessionStore.set(sessionId, assetMap);
      break;
    }
    case "ZIP_SESSION_UPDATE_ENTRY": {
      const { sessionId, asset } = data;
      if (!sessionId || !asset) return;
      const session = sessionStore.get(sessionId);
      if (!session) return;
      session.set(normalizePath(asset.path), {
        mime: asset.mime || "text/html",
        buffer: asset.buffer,
      });
      break;
    }
    case "ZIP_SESSION_CLEAR": {
      const { sessionId } = data;
      if (sessionId) {
        sessionStore.delete(sessionId);
      } else {
        sessionStore.clear();
      }
      break;
    }
    default:
      break;
  }
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
    event.respondWith(new Response("ZIP session expired", { status: 410 }));
    return;
  }

  const asset = session.get(assetPath);
  if (!asset) {
    event.respondWith(new Response("Asset not found", { status: 404 }));
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
