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
    // Fetch version.json bypassing cache
    const response = await fetch('./version.json', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.ok) {
      const versionInfo = await response.json();
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
  
  // Never cache version.json
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    );
  }
});
