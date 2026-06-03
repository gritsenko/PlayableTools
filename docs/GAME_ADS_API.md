# GameAds — JS SDK for embedded HTML5 games

`window.GameAds` is the **single API** game code uses to show ads. One file —
`platform.js` — drop it into your game and call `GameAds.*`. No native bridge,
no Yandex SDK calls, no platform detection in your code.

Three environments work the same way:

| Environment | Ads source | What the dev does |
|---|---|---|
| Android APK shell (this repo) | AppLovin MAX via native bridge | Nothing — `platform.js` detects it. |
| Yandex Games / Yandex validator | Yandex Games SDK | Nothing — `platform.js` loads it lazily. |
| Browser (localhost / 127.0.0.1) | Built-in simulator | Nothing. Tweak `window.__adsSim` from devtools to drive every branch. |

The raw native interface (`window.AdsBridge`) and the simulator's adapter are
intentionally **not** exposed on `window`. The contract is `GameAds`, period.

---

## Integration

```html
<script src="platform.js"></script>
<!-- your game -->
```

`platform.js` is a self-contained IIFE. It defines `window.GameAds`
synchronously and starts loading the Yandex SDK in the background (only when no
native bridge / simulator is in play). Order matters only if you query
`GameAds.hasProvider()` during page load on Yandex — wait for
`GameAds.whenYandexReady()` if you need synchronous certainty there.

---

## Quick start

```js
// Rewarded — give the user a reward (extra life, hint, coins) for a full watch.
GameAds.showRewarded({
    onOpen:   () => pauseGame(),
    onReward: () => grantReward(),           // only fires if the user earned it
    onError:  (e) => console.warn(e.status), // not_ready | disabled | error | busy | unavailable
    onClose:  (wasShown) => resumeGame(),    // ALWAYS fires last
});

// Interstitial — full-screen ad at a natural break (level end, restart).
GameAds.showInterstitial({
    onOpen:  () => pauseGame(),
    onError: (e) => console.warn(e.status),
    onClose: (wasShown) => resumeGame(),
});

// Banner — strip at the bottom. On Android shell, it shows by default.
GameAds.showBanner();
GameAds.hideBanner();
GameAds.isBannerVisible();   // boolean
```

### Guard with `hasProvider()`

```js
if (GameAds.hasProvider()) {
    showWatchAdButton();
} else {
    skipDirectlyToGameOver();
}
```

Returns `true` if a native bridge or Yandex SDK is present. Always `false` on
plain desktop browser (unless the localhost simulator is active).

---

## API reference

### `GameAds.platform: 'native' | 'web'`
Set once at script load. `'native'` means a native bridge or localhost
simulator was bound. `'web'` means we're falling back to Yandex SDK (or
nothing, if Yandex isn't reachable).

### `GameAds.hasProvider(): boolean`
True if any provider can actually show ads right now.

### `GameAds.whenYandexReady(): Promise<boolean>`
Resolves with `true` once Yandex SDK has loaded, `false` if we skipped it
(native shell / localhost) or it failed to load. Useful if you need to call
`window.YandexSDK.*` directly (leaderboards, game lifecycle) — but for ads you
don't need this.

---

### `GameAds.showRewarded(callbacks)`

Show a rewarded video. Reward only fires on a full watch.

| Callback | Signature | When |
|---|---|---|
| `onOpen`   | `() => void`         | Best-effort, before the native call. Pause your game here. |
| `onReward` | `() => void`         | Only when the provider confirms reward. Fires **before** `onClose`. |
| `onError`  | `(result) => void`   | On any non-success terminal status. `result = { status }`. |
| `onClose`  | `(wasShown) => void` | **Always** fires last. `wasShown = false` if no ad displayed. |

**Outcome → callback order**

| `status`       | Sequence |
|---|---|
| `rewarded`     | `onOpen` → `onReward` → `onClose(true)` |
| `dismissed`    | `onOpen` → `onClose(true)` (user watched but bailed before reward) |
| `not_ready`    | `onOpen` → `onError({status:'not_ready'})` → `onClose(false)` |
| `error`        | `onOpen` → `onError({status:'error'})` → `onClose(false)` |
| `disabled`     | `onOpen` → `onError({status:'disabled'})` → `onClose(false)` |
| `busy`         | `onOpen` → `onError({status:'busy'})` → `onClose(false)` |
| `unavailable`  | `onError({status:'unavailable'})` → `onClose(false)` (no provider at all) |

### `GameAds.showInterstitial(callbacks)`

Show a full-screen ad. **No `onReward`** — `onClose` without a preceding
`onError` means the ad displayed successfully.

| `status`       | Sequence |
|---|---|
| `dismissed`    | `onOpen` → `onClose(true)` — success path |
| `not_ready`    | `onOpen` → `onError({status:'not_ready'})` → `onClose(false)` |
| `error`        | `onOpen` → `onError({status:'error'})` → `onClose(false)` |
| `disabled`     | `onOpen` → `onError({status:'disabled'})` → `onClose(false)` |
| `busy`         | `onOpen` → `onError({status:'busy'})` → `onClose(false)` |
| `unavailable`  | `onError({status:'unavailable'})` → `onClose(false)` |

### `GameAds.isRewardedReady(): boolean`
True if a rewarded is preloaded and a show would start immediately.

### `GameAds.isInterstitialReady(): boolean`
True if an interstitial is preloaded.

### `GameAds.showBanner(): boolean`
Toggle the banner slot on. Returns `true` if forwarded to provider, `false` if
unavailable. No callbacks.

