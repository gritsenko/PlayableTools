/* AppLovin MAX playable environment shim for preview/testing purposes.

   AppLovin renders playable ads inside an MRAID container, so this stub provides
   a minimal MRAID API (the real click/CTA path a MAX playable relies on) AND a
   lightweight AppLovin MAX analytics surface. Every MRAID lifecycle event and
   every analytics call is:
     1. logged to the console with an [applovin] prefix, and
     2. forwarded to the host SDK Event Log via the standard `sdk-event`
        postMessage protocol (source: 'applovin'), so the previewer panel shows
        the AppLovin MAX analytics stream exactly like the other network stubs.

   Manual simulation helpers are exposed on window.__applovinSimulate.
*/
(function () {
  if (window.__APPLOVIN_SHIM__) {
    console.warn('[applovin] shim already installed, skipping');
    return;
  }
  window.__APPLOVIN_SHIM__ = true;

  var PREFIX = '[applovin]';
  var log = function () {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, [PREFIX].concat(args));
  };
  var error = function () {
    var args = Array.prototype.slice.call(arguments);
    console.error.apply(console, [PREFIX].concat(args));
  };

  var startTs = Date.now();
  function elapsed() { return Date.now() - startTs; }

  // ---- SDK Event Log bridge -------------------------------------------------
  // Mirrors the protocol used by ads-manager.js / sdk.js so the host previewer
  // renders these entries in its "SDK Event Log" panel.
  function post(event, args) {
    var payload = {
      type: 'sdk-event',
      source: 'applovin',
      event: event,
      args: args || [],
      ts: Date.now(),
      elapsedMs: elapsed(),
    };
    try { window.parent.postMessage(payload, '*'); } catch (err) { error('parent postMessage failed', err); }
    try { window.postMessage(payload, '*'); } catch (err) { error('local postMessage failed', err); }
  }

  // ---- AppLovin MAX analytics ----------------------------------------------
  // A MAX playable reports engagement/analytics events during its lifecycle.
  // We surface a small AppLovin-style analytics API and log everything.
  var analytics = {
    track: function (name, params) {
      log('MAX analytics:', name, params || {});
      post('analytics: ' + name, [params || {}]);
    },
    // Common MAX playable milestones — playables may call these directly.
    logImpression: function () { this.track('impression'); },
    logEngagement: function () { this.track('engagement'); },
    logComplete: function () { this.track('complete'); },
    logClick: function (url) { this.track('click', { url: url || null }); },
  };

  // Expose under the names AppLovin creatives commonly probe for.
  window.AppLovinMAX = window.AppLovinMAX || {};
  window.AppLovinMAX.analytics = analytics;
  window.ALSdk = window.ALSdk || { analytics: analytics };

  // ---- MRAID container ------------------------------------------------------
  var state = 'loading'; // 'loading' -> 'default'
  var listeners = Object.create(null);

  function fire(name) {
    var extra = Array.prototype.slice.call(arguments, 1);
    log('mraid event:', name, extra.length ? extra : '');
    post('mraid: ' + name, extra);
    var arr = listeners[name] || [];
    arr.slice().forEach(function (fn) {
      try { fn.apply(null, extra); } catch (e) { error('listener error', e); }
    });
  }

  var mraid = {
    getVersion: function () { return '3.0'; },
    getState: function () { return state; },
    isViewable: function () { return true; },
    addEventListener: function (name, cb) {
      if (typeof cb !== 'function') return;
      listeners[name] = listeners[name] || [];
      listeners[name].push(cb);
      log('addEventListener', name);
      if (name === 'ready' && state !== 'loading') {
        setTimeout(function () { try { cb(); } catch (e) { error(e); } }, 0);
      }
    },
    removeEventListener: function (name, cb) {
      if (!listeners[name]) return;
      if (!cb) { listeners[name] = []; return; }
      listeners[name] = listeners[name].filter(function (f) { return f !== cb; });
    },
    open: function (url) {
      // A MAX playable's CTA routes the store click through mraid.open().
      log('open (CTA / store click) ->', url);
      analytics.logClick(url);
      try {
        alert('[applovin] CTA clicked. Store URL: ' + (typeof url === 'string' ? url : '(none)'));
      } catch (e) { error('open handler failed', e); }
      fire('open', url);
    },
    close: function () { fire('stateChange', 'hidden'); },
    useCustomClose: function () {},
    getPlacementType: function () { return 'interstitial'; },
    getMaxSize: function () {
      return { width: window.innerWidth, height: window.innerHeight };
    },
    getScreenSize: function () {
      return { width: window.screen.width, height: window.screen.height };
    },
  };

  if (!window.mraid) {
    window.mraid = mraid;
  } else {
    log('mraid already present — layering AppLovin analytics on top, not replacing');
  }

  // Boot sequence: loading -> default, fire ready + first impression.
  setTimeout(function () {
    try {
      state = 'default';
      fire('ready');
      fire('viewableChange', true);
      analytics.logImpression();
    } catch (e) { error('boot error', e); }
  }, 50);

  // Visibility -> viewableChange
  document.addEventListener('visibilitychange', function () {
    var isViewable = document.visibilityState === 'visible';
    fire('viewableChange', isViewable);
  });

  window.addEventListener('resize', function () {
    fire('sizeChange', window.innerWidth, window.innerHeight);
  });

  // Manual simulation helpers for the console.
  window.__applovinSimulate = {
    ready: function () { fire('ready'); },
    viewableChange: function (v) { fire('viewableChange', !!v); },
    sizeChange: function (w, h) { fire('sizeChange', w || window.innerWidth, h || window.innerHeight); },
    error: function (msg) { fire('error', msg || 'simulated error', 'unknown'); },
    click: function (url) { mraid.open(url || 'https://apps.example.com/app'); },
    impression: function () { analytics.logImpression(); },
    engagement: function () { analytics.logEngagement(); },
    complete: function () { analytics.logComplete(); },
  };

  log('AppLovin MAX shim installed');
})();
