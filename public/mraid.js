/* Simple MRAID shim for preview/testing purposes
   - Implements minimal MRAID API used by playables in this project
   - Logs all calls to console with [mraid] prefix
   - Emits `ready` after a short delay (initial state = 'loading')
   - Supports addEventListener/removeEventListener, getState, isViewable, open
   - Fires viewableChange/exposureChange on document visibility changes
   - Exposes `__mraidSimulate` helpers on window for manual event simulation
*/
(function () {
  if (window.mraid) {
    console.warn('[mraid] mraid already defined, skipping shim');
    return;
  }

  const PREFIX = '[mraid]';
  const log = (...args) => console.log(PREFIX, ...args);
  const error = (...args) => console.error(PREFIX, ...args);

  let state = 'loading'; // 'loading' initially, then 'default'
  const listeners = Object.create(null);

  function addEventListener(name, cb) {
    if (typeof cb !== 'function') return;
    listeners[name] = listeners[name] || [];
    listeners[name].push(cb);
    log('addEventListener', name, cb.name || '<anonymous>');
    // If already past loading and they asked for ready, call immediately
    if (name === 'ready' && state !== 'loading') {
      setTimeout(() => {
        try { cb(); } catch (e) { error('listener error', e); }
      }, 0);
    }
  }

  function removeEventListener(name, cb) {
    if (!listeners[name]) return;
    if (!cb) {
      listeners[name] = [];
      return;
    }
    listeners[name] = listeners[name].filter(f => f !== cb);
    log('removeEventListener', name, cb.name || '<anonymous>');
  }

  function _fire(name, ...args) {
    log('fireEvent', name, ...args);
    const arr = listeners[name] || [];
    arr.slice().forEach(fn => {
      try { fn(...args); } catch (e) { error('listener error', e); }
    });
  }

  const mraid = {
    getState() {
      log('getState ->', state);
      return state;
    },
    addEventListener,
    removeEventListener,
    isViewable() {
      log('isViewable ->', true);
      return true;
    },
    open(url) {
      log('open called with', url);
      try {
        // In preview we should not open external tabs. Instead show an alert so user
        // sees that the CTA was triggered and what URL was requested.
        if (typeof url === 'string') {
          alert('[mraid] CTA clicked. URL: ' + url);
        } else {
          alert('[mraid] CTA clicked.');
        }
      } catch (e) {
        error('open handler failed', e);
      }
      _fire('open', url);
    },
    // small helper for internal/manual use
    _internal: {
      setState(s) { state = s; log('internal setState', s); },
    }
  };

  // attach to window
  window.mraid = mraid;

  // After a short delay, transition from 'loading' to 'default' and fire ready
  setTimeout(() => {
    try {
      state = 'default';
      log('state ->', state);
      // Provide safe stubs for common CTA hooks so mraid listeners (from CTAs)
      // that call document.CTA.startGame()/mute()/unmute() won't throw in preview.
      try {
        if (typeof document !== 'undefined') {
          if (!document.CTA) document.CTA = {};
          if (typeof document.CTA.startGame !== 'function') {
            document.CTA.startGame = function () { log('document.CTA.startGame() stubbed'); };
          }
          if (typeof document.CTA.mute !== 'function') {
            document.CTA.mute = function () { log('document.CTA.mute() stubbed'); };
          }
          if (typeof document.CTA.unmute !== 'function') {
            document.CTA.unmute = function () { log('document.CTA.unmute() stubbed'); };
          }
        }
      } catch (e) {
        error('failed to create document.CTA stubs', e);
      }

      _fire('ready', {});
      // Fire initial viewableChange after ready (ad is initially viewable in preview)
      _fire('viewableChange', true);
    } catch (e) {
      error('ready transition error', e);
    }
  }, 50);

  // Visibility/exposure handling
  document.addEventListener('visibilitychange', () => {
    try {
      const isViewable = document.visibilityState === 'visible';
      log('visibilitychange ->', document.visibilityState);
      _fire('viewableChange', isViewable);
      // exposureChange signature in some CTAs: (exposedPercentage, coveredRectangles, boundingRect)
      const exposedPercentage = isViewable ? 100 : 0;
      _fire('exposureChange', exposedPercentage, [], { x: 0, y: 0, width: 0, height: 0 });
    } catch (e) { error('visibility handler error', e); }
  });

  // Orientation / resize proxy
  window.addEventListener('resize', () => {
    try { log('window resize/orientationchange'); _fire('orientationchange'); } catch (e) { error(e); }
  });

  // Expose dev helpers to simulate events from console
  window.__mraidSimulate = {
    viewableChange(v) { mraid.addEventListener && _fire('viewableChange', !!v); },
    exposureChange(p) { _fire('exposureChange', p || 0, [], { x: 0, y: 0, width: 0, height: 0 }); },
    audioVolumeChange(v) { _fire('audioVolumeChange', v); },
    orientationchange() { _fire('orientationchange'); },
    ready() { _fire('ready'); }
  };

  // Listen for generic playable screen lock events and translate them to mraid viewableChange
  try {
    window.addEventListener('playable-screen-lock', (e) => {
      try {
        const ev = e; // expect CustomEvent with detail { locked }
        const locked = !!(ev && ev.detail && ev.detail.locked);
        const isViewable = !locked;
        log('received playable-screen-lock ->', locked, 'translating to viewableChange', isViewable);
        _fire('viewableChange', isViewable);
      } catch (err) { error('playable-screen-lock handler error', err); }
    });
  } catch (e) { error('failed to register playable-screen-lock listener', e); }

  // Listen for playable audio mute events and translate them to mraid audioVolumeChange
  try {
    window.addEventListener('playable-audio-mute', (e) => {
      try {
        const ev = e; // expect CustomEvent with detail { muted }
        const muted = !!(ev && ev.detail && ev.detail.muted);
        const volume = muted ? 0 : 100;
        log('received playable-audio-mute ->', muted, 'translating to audioVolumeChange', volume);
        _fire('audioVolumeChange', volume);
      } catch (err) { error('playable-audio-mute handler error', err); }
    });
  } catch (e) { error('failed to register playable-audio-mute listener', e); }

  log('shim installed (debug)');

})();
