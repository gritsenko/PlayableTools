/**
 * PlayableTools CTA SDK Preview Stub
 * Intercepts all CTA SDK calls and posts them to the parent frame as events.
 * Loaded by the "Default Preview + CTA Stub" preset.
 */
(function () {
  var _startTime = null;

  function _elapsed() {
    if (_startTime === null) _startTime = Date.now();
    return Date.now() - _startTime;
  }

  function _post(event, args) {
    if (_startTime === null) _startTime = Date.now();
    try {
      var msg = { type: 'cta-event', event: event, args: args || [], ts: Date.now(), elapsedMs: _elapsed() };
      window.parent.postMessage(msg, '*');
      // Also post to own window so host can listen without cross-origin restrictions
      window.postMessage(msg, '*');
    } catch (e) {
      console.warn('[CTA Preview] postMessage failed:', e);
    }
  }

  // Mark game start time for reporting "time to start"
  window.__ctaGameStart = null;

  document.CTA = {
    platform: 'Preview',
    sdk: 'Preview',
    analytics: {
      trackEvent: function (name) {
        console.log('[CTA Preview] trackEvent:', name);
        _post('trackEvent', [name]);
      }
    },
    onClick: function (store) {
      console.log('[CTA Preview] onClick:', store);
      _post('onClick', store !== undefined ? [store] : []);
    },
    gameEnd: function () {
      console.log('[CTA Preview] gameEnd');
      _post('gameEnd', []);
    },
    gameReady: function () {
      if (window.__ctaGameStart === null) {
        window.__ctaGameStart = Date.now();
        _post('gameReady', []);
        console.log('[CTA Preview] gameReady (time-to-start:', _elapsed(), 'ms)');
        // Notify host about game start time
        try {
          window.parent.postMessage({ type: 'cta-game-start', ts: window.__ctaGameStart, elapsedMs: _elapsed() }, '*');
          window.postMessage({ type: 'cta-game-start', ts: window.__ctaGameStart, elapsedMs: _elapsed() }, '*');
        } catch (e) {}
      } else {
        _post('gameReady', []);
      }
    },
    mute: function () {
      console.log('[CTA Preview] mute');
      _post('mute', []);
    },
    unmute: function () {
      console.log('[CTA Preview] unmute');
      _post('unmute', []);
    }
  };

  console.log('%c[CTA Preview Stub] Loaded — CTA events will appear in the SDK Event Log panel', 'color:#4f46e5;font-weight:bold');
})();
