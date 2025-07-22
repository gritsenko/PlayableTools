# Version Checking & Auto-Update System

This implementation provides automatic version checking and app reload functionality with cache clearing, **fully compatible with PWA (Progressive Web App) installed mode**.

## Features

- **Automatic Version Checking**: Checks for new versions on app start and every hour
- **Full-Width Update Banner**: Shows a prominent top banner when updates are available
- **Cache Clearing**: Clears all caches (Browser Cache API, Service Worker, localStorage, sessionStorage) before reload
- **PWA Compatibility**: Full support for PWA installed mode with proper service worker handling
- **Simple UX**: No manual buttons - automatic checking with clear reload action

## How It Works

1. **App Start**: When the app loads, `VersionService` fetches current version from `version.json`
2. **Hourly Checks**: Every hour, the service checks for updates by fetching the latest `version.json`
3. **Version Comparison**: Compares versions using content hash, build timestamp, and version string
4. **Update Banner**: If an update is detected, shows a full-width blue banner at the top
5. **One-Click Reload**: User clicks "Reload App" button to get the latest version with cache clearing

## Cache Prevention Measures

### Client-Side Cache Busting:
- **Timestamp Parameters**: Adds `?t=timestamp&r=random` to version.json requests
- **Aggressive Headers**: Multiple no-cache headers in fetch requests
- **Service Worker Bypass**: Service worker intercepts and bypasses cache for version.json
- **Browser Cache API**: Excluded from all cache storage mechanisms

### Server-Side Configuration:
For optimal cache prevention, configure your server:

**Apache (.htaccess):**
```apache
<Files "version.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>
```

**Nginx:**
```nginx
location ~* /version\.json$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}
```

## Common Issues & Solutions

### 304 Not Modified Responses:
**Problem**: Server returns 304 status causing fetch to fail
**Solution**: 
- Handle 304 responses as successful (they indicate content hasn't changed)
- Use multiple fetch strategies (fetch API, XMLHttpRequest, fallback)
- Enhanced cache-busting with multiple parameters

### Cache Prevention Measures:
- **Multiple URL Parameters**: `?v=timestamp&cb=random&nc=performance`
- **Multiple Fetch Methods**: fetch API → XMLHttpRequest → fallback
- **Status Code Handling**: Treats both 200 and 304 as success
- **Graceful JSON Parsing**: Handles cases where 304 returns no body

### Debugging Commands:
```javascript
// Test version fetching in console
await window.versionService?.testCacheBusting();

// Manual version check
await window.versionService?.checkForUpdates();
```

## Components

### 1. VersionService (`src/services/VersionService.ts`)
- Core service that handles version checking logic
- Fetches version information from `/version.json`
- Compares versions by hash, build time, and version string
- Manages update notifications and cache clearing

### 2. UpdateNotification (`src/fw/update-notification.ts`)
- User-friendly notification component
- Appears when updates are detected
- Provides "Reload" and "Later" options
- Styled as a floating notification in the top-right corner

### 3. VersionChecker (`src/fw/version-checker.ts`)
- Manual version check component in the sidebar
- Shows current version and last check time
- Provides manual check and force reload buttons
- Useful for development and debugging

### 4. Vite Version Plugin (`vite-plugin-version.ts`)
- Generates `version.json` file during build
- Creates unique hash based on bundle content
- Supports both development and production modes
- Updates version file on changes in development

## How It Works

1. **Initialization**: When the app starts, `VersionService` is initialized and fetches the current version info
2. **Periodic Checks**: Every 5 minutes, the service checks for updates by fetching the latest `version.json`
3. **Version Comparison**: Compares the current and latest versions using:
   - Content hash (primary)
   - Build timestamp (secondary)
   - Version string (fallback)
4. **Notification**: If an update is detected, shows the update notification
5. **Reload Process**: When user chooses to reload:
   - Clears all browser caches
   - Unregisters service workers
   - Clears localStorage and sessionStorage
   - Forces a hard reload

## Usage

### For Users
- When an update notification appears, click "Reload" to get the latest version
- Use the manual check button in the sidebar to check for updates immediately
- The "Later" option dismisses the notification but keeps checking in the background

### For Developers
- The version checker in the sidebar shows the current version and allows manual testing
- Use the force reload button (⟳) to test cache clearing functionality
- Version information is automatically generated during build process

## Configuration

### VersionService Options
```typescript
new VersionService(
  checkIntervalMs: number = 5 * 60 * 1000, // Check interval (default: 5 minutes)
  versionEndpoint: string = './version.json' // Version endpoint URL
)
```

### Version File Format
```json
{
  "version": "1.0.0",
  "buildTime": "2025-07-22T12:00:00.000Z",
  "hash": "abc12345"
}
```

## Files Modified/Created

### New Files:
- `src/services/VersionService.ts` - Version checking service
- `src/fw/update-notification.ts` - Update notification component
- `src/fw/version-checker.ts` - Manual version checker component
- `vite-plugin-version.ts` - Vite plugin for version file generation
- `public/version.json` - Version information file

### Modified Files:
- `src/app-root.ts` - Integrated version service and notification
- `src/Layout/main-layout.ts` - Added version checker to sidebar
- `src/fw/index.ts` - Exported new components
- `vite.config.ts` - Added version plugin with PWA cache exclusions
- `package.json` - Version used by the plugin

## PWA Installation & Testing

### Testing PWA Mode:
1. Build and serve the app: `npm run build && npm run preview`
2. Open Chrome DevTools → Application → Manifest
3. Click "Install" to install the PWA
4. Test version checking in the installed PWA

### PWA Cache Behavior:
- `version.json` is excluded from service worker caching
- Version checks use NetworkOnly strategy
- Manual cache clearing affects both browser and service worker caches
- Service worker updates are handled properly during app updates

## Troubleshooting PWA Issues

### Common PWA Problems:
1. **Cached Version File**: Ensure `version.json` is not cached by checking Network tab
2. **Service Worker Updates**: Check Application → Service Workers for update status
3. **Cache Persistence**: Some caches may persist - use force reload (⟳) button
4. **URL Resolution**: PWA apps may have different base URLs - handled automatically

### Debug Information:
- Version checker shows "(PWA)" indicator when running in installed mode
- Console logs indicate PWA detection and service worker communication
- Network tab shows version.json requests with proper cache headers

## Testing

1. Start the development server: `npm run dev`
2. Check the sidebar for the version checker component
3. Use the manual check button to test functionality
4. Modify the `public/version.json` file to simulate a new version
5. Test the update notification and reload functionality

## Production Deployment

1. Build the app: `npm run build`
2. The version plugin automatically generates `version.json` with current build information
3. Deploy the built files to your server
4. The app will automatically check for updates when deployed

## Browser Compatibility

- Supports modern browsers with Cache API and Service Worker support
- Falls back gracefully for older browsers
- Uses standard browser APIs for maximum compatibility
