export interface VersionInfo {
  version: string;
  buildTime: string;
  hash: string;
}

export class VersionService {
  private currentVersion: VersionInfo | null = null;
  private checkInterval: number | null = null;
  private listeners: Array<(hasUpdate: boolean) => void> = [];
  private checkIntervalMs: number;
  private versionEndpoint: string;
  private isPWA: boolean = false;

  constructor(
    checkIntervalMs: number = 60 * 60 * 1000, // 1 hour
    versionEndpoint: string = './version.json'
  ) {
    this.checkIntervalMs = checkIntervalMs;
    this.versionEndpoint = versionEndpoint;
    this.detectPWAMode();
  }

  /**
   * Detect if app is running in PWA mode
   */
  private detectPWAMode(): void {
    this.isPWA = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      // @ts-ignore - navigator.standalone is iOS specific
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    if (this.isPWA) {
      console.log('VersionService: Running in PWA mode');
    }
  }

  /**
   * Initialize version checking
   */
  async initialize(): Promise<void> {
    try {
      this.currentVersion = await this.fetchVersionInfo();
      
      // Log version information prominently
      console.log(`🚀 PlayableTools v${this.currentVersion.version}`);
      console.log(`📦 Build: ${this.currentVersion.buildTime}`);
      console.log(`🔖 Hash: ${this.currentVersion.hash}`);
      if (this.isPWA) {
        console.log('📱 Running in PWA mode');
      }
      
      this.startPeriodicCheck();
    } catch (error) {
      console.warn('Failed to initialize version service:', error);
      // Set a fallback version so it doesn't show "unknown"
      this.currentVersion = {
        version: '1.0.4', // Match current package.json version
        buildTime: new Date().toISOString(),
        hash: 'fallback'
      };
      
      // Log fallback version
      console.log(`🚀 PlayableTools v${this.currentVersion.version} (fallback)`);
      console.log('⚠️ Could not fetch version from server, using fallback');
    }
  }

