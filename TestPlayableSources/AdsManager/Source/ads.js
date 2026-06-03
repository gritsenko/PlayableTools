/**
 * Block Chpok — unified ads facade (window.GameAds)
 *
 * Wraps the native AppLovin bridge `window.AdsManager` (contract: docs/ADS_MANAGER.md)
 * and gracefully falls back to the Yandex Games SDK (window.YandexSDK) or a no-op when
 * neither is present. Game code talks ONLY to window.GameAds and never has to feature-detect.
 *
 * Callback contract guaranteed to game code (same for every provider and every outcome):
 *   showInterstitial({ onOpen?, onError?(result), onClose?(wasShown) })
 *   showRewarded   ({ onOpen?, onReward?, onError?(result), onClose?(wasShown) })
 * `onClose` ALWAYS fires exactly once and last. `onReward` only fires when the reward
 * was actually earned. `wasShown` is false when the ad never displayed (error/not_ready/unavailable).
 */
(function () {
    'use strict';

    // ---------------------------------------------------------------------------
    // Dev-only simulator. Installs only on localhost AND only when no real native
    // bridge is present, so production (native shell / Yandex) is never affected.
    // Tweak window.__adsSim from devtools to exercise every branch of game code.
    // ---------------------------------------------------------------------------
    (function installSimulator() {
        const isLocalhost = typeof window !== 'undefined'
            && window.location
            && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
        const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

        if (!isLocalhost || isEmbedded || window.AdsManager) {
            return;
        }

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

        window.AdsManager = {
            get available() { return sim.available; },
            get adsEnabled() { return sim.available && sim.adsEnabled; },
            showRewardedVideo(callbacks) {
                const cb = callbacks || {};
                if (!sim.available) { cb.onError && cb.onError({ status: 'unavailable' }); cb.onClose && cb.onClose(); return; }
                cb.onOpen && cb.onOpen();
                if (busy) return dispatchRewarded(cb, 'busy');
                if (!sim.adsEnabled) return dispatchRewarded(cb, 'disabled');
                dispatchRewarded(cb, sim.nextRewardedStatus);
            },
            showInterstitial(callbacks) {
                const cb = callbacks || {};
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
            openMediationDebugger() { return false; },
        };

        console.log('[ads] AdsManager simulator installed (localhost). Tweak window.__adsSim to control outcomes.');
    })();

    // ---------------------------------------------------------------------------
    // Provider detection
    // ---------------------------------------------------------------------------
    function hasAdsManager() {
        return !!(window.AdsManager && window.AdsManager.available && window.AdsManager.adsEnabled);
    }

    function hasYandex() {
        return !!(window.YandexSDK
            && typeof window.YandexSDK.isAvailable === 'function'
            && window.YandexSDK.isAvailable());
    }

    function hasProvider() {
        return hasAdsManager() || hasYandex();
    }

    function safe(fn, arg) {
        if (typeof fn !== 'function') return;
        try {
            fn(arg);
        } catch (error) {
            console.warn('[ads] callback threw', error);
        }
    }

    // ---------------------------------------------------------------------------
    // Interstitial
    // ---------------------------------------------------------------------------
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

        if (hasAdsManager()) {
            window.AdsManager.showInterstitial({
                onOpen,
                onError,
                onClose: () => finish(!errored),
            });
            return 'adsmanager';
        }

        if (hasYandex()) {
            window.YandexSDK.showFullscreenAdv({
                onOpen,
                onError,
                onClose: (wasShown) => finish(errored ? false : wasShown !== false),
            });
            return 'yandex';
        }

        // No provider available — behave like a graceful no-op so the game keeps moving.
        onError({ status: 'unavailable' });
        finish(false);
        return 'none';
    }

    // ---------------------------------------------------------------------------
    // Rewarded video
    // ---------------------------------------------------------------------------
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

        if (hasAdsManager()) {
            window.AdsManager.showRewardedVideo({
                onOpen,
                onReward,
                onError,
                onClose: () => finish(!errored),
            });
            return 'adsmanager';
        }

        if (hasYandex()) {
            window.YandexSDK.showRewardedVideo({
                onOpen,
                onRewarded: onReward,
                onError,
                onClose: (wasShown) => finish(errored ? false : wasShown !== false),
            });
            return 'yandex';
        }

        onError({ status: 'unavailable' });
        finish(false);
        return 'none';
    }

    // ---------------------------------------------------------------------------
    // Readiness probes (best-effort; only the native bridge reports real readiness)
    // ---------------------------------------------------------------------------
    function isInterstitialReady() {
        if (hasAdsManager() && typeof window.AdsManager.isInterstitialReady === 'function') {
            return !!window.AdsManager.isInterstitialReady();
        }
        return hasYandex();
    }

    function isRewardedReady() {
        if (hasAdsManager() && typeof window.AdsManager.isRewardedReady === 'function') {
            return !!window.AdsManager.isRewardedReady();
        }
        return hasYandex();
    }

    // ---------------------------------------------------------------------------
    // Banner (thin passthrough; the native shell auto-shows its banner by default)
    // ---------------------------------------------------------------------------
    function showBanner() {
        if (hasAdsManager() && typeof window.AdsManager.showBanner === 'function') {
            return !!window.AdsManager.showBanner();
        }
        if (hasYandex() && typeof window.YandexSDK.showBannerAdv === 'function') {
            window.YandexSDK.showBannerAdv();
            return true;
        }
        return false;
    }

    function hideBanner() {
        if (hasAdsManager() && typeof window.AdsManager.hideBanner === 'function') {
            return !!window.AdsManager.hideBanner();
        }
        if (hasYandex() && typeof window.YandexSDK.hideBannerAdv === 'function') {
            window.YandexSDK.hideBannerAdv();
            return true;
        }
        return false;
    }

    function isBannerVisible() {
        if (hasAdsManager() && typeof window.AdsManager.isBannerVisible === 'function') {
            return !!window.AdsManager.isBannerVisible();
        }
        return false;
    }

    window.GameAds = {
        hasProvider,
        hasNativeBridge: hasAdsManager,
        showInterstitial,
        showRewarded,
        isInterstitialReady,
        isRewardedReady,
        showBanner,
        hideBanner,
        isBannerVisible,
    };

    console.log('[ads] GameAds facade ready.');
})();
