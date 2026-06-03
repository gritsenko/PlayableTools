/* AdsBridge shim for preview/testing the custom APK wrapper (GameAds / platform.js).

   The game ships its own platform.js, which exposes window.GameAds and, on a real
   device, talks to the native @JavascriptInterface window.AdsBridge. In the preview
   iframe platform.js's built-in localhost simulator is disabled (it bails when
   embedded), so instead we install a MOCK window.AdsBridge here. platform.js detects
   it at load and routes every GameAds.* call through it — exactly like on a device.

   Contract platform.js expects from window.AdsBridge (see GAME_ADS_API.md, "Implementation notes"):
     - showRewarded(callbackId)        // async; resolve via window.__adsCallback
     - showInterstitial(callbackId)    // async; resolve via window.__adsCallback
     - isRewardedReady(): boolean
     - isInterstitialReady(): boolean
     - showBanner(), hideBanner(), isBannerVisible(): boolean
   Async results are delivered by calling window.__adsCallback(callbackId, { status })
   — that function is defined by platform.js's native adapter, we just invoke it.
   Status vocabulary: rewarded | dismissed | error | not_ready | disabled | busy
   ('unavailable' is synthesized by platform.js itself when no bridge is bound — so
    to simulate "no provider" we simply do NOT install the bridge; see below.)

   IMPORTANT: this script must run BEFORE the game's platform.js, because platform.js
   captures window.AdsBridge once at load. The 'ads-manager' preset injects it at
   'afterHeadStart' for that reason.

   The VISUAL ad stub (3s timer + close button) is rendered by the PlayableTools host
   ON TOP of the simulator via postMessage, NOT inside the game's document. The bridge
   only drives the contract and asks the host to show the stub. The postMessage
   protocol (ads-manager-show / ads-manager-result / ads-manager-banner / sdk-event)
   is unchanged, so the host overlay and SDK Event Log keep working as-is.

   window.__adsSim lets you drive non-happy paths (error/not_ready/disabled/busy) and
   tune the ad duration from devtools.
*/
(function () {
  if (window.AdsBridge && window.AdsBridge.__previewShimInstalled) {
    console.warn('[ads-sim] AdsBridge already defined, skipping shim');
    return;
  }

  var PREFIX = '[ads-sim]';
  var startTime = null;
  var requestSeq = 0;
  var pending = Object.create(null); // callbackId -> { kind }

  function elapsed() {
    if (startTime === null) startTime = Date.now();
    return Date.now() - startTime;
  }

  function log() {
    console.log.apply(console, [PREFIX].concat([].slice.call(arguments)));
  }

  function warn() {
    console.warn.apply(console, [PREFIX].concat([].slice.call(arguments)));
  }

  // ---- Tunables (drive from devtools via window.__adsSim) -------------------
  var sim = (window.__adsSim = window.__adsSim || {
    available: true,            // false -> simulate "no APK wrapper": bridge is NOT installed
    adsEnabled: true,           // false -> every show returns 'disabled'
    rewardedReady: true,
    interstitialReady: true,
    bannerVisible: false,

    // Outcome for the next show*(). Set to a non-default value to exercise paths
    // that DON'T render an overlay (they synthesize the terminal status directly).
    // 'auto' -> show the visual ad stub; the user's action (watch / skip) decides
    // whether the resolved status is 'rewarded' or 'dismissed'.
    nextRewardedStatus: 'auto',     // 'auto'|'rewarded'|'dismissed'|'error'|'not_ready'|'disabled'|'busy'
    nextInterstitialStatus: 'auto', // 'auto'|'dismissed'|'error'|'not_ready'|'disabled'|'busy'

    // Countdown duration (ms) for the ad stub overlay.
    adDurationMs: 3000,
  });

  // No provider at all: leave window.AdsBridge undefined so platform.js falls back
  // to web (GameAds.hasProvider() === false, shows synthesize 'unavailable').
  // Pre-seed window.__adsSim.available = false before load (e.g. reload) to test this.
  if (sim.available === false) {
    log('available=false -> AdsBridge NOT installed (simulating no provider / web build).');
    return;
  }

  var busy = false;

  // ---- SDK Event Log bridge -------------------------------------------------
  function post(event, args) {
    var payload = {
      type: 'sdk-event',
      source: 'ads-manager',
      event: event,
      args: args || [],
      ts: Date.now(),
      elapsedMs: elapsed(),
    };

    try { window.parent.postMessage(payload, '*'); } catch (err) { warn('parent postMessage failed', err); }
    try { window.postMessage(payload, '*'); } catch (err) { warn('local postMessage failed', err); }
  }

  // Ask the host to render the ad-stub overlay on top of the simulator.
  function requestOverlay(adKind, id, durationMs) {
    try {
      window.parent.postMessage({
        type: 'ads-manager-show',
        source: 'ads-manager',
        adKind: adKind,         // 'rewarded' | 'interstitial'
        id: id,
        durationMs: durationMs,
      }, '*');
    } catch (err) { warn('overlay request failed', err); }
  }

  function requestBanner(visible) {
    try {
      window.parent.postMessage({ type: 'ads-manager-banner', source: 'ads-manager', visible: !!visible }, '*');
    } catch (err) { warn('banner request failed', err); }
  }

  // ---- Resolve native callbacks --------------------------------------------
  // platform.js defines window.__adsCallback; it maps the status onto the game's
  // onReward/onError/onClose. We never see those game-side callbacks here — the
  // bridge boundary is the status code, exactly like on a real device.
  function fireCallback(id, status) {
    if (typeof window.__adsCallback === 'function') {
      window.__adsCallback(id, { status: status });
    } else {
      warn('window.__adsCallback is not defined — is platform.js loaded after this bridge?');
    }
  }

  // Host reported the overlay outcome -> resolve the matching native callback.
  function resolveOverlay(id, status) {
    var entry = pending[id];
    if (!entry) return;
    delete pending[id];
    busy = false;
    post(entry.kind + ' -> ' + status, [{ status: status }]);
    fireCallback(id, status);
  }

  // Non-visual terminal paths (error/not_ready/disabled/busy).
  function dispatchTerminal(kind, id, status) {
    if (status !== 'busy') busy = true;
    setTimeout(function () {
      post(kind + ' -> ' + status, [{ status: status }]);
      fireCallback(id, status);
      busy = false;
    }, 200);
  }

  // Listen for the host's overlay outcome.
  window.addEventListener('message', function (e) {
    var data = e && e.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'ads-manager-result') return;
    resolveOverlay(data.id, data.status);
  });

  // ---- Native @JavascriptInterface mock (window.AdsBridge) ------------------
  window.AdsBridge = {
    __previewShimInstalled: true,

    showRewarded: function (callbackId) {
      var id = callbackId || ('rv-' + (++requestSeq));
      post('AdsBridge.showRewarded', [id]);

      if (busy) return dispatchTerminal('showRewarded', id, 'busy');
      if (!sim.adsEnabled) return dispatchTerminal('showRewarded', id, 'disabled');

      var next = sim.nextRewardedStatus || 'auto';
      if (next === 'auto' || next === 'rewarded' || next === 'dismissed') {
        busy = true;
        pending[id] = { kind: 'showRewarded' };
        requestOverlay('rewarded', id, Math.max(0, Number(sim.adDurationMs) || 0));
      } else {
        dispatchTerminal('showRewarded', id, next); // error | not_ready | disabled | busy
      }
    },

    showInterstitial: function (callbackId) {
      var id = callbackId || ('int-' + (++requestSeq));
      post('AdsBridge.showInterstitial', [id]);

      if (busy) return dispatchTerminal('showInterstitial', id, 'busy');
      if (!sim.adsEnabled) return dispatchTerminal('showInterstitial', id, 'disabled');

      var next = sim.nextInterstitialStatus || 'auto';
      if ((next === 'auto' || next === 'dismissed') && sim.interstitialReady) {
        busy = true;
        pending[id] = { kind: 'showInterstitial' };
        requestOverlay('interstitial', id, Math.max(0, Number(sim.adDurationMs) || 0));
      } else if (next === 'auto' || next === 'dismissed') {
        dispatchTerminal('showInterstitial', id, 'not_ready');
      } else {
        dispatchTerminal('showInterstitial', id, next); // error | not_ready | disabled | busy
      }
    },

    isRewardedReady: function () {
      return !!sim.adsEnabled && !!sim.rewardedReady;
    },
    isInterstitialReady: function () {
      return !!sim.adsEnabled && !!sim.interstitialReady;
    },

    showBanner: function () {
      post('AdsBridge.showBanner', []);
      sim.bannerVisible = !!sim.adsEnabled; // disabled flavor stays hidden, mirroring native
      requestBanner(sim.bannerVisible);
      return true;
    },
    hideBanner: function () {
      post('AdsBridge.hideBanner', []);
      sim.bannerVisible = false;
      requestBanner(false);
      return true;
    },
    isBannerVisible: function () {
      return !!sim.adsEnabled && !!sim.bannerVisible;
    },
  };

  // Translate host screen-lock into a console note (no real pause in preview).
  try {
    window.addEventListener('playable-screen-lock', function (e) {
      var detail = e && e.detail ? e.detail : {};
      log('playable-screen-lock ->', !!detail.locked);
    });
  } catch (err) {
    warn('failed to register playable-screen-lock listener', err);
  }

  log('AdsBridge simulator installed (native bridge mock). Tweak window.__adsSim to control outcomes.');
})();