  /**
   * Start periodic version checking
   */
  private startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(async () => {
      await this.checkForUpdates();
    }, this.checkIntervalMs);
  }

  /**
   * Stop periodic version checking
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Manually check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      const latestVersion = await this.fetchVersionInfo();
      
      if (this.currentVersion && this.hasNewVersion(this.currentVersion, latestVersion)) {
        console.log('🆕 Update available!');
        console.log(`📍 Current: v${this.currentVersion.version} (${this.currentVersion.hash})`);
        console.log(`🎯 Latest: v${latestVersion.version} (${latestVersion.hash})`);
        
        this.notifyListeners(true);
        return true;
      } else {
        console.log('✅ App is up to date');
      }
      
      return false;
    } catch (error) {
      console.warn('Failed to check for updates:', error);
      return false;
    }
  }

  /**
   * Test cache busting - useful for debugging
   */
  async testCacheBusting(): Promise<void> {
    console.log('🧪 Testing cache busting...');
    
    try {
      // Make multiple requests to see if we get cached responses
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(this.fetchVersionInfo());
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }
      
      const results = await Promise.all(requests);
      
      console.log('🧪 Cache busting test results:');
      results.forEach((result, index) => {
        console.log(`Request ${index + 1}:`, result);
      });
      
      // Check if all requests returned the same build time (good - means no caching)
      const buildTimes = results.map(r => r.buildTime);
      const uniqueBuildTimes = new Set(buildTimes);
      
      if (uniqueBuildTimes.size === 1) {
        console.log('✅ Cache busting working correctly - all requests returned same data');
      } else {
        console.log('⚠️ Inconsistent responses - possible caching issues');
      }
      
    } catch (error) {
      console.error('🧪 Cache busting test failed:', error);
    }
  }

  /**
   * Fetch version information from server
   */
  private async fetchVersionInfo(): Promise<VersionInfo> {
    // Try service worker first for PWA support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const versionInfo = await this.fetchVersionViaServiceWorker();
        if (versionInfo) {
          return versionInfo;
        }
      } catch (error) {
        console.warn('Failed to fetch version via service worker, falling back to direct fetch:', error);
      }
    }

    // Try multiple fetch strategies
    const strategies = [
      () => this.fetchVersionDirect(),
      () => this.fetchVersionWithDifferentMethod(),
      () => this.fetchVersionFallback()
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`📡 Trying fetch strategy ${i + 1}/${strategies.length}`);
        const result = await strategies[i]();
        console.log(`✅ Strategy ${i + 1} succeeded`);
        return result;
      } catch (error) {
        console.warn(`❌ Strategy ${i + 1} failed:`, error);
        if (i === strategies.length - 1) {
          throw error; // Throw the last error if all strategies fail
        }
      }
    }

    throw new Error('All fetch strategies failed');
  }

  /**
   * Fetch version info via service worker (PWA mode)
   */
  private async fetchVersionViaServiceWorker(): Promise<VersionInfo | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No service worker controller'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        const { type, data, error } = event.data;
        
        if (type === 'VERSION_INFO') {
          resolve(data);
        } else if (type === 'VERSION_ERROR') {
          reject(new Error(error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CHECK_VERSION' },
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Service worker version check timeout'));
      }, 5000);
    });
  }

  /**
   * Direct fetch version info (fallback)
   */
  private async fetchVersionDirect(): Promise<VersionInfo> {
    // Build the proper URL for production
    let versionUrl = this.versionEndpoint;
    
    // If running on https://gritsenko.biz/PlayableTools/, ensure proper path
    if (window.location.origin === 'https://gritsenko.biz' && 
        window.location.pathname.startsWith('/PlayableTools/')) {
      versionUrl = '/PlayableTools/version.json';
    }
    
    // Add aggressive cache busting with timestamp and random number
    const cacheBuster = `?v=${Date.now()}&cb=${Math.random().toString(36).substring(2)}&nc=${performance.now()}`;
    const finalUrl = versionUrl + cacheBuster;
    
    console.log(`📡 Fetching version from: ${finalUrl}`);
    
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
        // Remove conditional headers that cause 304 responses
      },
      cache: 'no-store',
      // Force a fresh request
      mode: 'cors',
      credentials: 'same-origin'
    });

    // Handle both 200 and 304 responses as success
    if (!response.ok && response.status !== 304) {
      throw new Error(`Failed to fetch version info from ${finalUrl}: ${response.status} ${response.statusText}`);
    }

    // For 304 responses, we might not get a body, so handle gracefully
    let data;
    try {
      data = await response.json();
      console.log('📡 Version info fetched from server:', data);
    } catch (jsonError) {
      // If we can't parse JSON (possibly due to 304), create fallback data
      console.warn('📡 Could not parse JSON response, using fallback version data');
      data = {
        version: '1.0.4', // Use current package.json version
        buildTime: new Date().toISOString(),
        hash: 'fallback'
      };
    }
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers cache-control:', response.headers.get('cache-control'));
    return data;
  }

  /**
   * Alternative fetch method using XMLHttpRequest
   */
  private async fetchVersionWithDifferentMethod(): Promise<VersionInfo> {
    return new Promise((resolve, reject) => {
      let versionUrl = this.versionEndpoint;
      
      if (window.location.origin === 'https://gritsenko.biz' && 
          window.location.pathname.startsWith('/PlayableTools/')) {
        versionUrl = '/PlayableTools/version.json';
      }
      
      const cacheBuster = `?xhr=${Date.now()}&rand=${Math.random()}`;
      const finalUrl = versionUrl + cacheBuster;
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', finalUrl, true);
      xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.setRequestHeader('Expires', '0');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('📡 XHR version fetch successful:', data);
              resolve(data);
            } catch (error) {
              reject(new Error('Failed to parse JSON from XHR response'));
            }
          } else {
            reject(new Error(`XHR request failed: ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('XHR request error'));
      xhr.send();
    });
  }

  /**
   * Final fallback - return current package version
   */
  private async fetchVersionFallback(): Promise<VersionInfo> {
    console.log('📡 Using final fallback version');
    return {
      version: '1.0.4',
      buildTime: new Date().toISOString(),
      hash: 'final-fallback'
    };
  }

  /**
   * Check if there's a new version available
   */
  private hasNewVersion(current: VersionInfo, latest: VersionInfo): boolean {
    // Compare by hash first (most reliable)
    if (current.hash !== latest.hash) {
      return true;
    }

    // Fallback to build time comparison
    if (current.buildTime !== latest.buildTime) {
      return true;
    }

    // Fallback to version string comparison
    return current.version !== latest.version;
  }

  /**
   * Subscribe to update notifications
   */
  onUpdateAvailable(callback: (hasUpdate: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners about update status
   */
  private notifyListeners(hasUpdate: boolean): void {
    this.listeners.forEach(callback => {
      try {
        callback(hasUpdate);
      } catch (error) {
        console.error('Error in update listener:', error);
      }
    });
  }

  /**
   * Reload the application with cache clearing
   */
  async reloadWithCacheClear(): Promise<void> {
    try {
      // Clear all caches
      await this.clearAllCaches();
      
      // Handle PWA service worker updates
      await this.updateServiceWorker();
      
      // Force reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear caches:', error);
      // Still try to reload even if cache clearing fails
      window.location.reload();
    }
  }

  /**
   * Update service worker in PWA mode
   */
  private async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          // Update the service worker
          await registration.update();
          
          // If there's a waiting service worker, skip waiting
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (error) {
        console.warn('Failed to update service worker:', error);
      }
    }
  }

  /**
   * Clear all available caches
   */
  private async clearAllCaches(): Promise<void> {
    const promises: Promise<any>[] = [];

    // Clear Cache API if available
    if ('caches' in window) {
      promises.push(
        caches.keys().then(cacheNames => 
          Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Clearing cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          )
        )
      );
    }

    // Send message to service worker to clear its caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE'
        });
      } catch (error) {
        console.warn('Failed to send clear cache message to service worker:', error);
      }
    }

    // Clear localStorage and sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }

    await Promise.all(promises);
  }

  /**
   * Get current version info
   */
  getCurrentVersion(): VersionInfo | null {
    return this.currentVersion;
  }

  /**
   * Check if running in PWA mode
   */
  isPWAMode(): boolean {
    return this.isPWA;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPeriodicCheck();
    this.listeners = [];
  }
}
