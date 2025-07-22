// Service Worker message handler for version checking
// This file should be included in your service worker

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      // Skip waiting and become the active service worker
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      // Clear all caches
      handleClearCache();
      break;
      
    case 'CHECK_VERSION':
      // Force check version (bypass cache)
      handleVersionCheck(event);
      break;
  }
});

async function handleClearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log(`Service Worker: Clearing cache ${cacheName}`);
        return caches.delete(cacheName);
      })
    );
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear caches:', error);
  }
}

async function handleVersionCheck(event) {
  try {
    // Add cache busting parameters
    const cacheBuster = `?t=${Date.now()}&r=${Math.random().toString(36).substring(2)}`;
    const versionUrl = `./version.json${cacheBuster}`;
    
    console.log(`SW: Fetching version from: ${versionUrl}`);
    
    // Fetch version.json bypassing cache
    const response = await fetch(versionUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0',
        'If-None-Match': '*'
      }
    });
    
    if (response.ok) {
      const versionInfo = await response.json();
      console.log('SW: Version info fetched:', versionInfo);
      console.log('SW: Response cache headers:', response.headers.get('cache-control'));
      
      // Send version info back to main thread
      event.ports[0]?.postMessage({
        type: 'VERSION_INFO',
        data: versionInfo
      });
    }
  } catch (error) {
    console.error('Service Worker: Failed to fetch version info:', error);
    event.ports[0]?.postMessage({
      type: 'VERSION_ERROR',
      error: error.message
    });
  }
}

// Handle service worker activation
self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle fetch events to ensure version.json is never cached
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache version.json - match any request containing version.json
  if (url.pathname.includes('/version.json') || url.pathname.endsWith('/version.json')) {
    console.log('SW: Intercepting version.json request, bypassing cache');
    
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-Modified-Since': '0',
          'If-None-Match': '*'
        }
      }).then(response => {
        // Clone the response and add no-cache headers
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        return newResponse;
      })
    );
  }
});