### `GameAds.hideBanner(): boolean`
Toggle the banner slot off.

### `GameAds.isBannerVisible(): boolean`
True if the banner is currently displayed.

---

## Status code reference

Every error/close result carries a `status`. Full set:

| `status`      | Meaning | What the game should do |
|---|---|---|
| `rewarded`    | (rewarded only) Reward earned. | Grant reward in `onReward`. |
| `dismissed`   | Rewarded: user bailed before reward. Interstitial: success. | Rewarded: do NOT grant. Interstitial: resume. |
| `not_ready`   | No ad was preloaded in time. | Don't punish — re-offer or skip silently. |
| `error`       | Provider error during display/load. | Resume. Treat as a no-op. |
| `disabled`    | Ads disabled in this build / for this user. | Skip the offer entirely. |
| `busy`        | Another ad is in flight. | Wait for the in-flight `onClose`. |
| `unavailable` | No provider at all (e.g. plain web build). | Use fallback UX or skip. |

---

## Mocking for the web validator / local dev

`platform.js` self-installs a simulator when the page runs on `localhost` or
`127.0.0.1` AND there's no native bridge. You don't add anything to your code —
just open the page and use devtools:

```js
// Force the next rewarded to fail to load:
__adsSim.nextRewardedStatus = 'not_ready';
GameAds.showRewarded({
    onError: (e) => console.log('err', e),
    onClose: (wasShown) => console.log('close', wasShown),
});

// Simulate the user dismissing before the reward checkpoint:
__adsSim.nextRewardedStatus = 'dismissed';

// Make all ads disabled (e.g. simulate a no-ads build):
__adsSim.adsEnabled = false;

// Pretend there's no provider at all (desktop browser):
__adsSim.available = false;

// Speed up / slow down latency:
__adsSim.showLatencyMs = 200;     // snappy
__adsSim.showLatencyMs = 5000;    // realistic Yandex video

// Banner state:
GameAds.hideBanner();   GameAds.isBannerVisible(); // false
GameAds.showBanner();   GameAds.isBannerVisible(); // true (if adsEnabled)
```

### `window.__adsSim` shape

```js
{
    available:               true,   // false = no provider (returns 'unavailable')
    adsEnabled:              true,   // false = every show returns 'disabled'
    rewardedReady:           true,   // value returned by GameAds.isRewardedReady()
    interstitialReady:       true,   // value returned by GameAds.isInterstitialReady()
    bannerVisible:           true,
    nextRewardedStatus:     'rewarded',    // rewarded | dismissed | error | not_ready | disabled | busy
    nextInterstitialStatus: 'dismissed',   // dismissed | error | not_ready | disabled | busy
    showLatencyMs:           1200,
}
```

### Overriding `GameAds` entirely

If your test environment needs something the simulator can't do (e.g. driving
ads from another harness), replace the whole facade **before** your game code
runs:

```html
<script src="platform.js"></script>
<script>
    window.GameAds = {
        platform: 'web',
        hasProvider: () => true,
        whenYandexReady: () => Promise.resolve(false),
        showRewarded: (cb) => { cb.onOpen?.(); cb.onReward?.(); cb.onClose?.(true); },
        showInterstitial: (cb) => { cb.onOpen?.(); cb.onClose?.(true); },
        isRewardedReady: () => true,
        isInterstitialReady: () => true,
        showBanner: () => true,
        hideBanner: () => true,
        isBannerVisible: () => true,
    };
</script>
<script src="your-game.js"></script>
```

---

## Guarantees

- **`onClose` fires exactly once and last** for every `show*` call. Even when
  there's no provider, even on errors. Game code can safely couple "resume
  game" to `onClose`.
- All callbacks run on the JS event loop's main task queue (no
  microtask weirdness across providers).
- Concurrent `show*` calls during an in-flight ad return `busy` — there is no
  internal queue.
- The simulator runs only on `localhost`/`127.0.0.1`. Production / native /
  Yandex contexts never see it.

---

## Implementation notes (APK shell maintainers)

This section is for whoever builds the APK shell — game developers don't need it.

`platform.js` is layered as a single IIFE:

1. **Native adapter** — wraps `window.AdsBridge` (the
   `@JavascriptInterface` from `AdsBridge.kt`). Async results come back via
   `window.__adsCallback(callbackId, { status })`, which Kotlin calls via
   `evaluateJavascript`.
2. **Localhost simulator** — runs when no native bridge AND
   `window.location.hostname ∈ {localhost, 127.0.0.1}`.
3. **Yandex SDK** — lazy-loaded only when neither (1) nor (2) bound.

To embed a new game in this APK shell, the contract on the APK side is:

- Mount `AdsBridge` via `addJavascriptInterface(AdsBridge(webView), "AdsBridge")`.
- Implement these `@JavascriptInterface` methods (see `AdsBridge.kt`):
  - `showRewarded(callbackId: String)`
  - `showInterstitial(callbackId: String)`
  - `isRewardedReady(): Boolean`
  - `isInterstitialReady(): Boolean`
  - `showBanner()`, `hideBanner()`, `isBannerVisible(): Boolean`
- Resolve each callbackId by calling
  `window.__adsCallback(callbackId, { status: '...' })` on the JS side.
- Status vocabulary: `rewarded | dismissed | error | not_ready | disabled | busy`
  (`unavailable` is synthesized by JS when no bridge is bound).

`platform.js` itself never has to change between games — copy it as-is.
