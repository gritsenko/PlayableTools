/**
 * platform.js — single-file ads/monetization SDK for embedded HTML5 games.
 *
 * Public contract: window.GameAds (see GAME_ADS_API.md).
 *   GameAds.platform                                       // 'native' | 'web'
 *   GameAds.hasProvider()                                  // any provider available
 *   GameAds.showRewarded({ onOpen, onReward, onError, onClose })
 *   GameAds.showInterstitial({ onOpen, onError, onClose })
 *   GameAds.isRewardedReady() / isInterstitialReady()
 *   GameAds.showBanner() / hideBanner() / isBannerVisible()
 *   GameAds.whenYandexReady()                              // promise<boolean>
 *
 * Three environments, zero game-code changes:
 *   1. Android APK shell  — native @JavascriptInterface (window.AdsBridge) is detected
 *                           and wrapped synchronously. AppLovin MAX shows real ads.
 *   2. Yandex Games       — Yandex SDK is lazy-loaded; ads come from Yandex.
 *   3. Browser / localhost — built-in simulator. Tweak window.__adsSim from devtools
 *                           to exercise every callback branch.
 *
 * Callback contract is identical across providers:
 *   • onClose ALWAYS fires exactly once and last (even on errors / no provider).
 *   • onReward fires only when the user earned the reward.
 *   • onError fires for status ∈ { error, not_ready, disabled, busy, unavailable }.
 *     For interstitials, 'dismissed' is the SUCCESS path — onClose without onError.
 *
 * The raw native bridge (window.AdsBridge) and the simulator's adapter are
 * intentionally NOT exposed on window — game code consumes only GameAds.
 */
