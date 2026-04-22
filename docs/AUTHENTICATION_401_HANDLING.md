# 401 Authentication Expiration Handling

## Overview
Implemented a comprehensive 401 (Unauthorized) error handling system that automatically detects when the backend authorization expires and handles cleanup and user redirection.

## Components Added

### 1. AuthenticationService (`src/services/AuthenticationService.ts`)
A new singleton service that manages logout flows and communicates session expiration events:

**Key Methods:**
- `subscribe(callback: (reason?: string) => void)` - Register listeners for logout events
- `handleUnauthorized(reason?: string)` - Triggered when 401 is detected
- `logout(reason?: string)` - Performs cleanup and redirect:
  - Clears localStorage (authToken, authUser)
  - Calls all registered callbacks
  - Redirects to portfolio login page via clean URL navigation to `/portfolio`
  - Prevents duplicate redirects with `isLoggingOut` flag

### 2. ApiClient Updates (`src/services/ApiClient.ts`)
Modified the `handleResponse()` method to:
- Inject the `AuthenticationService`
- Detect 401 responses from the backend
- Clear the stored token
- Call `authService.handleUnauthorized()` to trigger logout flow
- Throw an error for UI error handling

```typescript
if (response.status === 401) {
  this.token = null;
  this.authService.handleUnauthorized("Your session has expired. Please sign in again.");
  throw new Error("Your session has expired. Please sign in again.");
}
```

### 3. PortfolioService Updates (`src/services/PortfolioService.ts`)
Added support for handling session expiration:
- Injected `AuthenticationService`
- Added `handleSessionExpired()` method that clears service state:
  - Clears currentUser
  - Clears API client token
  - Removes localStorage entries
  - Disables Google auto-select

### 4. Portfolio Page Updates (`src/pages/portfolio/portfolio-page.ts`)
Enhanced the portfolio page to:
- Inject `AuthenticationService`
- Subscribe to logout events in `connectedCallback()`
- Handle session expiration by:
  - Setting `isAuthenticated = false`
  - Clearing `creatives` and `projects`
  - Displaying error message to user
  - Calling `portfolioService.handleSessionExpired()`
  - Requesting UI update to show login screen

```typescript
this.authService.subscribe((reason?: string) => {
  console.log("Session expired:", reason);
  this.isAuthenticated = false;
  this.creatives = [];
  this.projects = [];
  this.errorMessage = reason || "Your session has expired. Please sign in again.";
  this.portfolioService.handleSessionExpired();
  this.requestUpdate();
});
```

## Flow Diagram

```
Backend Returns 401
       ↓
ApiClient.handleResponse() detects 401
       ↓
AuthenticationService.handleUnauthorized() called
       ↓
AuthenticationService.logout() executes:
  - Clear localStorage
  - Call all registered callbacks
  - Redirect to /portfolio
       ↓
PortfolioPage logout callback:
  - Clear auth state
  - Show error message
  - Call portfolioService.handleSessionExpired()
       ↓
User sees login page with error message
User can sign in again
```

## How It Works

1. **API Request Made** - Any API call that requires authentication
2. **401 Received** - Backend returns 401 (Unauthorized)
3. **Automatic Detection** - ApiClient catches the 401 in `handleResponse()`
4. **Token Cleared** - Current token is nullified
5. **Logout Flow Triggered** - AuthenticationService.handleUnauthorized() is called
6. **Storage Cleaned** - localStorage entries are removed
7. **Listeners Notified** - All subscribers are called with the reason
8. **Redirect** - User is redirected to the portfolio login page at `/portfolio`
9. **UI Updated** - Portfolio page shows login screen and error message

## Error Message Display

When a 401 occurs, the user will see:
- Clear error message: "Your session has expired. Please sign in again." (or custom message)
- Login screen with Google Sign In button
- They can immediately re-authenticate

## Testing

To test this flow:

1. Obtain a valid auth token and sign in to the portfolio
2. Stop/restart the backend server (simulates token invalidation)
3. Try to perform an action that makes an API call (load playables, create project, etc.)
4. The app will detect the 401, clear tokens, and redirect to login
5. User will see error message and login screen

## Benefits

✅ **Automatic Detection** - No need for manual token expiration checks
✅ **Clean Logout** - Properly clears all authentication state
✅ **User Feedback** - Clear error messages about session expiration
✅ **Security** - Ensures expired tokens are removed immediately
✅ **Extensible** - Event-based system allows multiple listeners
✅ **Prevents Loops** - Guard against infinite redirect loops
