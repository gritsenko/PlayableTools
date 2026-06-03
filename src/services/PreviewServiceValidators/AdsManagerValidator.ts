import type { Validator, ValidationContext, ValidationResult, ValidationCategory, ValidationCheck } from './types';

function hasMatch(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

function createCheck(name: string, passed: boolean, details?: string, isWarning?: boolean): ValidationCheck {
  return {
    name,
    passed,
    details,
    isWarning,
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class AdsManagerValidator implements Validator {
  validate(content: string, fileSize: number, _context?: ValidationContext): ValidationResult {
    // New APK-wrapper contract: the single public facade is window.GameAds (platform.js).
    const usesGameAds = hasMatch(content, /\bGameAds\b/);
    const usesRewarded = hasMatch(content, /\bGameAds\s*\.\s*showRewarded\s*\(/);
    const usesInterstitial = hasMatch(content, /\bGameAds\s*\.\s*showInterstitial\s*\(/);
    const usesAds = usesRewarded || usesInterstitial;
    const usesBanner = hasMatch(content, /\bGameAds\s*\.\s*(?:show|hide)Banner\s*\(/);
    const usesHasProvider = hasMatch(content, /\bGameAds\s*\.\s*hasProvider\s*\(/);

    // platform.js must be present (linked or inlined) for GameAds to exist.
    const hasPlatformScript = hasMatch(content, /platform\.js/) || hasMatch(content, /window\.GameAds\s*=/);

    // Legacy contract — the previous wrapper exposed window.AdsManager.showRewardedVideo().
    const usesLegacyAdsManager = hasMatch(content, /\bAdsManager\s*\.\s*(?:showRewardedVideo|showInterstitial|showBanner|hideBanner)\s*\(/);

    const hasOnOpen = hasMatch(content, /\bonOpen\s*:/);
    const hasOnClose = hasMatch(content, /\bonClose\s*:/);
    const hasOnError = hasMatch(content, /\bonError\s*:/);
    const hasOnReward = hasMatch(content, /\bonReward\s*:/);

    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);

    const categories: ValidationCategory[] = [
      {
        name: 'GameAds SDK',
        checks: [
          createCheck(
            'HTML file size <= 10MB',
            fileSize <= MAX_FILE_SIZE,
            fileSize > MAX_FILE_SIZE
              ? `File size: ${fileSizeMB}MB (recommended max: 10MB)`
              : `File size: ${fileSizeMB}MB`,
            fileSize > MAX_FILE_SIZE,
          ),
          createCheck(
            'GameAds API usage detected',
            usesGameAds,
            usesGameAds
              ? usesAds
                ? 'GameAds ad calls detected.'
                : 'GameAds referenced. No rewarded/interstitial show calls detected yet.'
              : usesLegacyAdsManager
                ? 'Legacy window.AdsManager API detected. The APK wrapper now exposes window.GameAds (platform.js) — migrate showRewardedVideo() → GameAds.showRewarded() and call GameAds.showInterstitial()/showBanner() instead.'
                : 'window.GameAds is not used. The APK wrapper exposes it (via platform.js) for rewarded/interstitial/banner ads.',
            usesGameAds ? !usesAds : usesLegacyAdsManager,
          ),
          createCheck(
            'platform.js present',
            !usesGameAds || hasPlatformScript,
            usesGameAds && !hasPlatformScript
              ? 'GameAds is used but platform.js was not found (neither linked nor inlined). Include platform.js so window.GameAds is defined across native / Yandex / browser environments.'
              : hasPlatformScript
                ? 'platform.js detected.'
                : 'No GameAds usage detected.',
            usesGameAds && !hasPlatformScript,
          ),
        ],
      },
      {
        name: 'Rewarded / Interstitial flow',
        checks: [
          createCheck(
            'Rewarded grants reward in onReward()',
            !usesRewarded || hasOnReward,
            usesRewarded && !hasOnReward
              ? 'GameAds.showRewarded() detected without an onReward callback. The reward MUST only be granted inside onReward() (it fires only on a full watch, before onClose).'
              : usesRewarded
                ? 'onReward callback detected.'
                : 'No rewarded video usage detected.',
            usesRewarded && !hasOnReward,
          ),
          createCheck(
            'onClose handler present (always fires last)',
            !usesAds || hasOnClose,
            usesAds && !hasOnClose
              ? 'No onClose callback found. onClose ALWAYS fires exactly once and last in every outcome (even with no provider) — resume the game there. onClose(wasShown=false) means no ad displayed.'
              : usesAds
                ? 'onClose callback detected.'
                : 'No ad usage detected.',
            usesAds && !hasOnClose,
          ),
          createCheck(
            'onError handler present',
            !usesAds || hasOnError,
            usesAds && !hasOnError
              ? 'No onError callback found. Handle not_ready/error/disabled/busy/unavailable so the game keeps moving when ads fail. For interstitials, onClose without a preceding onError means success.'
              : usesAds
                ? 'onError callback detected.'
                : 'No ad usage detected.',
            usesAds && !hasOnError,
          ),
          createCheck(
            'onOpen used to pause gameplay',
            !usesAds || hasOnOpen,
            usesAds && !hasOnOpen
              ? 'No onOpen callback found. Use onOpen to pause game logic/audio before the ad surface appears.'
              : usesAds
                ? 'onOpen callback detected.'
                : 'No ad usage detected.',
            usesAds && !hasOnOpen,
          ),
        ],
      },
      {
        name: 'Best practices',
        checks: [
          createCheck(
            'Gate ad offers with GameAds.hasProvider()',
            !usesAds || usesHasProvider,
            usesAds && !usesHasProvider
              ? 'No GameAds.hasProvider() guard found. Unlike before, GameAds is always defined but may have NO provider (e.g. plain web build) and return "unavailable". Guard "watch ad" offers with hasProvider() so you can fall back gracefully.'
              : usesHasProvider
                ? 'GameAds.hasProvider() guard detected.'
                : 'No ad usage detected.',
            usesAds && !usesHasProvider,
          ),
          createCheck(
            'Banner API usage (optional)',
            true,
            usesBanner
              ? 'Banner show/hide calls detected. On the Android shell the banner shows by default; use toggles only during fullscreen menus/cutscenes.'
              : 'No banner toggles detected. This is fine — the banner shows automatically when configured.',
            false,
          ),
        ],
      },
    ];

    return { categories };
  }
}