(function () {
    'use strict';

    // The raw @JavascriptInterface installed by the APK shell, if any.
    const rawBridge = (typeof window !== 'undefined') ? window.AdsBridge : null;

    // Internal adapter the public facade calls into.
    // null when no provider was selected (web fallback path uses Yandex SDK or no-op).
    let adapter = null;

    // -----------------------------------------------------------------------
    // 1. Native adapter — wraps window.AdsBridge into a uniform shape.
    //    Was previously a separate ads-bridge.js; inlined so the SDK is one file.
    // -----------------------------------------------------------------------
    function buildNativeAdapter() {
        if (!rawBridge || typeof rawBridge.showRewarded !== 'function') return null;

        const pending = new Map();
        let nextId = 1;

        // Kotlin's AdsBridge.dispatchCallback resolves async results by invoking
        // window.__adsCallback. MUST live on window — the native side calls it
        // via evaluateJavascript and can't see our closure.
        window.__adsCallback = function (callbackId, result) {
            const handler = pending.get(callbackId);
            if (!handler) {
                console.warn('[platform] no handler for callbackId', callbackId);
                return;
            }
            pending.delete(callbackId);
            handler(result || { status: 'error' });
        };

        function showRewarded(cb) {
            const id = 'ad_' + (nextId++);
            pending.set(id, (result) => {
                const status = result.status;
                if (status === 'rewarded') {
                    cb.onReward && cb.onReward();
                } else if (status === 'error' || status === 'disabled' ||
                           status === 'not_ready' || status === 'busy') {
                    cb.onError && cb.onError(result);
                }
                cb.onClose && cb.onClose();
            });
            try {
                cb.onOpen && cb.onOpen();
                rawBridge.showRewarded(id);
            } catch (e) {
                pending.delete(id);
                console.error('[platform] native showRewarded threw', e);
                cb.onError && cb.onError({ status: 'error', error: String(e) });
                cb.onClose && cb.onClose();
            }
        }

        function showInterstitial(cb) {
            if (typeof rawBridge.showInterstitial !== 'function') {
                cb.onError && cb.onError({ status: 'unavailable' });
                cb.onClose && cb.onClose();
                return;
            }
            const id = 'ad_' + (nextId++);
            pending.set(id, (result) => {
                const status = result.status;
                // 'dismissed' = success for interstitials; no onError on that path.
                if (status === 'error' || status === 'disabled' ||
                    status === 'not_ready' || status === 'busy') {
                    cb.onError && cb.onError(result);
                }
                cb.onClose && cb.onClose();
            });
            try {
                cb.onOpen && cb.onOpen();
                rawBridge.showInterstitial(id);
            } catch (e) {
                pending.delete(id);
                console.error('[platform] native showInterstitial threw', e);
                cb.onError && cb.onError({ status: 'error', error: String(e) });
                cb.onClose && cb.onClose();
            }
        }

        // We intentionally do NOT key `available` off rawBridge.isAdsEnabled():
        // some shells don't expose it at all, and the native side already returns
        // 'disabled' through the callback when ads are off. Keying off enabled
        // here would hide the second-chance offer even when ads work fine.
        return {
            available: true,
            showRewarded: showRewarded,
            showInterstitial: showInterstitial,
            isRewardedReady() {
                if (typeof rawBridge.isRewardedReady !== 'function') return false;
                try { return !!rawBridge.isRewardedReady(); } catch (e) { return false; }
            },
            isInterstitialReady() {
                if (typeof rawBridge.isInterstitialReady !== 'function') return false;
                try { return !!rawBridge.isInterstitialReady(); } catch (e) { return false; }
            },
            showBanner() {
                if (typeof rawBridge.showBanner !== 'function') return false;
                try { rawBridge.showBanner(); return true; } catch (e) { return false; }
            },
            hideBanner() {
                if (typeof rawBridge.hideBanner !== 'function') return false;
                try { rawBridge.hideBanner(); return true; } catch (e) { return false; }
            },
            isBannerVisible() {
                if (typeof rawBridge.isBannerVisible !== 'function') return false;
                try { return !!rawBridge.isBannerVisible(); } catch (e) { return false; }
            },
        };
    }

    // -----------------------------------------------------------------------
    // 2. Localhost simulator — only when no native bridge present AND we're on
    //    127.0.0.1 / localhost. Production, native shell, and Yandex are
    //    never affected. Tweak window.__adsSim from devtools to control outcomes.
    // -----------------------------------------------------------------------
    function buildSimulator() {
        const isLocalhost = typeof window !== 'undefined'
            && window.location
            && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
        const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;
        if (!isLocalhost || isEmbedded) return null;

        const sim = (window.__adsSim = {
            available: true,
            adsEnabled: true,
            rewardedReady: true,
            interstitialReady: true,
            bannerVisible: true,
            nextRewardedStatus: 'rewarded',      // rewarded|dismissed|error|not_ready|disabled|busy
            nextInterstitialStatus: 'dismissed', // dismissed|error|not_ready|disabled|busy
            showLatencyMs: 1200,
        });

        let busy = false;

        function dispatchRewarded(cb, status) {
            busy = true;
            setTimeout(() => {
                if (status === 'rewarded') cb.onReward && cb.onReward();
                if (status === 'error' || status === 'disabled' ||
                    status === 'not_ready' || status === 'busy') {
                    cb.onError && cb.onError({ status });
                }
                cb.onClose && cb.onClose();
                busy = false;
            }, sim.showLatencyMs);
        }

        function dispatchInterstitial(cb, status) {
            busy = true;
            setTimeout(() => {
                if (status === 'error' || status === 'disabled' ||
                    status === 'not_ready' || status === 'busy') {
                    cb.onError && cb.onError({ status });
                }
                cb.onClose && cb.onClose();
                busy = false;
            }, sim.showLatencyMs);
        }

        return {
            get available() { return sim.available; },
            showRewarded(cb) {
                if (!sim.available) { cb.onError && cb.onError({ status: 'unavailable' }); cb.onClose && cb.onClose(); return; }
                cb.onOpen && cb.onOpen();
                if (busy) return dispatchRewarded(cb, 'busy');
                if (!sim.adsEnabled) return dispatchRewarded(cb, 'disabled');
                dispatchRewarded(cb, sim.nextRewardedStatus);
            },
            showInterstitial(cb) {
                if (!sim.available) { cb.onError && cb.onError({ status: 'unavailable' }); cb.onClose && cb.onClose(); return; }
                cb.onOpen && cb.onOpen();
                if (busy) return dispatchInterstitial(cb, 'busy');
                if (!sim.adsEnabled) return dispatchInterstitial(cb, 'disabled');
                if (!sim.interstitialReady && sim.nextInterstitialStatus === 'dismissed') {
                    return dispatchInterstitial(cb, 'not_ready');
                }
                dispatchInterstitial(cb, sim.nextInterstitialStatus);
            },
            isRewardedReady() { return sim.available && sim.adsEnabled && sim.rewardedReady; },
            isInterstitialReady() { return sim.available && sim.adsEnabled && sim.interstitialReady; },
            showBanner() { if (!sim.available) return false; sim.bannerVisible = sim.adsEnabled; return true; },
            hideBanner() { if (!sim.available) return false; sim.bannerVisible = false; return true; },
            isBannerVisible() { return sim.available && sim.adsEnabled && sim.bannerVisible; },
        };
    }

    // Provider selection — native first, simulator second. If both fail we fall
    // through to Yandex SDK below (web environments) or to a no-op (everywhere else).
    adapter = buildNativeAdapter() || buildSimulator();
    const platform = adapter ? 'native' : 'web';

    // -----------------------------------------------------------------------
    // 3. Yandex Games SDK — lazy-loaded only when no adapter was selected.
    //    /sdk.js is served by the Yandex platform; outside it we still try
    //    yandex-sdk.js so window.YandexSDK exists and reports unavailable.
    // -----------------------------------------------------------------------
    let resolveYandexReady;
    const yandexReadyPromise = new Promise(resolve => { resolveYandexReady = resolve; });

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = src;
            el.async = false;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error('failed to load ' + src));
            (document.head || document.documentElement).appendChild(el);
        });
    }

    if (adapter) {
        resolveYandexReady(false);
        console.log('[platform] ' + (rawBridge ? 'native bridge' : 'localhost simulator') + ' ready — Yandex SDK skipped.');
    } else {
        loadScript('/sdk.js')
            .catch(() => { /* not served by this host */ })
            .then(() => loadScript('yandex-sdk.js'))
            .catch(() => { /* wrapper missing */ })
            .then(() => { resolveYandexReady(!!window.YandexSDK); });
    }

    // -----------------------------------------------------------------------
    // 4. Provider detection + public facade.
    // -----------------------------------------------------------------------
    function hasNative() { return !!(adapter && adapter.available); }
    function hasYandex() {
        return !!(window.YandexSDK
            && typeof window.YandexSDK.isAvailable === 'function'
            && window.YandexSDK.isAvailable());
    }
    function hasProvider() { return hasNative() || hasYandex(); }

    function safe(fn, arg) {
        if (typeof fn !== 'function') return;
        try { fn(arg); } catch (e) { console.warn('[platform] callback threw', e); }
    }

    function showInterstitial(callbacks) {
        const cb = callbacks || {};
        let finished = false;
        let errored = false;
        const finish = (wasShown) => {
            if (finished) return;
            finished = true;
            safe(cb.onClose, wasShown);
        };
        const onOpen = () => safe(cb.onOpen);
        const onError = (result) => { errored = true; safe(cb.onError, result || { status: 'error' }); };

        if (hasNative()) {
            adapter.showInterstitial({
                onOpen: onOpen,
                onError: onError,
                onClose: () => finish(!errored),
            });
            return 'native';
        }
        if (hasYandex()) {
            window.YandexSDK.showFullscreenAdv({
                onOpen: onOpen,
                onError: onError,
                onClose: (wasShown) => finish(errored ? false : wasShown !== false),
            });
            return 'yandex';
        }
        onError({ status: 'unavailable' });
        finish(false);
        return 'none';
    }

    function showRewarded(callbacks) {
        const cb = callbacks || {};
        let finished = false;
        let errored = false;
        const finish = (wasShown) => {
            if (finished) return;
            finished = true;
            safe(cb.onClose, wasShown);
        };
        const onOpen = () => safe(cb.onOpen);
        const onReward = () => safe(cb.onReward);
        const onError = (result) => { errored = true; safe(cb.onError, result || { status: 'error' }); };

        if (hasNative()) {
            adapter.showRewarded({
                onOpen: onOpen,
                onReward: onReward,
                onError: onError,
                onClose: () => finish(!errored),
            });
            return 'native';
        }
        if (hasYandex()) {
            window.YandexSDK.showRewardedVideo({
                onOpen: onOpen,
                onRewarded: onReward,
                onError: onError,
                onClose: (wasShown) => finish(errored ? false : wasShown !== false),
            });
            return 'yandex';
        }
        onError({ status: 'unavailable' });
        finish(false);
        return 'none';
    }

    function isInterstitialReady() {
        if (hasNative() && typeof adapter.isInterstitialReady === 'function') {
            return !!adapter.isInterstitialReady();
        }
        return hasYandex();
    }

    function isRewardedReady() {
        if (hasNative() && typeof adapter.isRewardedReady === 'function') {
            return !!adapter.isRewardedReady();
        }
        return hasYandex();
    }

    function showBanner() {
        if (hasNative() && typeof adapter.showBanner === 'function') {
            return !!adapter.showBanner();
        }
        if (hasYandex() && typeof window.YandexSDK.showBannerAdv === 'function') {
            window.YandexSDK.showBannerAdv();
            return true;
        }
        return false;
    }

    function hideBanner() {
        if (hasNative() && typeof adapter.hideBanner === 'function') {
            return !!adapter.hideBanner();
        }
        if (hasYandex() && typeof window.YandexSDK.hideBannerAdv === 'function') {
            window.YandexSDK.hideBannerAdv();
            return true;
        }
        return false;
    }

    function isBannerVisible() {
        if (hasNative() && typeof adapter.isBannerVisible === 'function') {
            return !!adapter.isBannerVisible();
        }
        return false;
    }

    window.GameAds = {
        platform: platform,
        whenYandexReady: function () { return yandexReadyPromise; },
        hasProvider: hasProvider,
        showInterstitial: showInterstitial,
        showRewarded: showRewarded,
        isInterstitialReady: isInterstitialReady,
        isRewardedReady: isRewardedReady,
        showBanner: showBanner,
        hideBanner: hideBanner,
        isBannerVisible: isBannerVisible,
    };

    console.log('[platform] GameAds ready (platform=' + platform + ').');
})();
