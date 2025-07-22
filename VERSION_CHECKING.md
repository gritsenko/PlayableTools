# Version Checking & Auto-Update System

This implementation provides automatic version checking and app reload functionality with cache clearing, **fully compatible with PWA (Progressive Web App) installed mode**.

## Features

- **Automatic Version Checking**: Periodically checks for new versions every 5 minutes
- **Manual Version Check**: Button in the sidebar to manually check for updates
- **Update Notification**: Shows a user-friendly notification when updates are available
- **Cache Clearing**: Clears all caches (Browser Cache API, Service Worker, localStorage, sessionStorage) before reload
- **PWA Compatibility**: Full support for PWA installed mode with proper service worker handling
- **Development Support**: Works in both development and production modes

## PWA Mode Support

### Key PWA Features:
- **Service Worker Integration**: Communicates with service workers to bypass caches
- **PWA Detection**: Automatically detects if running in installed PWA mode
- **Cache Exclusion**: `version.json` is excluded from service worker caching
- **Network-Only Strategy**: Version checks always hit the network, never cache
- **Service Worker Updates**: Properly handles service worker updates during reload

### PWA-Specific Behavior:
1. **Version Fetching**: Uses service worker communication when available, falls back to direct fetch
2. **Cache Management**: Sends cache clearing messages to service workers
3. **Service Worker Updates**: Forces service worker updates before reload
4. **URL Resolution**: Properly resolves version.json URL in installed PWA context

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
