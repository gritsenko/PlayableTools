# Unifying Playable Ads: The CTA SDK Bridge

> **Note:** The CTA SDK is used by the [Publish Tool](/#publish), enabling seamless deployment and integration of HTML5 playables across multiple ad networks.

## 1. Game Events and CTA Calls

When the playable is finished, the user should click the Call to Action button (such as Install, Play, Next, etc.). When that button is clicked, you should call the following code:

  ```typescript
  document["CTA"]?.onClick?.(); // Triggers the app store
  ```

This method acts as a proxy for the specific APIs required by different ad platforms. It will only call the necessary API to direct the user to the app store.

### Optional methods

Those methods should be used for playable ads publishing to Mintegral ads network. See the [docs](https://www.playturbo.com/review/doc)

  ```typescript
  document["CTA"]?.gameEnd?.(); // Signals the end of gameplay

  document["CTA"]?.gameReady?.(); // Signals the ad is loaded and interactive
  ```

## 2. Platform Detection

Each CTA script exposes the current ad platform via `document.CTA.platform`. Use this property to adjust playable behaviour depending on where the ad is running:

  ```typescript
  const platform = (document as any).CTA?.platform as string | undefined;

  if (platform === "Facebook") {
    // Facebook-specific logic
  }
  ```

### Available platform values

| `platform` | `sdk` | Ad Network / Platform |
|---|---|---|
| `"Facebook"` | `"Facebook"` | Meta (Facebook & Instagram), including ZIP format |
| `"Moloco"` | `"Moloco"` | Moloco |
| `"Mintegral"` | `"Mintegral"` | Mintegral / Playturbo |
| `"IronSource"` | `"mraid3"` | IronSource |
| `"Unity"` | `"mraid3"` | Unity Ads |
| `"AdColony"` | `"mraid2"` | AdColony |
| `"Applovin"` | `"mraid2"` | Applovin MAX |
| `"Vungle"` | `"mraid2"` | Vungle / Liftoff Monetize |
| `"mraid2"` | `"mraid2"` | Generic MRAID 2 networks (Liftoff, Chartboost) |
| `"TikTok"` | `"TikTok"` | TikTok Ads |
| `"Google"` | `"Google"` | Google Display & Video 360 / HTML5 |
| `"dv360"` | `"dv360"` | DV360 (Google Studio) |

Use `sdk` when you need to branch on the underlying technology rather than the specific network:

  ```typescript
  const sdk = (document as any).CTA?.sdk as string | undefined;

  if (sdk === "mraid2" || sdk === "mraid3") {
    // MRAID environment — audio/viewability callbacks are available
  }
  ```

> **Note:** Both `platform` and `sdk` are `undefined` when the playable is running outside of an ad network (e.g., during local development).

## 3. MRAID Mute/Unmute Handler

For MRAID-compatible ad networks, you can integrate custom mute and unmute handlers. This allows the playable to respond to user audio preferences and synchronize your app's audio state:

  ```typescript
  const cta = (document as any).CTA as any; // Assumes CTA scripts are already injected and document.CTA exists

  let isStarted = false;

  function startGame() {
    // Check if already initialized
    if (isStarted) return;
    isStarted = true;

    const app = new App();
    // Set custom mute and unmute functions
    if (cta) {
      cta["mute"] = () => app.mute();
      cta["unmute"] = () => app.unmute();
    }
    app.init();
  }

  startGame();
  ```

The `mute()` and `unmute()` methods should be implemented in your `App` class to handle audio state changes accordingly.

## 4. Playable Analytics

> **Note:** Analytics are fully supported on **Applovin MAX only**. On all other platforms the `analytics` object is still present but its `trackEvent` method is a no-op, so calls are safe everywhere and no extra guard is needed.

Each CTA script exposes `document.CTA.analytics.trackEvent(eventName)` to report in-playable events to the ad network's analytics backend. On Applovin it delegates to `window.ALPlayableAnalytics.trackEvent()` which is injected automatically by the Applovin SDK.

### Usage

  ```typescript
  const cta = (document as any).CTA;

  // Safe to call on every platform — no-op on non-Applovin networks
  cta?.analytics?.trackEvent('DISPLAYED');
  ```

`CTA_CLICKED` is fired automatically inside `onClick` on Applovin — you do not need to call it manually.

### Available events

| Event | When to call |
|---|---|
| `LOADING` | In-playable loading begins (e.g. loading screen shows). Optional. |
| `LOADED` | In-playable loading completes. Required if you sent `LOADING`. |
| `DISPLAYED` | Ad is visible and interactive. **Required.** |
| `CHALLENGE_STARTED` | User meaningfully interacts / presses "start". Optional. |
| `CHALLENGE_PASS_25` | User reaches ≈25 % progress. Requires `CHALLENGE_STARTED`. |
| `CHALLENGE_PASS_50` | User reaches ≈50 % progress. Requires `CHALLENGE_STARTED`. |
| `CHALLENGE_PASS_75` | User reaches ≈75 % progress. Requires `CHALLENGE_STARTED`. |
| `CHALLENGE_FAILED` | User reaches a failure state. Requires `CHALLENGE_STARTED`. |
| `CHALLENGE_RETRY` | User retries after failing. Requires `CHALLENGE_FAILED`. |
| `CHALLENGE_SOLVED` | User successfully completes the challenge. Requires `CHALLENGE_STARTED`. |
| `ENDCARD_SHOWN` | End-card / summary screen inside the playable is shown. Optional. |
| `CTA_CLICKED` | User taps the CTA button. Auto-fired by `onClick` on Applovin. |

> Only predefined events are tracked. Custom event names are ignored by the Applovin SDK.

See the full [Applovin HTML analytics integration docs](https://support.axon.ai/en/growth/promoting-your-apps/creatives/playable-analytics-integration) for additional nuances.

