import type { Validator, ValidationResult, ValidationCategory, ValidationCheck } from './types';

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

export class YandexGamesValidator implements Validator {
  validate(content: string, fileSize: number): ValidationResult {
    const hasSdkScriptReference = hasMatch(
      content,
      /(?:<script[^>]+src\s*=\s*['"](?:\/sdk\.js|https:\/\/sdk\.games\.s3\.yandex\.net\/sdk\.js)['"]|sdk\.games\.s3\.yandex\.net\/sdk\.js|\/sdk\.js)/i,
    );
    const hasYaGamesInit = hasMatch(content, /\bYaGames\s*\.\s*init\s*\(/);
    const hasLoadingReady = hasMatch(content, /\bfeatures\s*\.\s*LoadingAPI(?:\s*\?\.)?\s*\.\s*ready\s*\(/);
    const hasGameplayStart = hasMatch(content, /\bfeatures\s*\.\s*GameplayAPI(?:\s*\?\.)?\s*\.\s*start\s*\(/);
    const hasGameplayStop = hasMatch(content, /\bfeatures\s*\.\s*GameplayAPI(?:\s*\?\.)?\s*\.\s*stop\s*\(/);
    const hasPauseHandler = hasMatch(content, /\b[\w$]+\s*\.\s*on\s*\(\s*['"]game_api_pause['"]/);
    const hasResumeHandler = hasMatch(content, /\b[\w$]+\s*\.\s*on\s*\(\s*['"]game_api_resume['"]/);

    const usesFullscreenAdv = hasMatch(content, /\badv\s*\.\s*showFullscreenAdv\s*\(/);
    const usesRewardedVideo = hasMatch(content, /\badv\s*\.\s*showRewardedVideo\s*\(/);
    const usesAds = usesFullscreenAdv || usesRewardedVideo;
    const hasOnOpen = hasMatch(content, /\bonOpen\s*:/);
    const hasOnClose = hasMatch(content, /\bonClose\s*:/);
    const hasOnError = hasMatch(content, /\bonError\s*:/);
    const hasOnRewarded = hasMatch(content, /\bonRewarded\s*:/);

    const usesPayments = hasMatch(content, /\bpayments\s*\.\s*purchase\s*\(/);
    const usesGetPayments = hasMatch(content, /\bgetPayments\s*\(/);
    const hasGetPurchases = hasMatch(content, /\bpayments\s*\.\s*getPurchases\s*\(/);
    const hasConsumePurchase = hasMatch(content, /\bpayments\s*\.\s*consumePurchase\s*\(/);
    const hasGetCatalog = hasMatch(content, /\bpayments\s*\.\s*getCatalog\s*\(/);

    const usesLeaderboards = hasMatch(content, /\bleaderboards\s*\./);
    const usesDeprecatedLeaderboards = hasMatch(content, /\bgetLeaderboards\s*\(/);
    const usesLeaderboardSetScore = hasMatch(content, /\bleaderboards\s*\.\s*setScore\s*\(/);
    const usesLeaderboardGetPlayerEntry = hasMatch(content, /\bleaderboards\s*\.\s*getPlayerEntry\s*\(/);
    const hasSetScoreAvailabilityCheck = hasMatch(content, /\bisAvailableMethod\s*\(\s*['"]leaderboards\.setScore['"]/);
    const hasGetPlayerEntryAvailabilityCheck = hasMatch(content, /\bisAvailableMethod\s*\(\s*['"]leaderboards\.getPlayerEntry['"]/);

    const categories: ValidationCategory[] = [
      {
        name: 'Yandex Games SDK',
        checks: [
          createCheck(
            'SDK initialized with YaGames.init()',
            hasYaGamesInit,
            hasYaGamesInit ? undefined : 'YaGames.init() not found. SDK initialization is mandatory for moderation.',
          ),
          createCheck(
            'SDK loader reference present',
            hasSdkScriptReference,
            hasSdkScriptReference
              ? 'Found /sdk.js or the official Yandex CDN reference.'
              : 'No sdk.js reference found. This can be valid only if you dynamically load sdk.js elsewhere.',
            !hasSdkScriptReference,
          ),
          createCheck(
            'LoadingAPI.ready() called',
            hasLoadingReady,
            hasLoadingReady ? undefined : 'LoadingAPI.ready() was not detected. Yandex requires this when the game becomes interactive.',
          ),
          createCheck(
            'Local file size looks safe for preview',
            fileSize <= 100 * 1024 * 1024,
            `Current file size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB. Yandex limit is 100MB unpacked.`,
            fileSize <= 100 * 1024 * 1024,
          ),
        ],
      },
      {
        name: 'Lifecycle & Pause Handling',
        checks: [
          createCheck(
            'game_api_pause handler detected',
            hasPauseHandler,
            hasPauseHandler
              ? undefined
              : 'No game_api_pause subscription found. Use it to pause audio/gameplay on ads, purchases, tab blur and startup ads.',
            !hasPauseHandler,
          ),
          createCheck(
            'game_api_resume handler detected',
            hasResumeHandler,
            hasResumeHandler
              ? undefined
              : 'No game_api_resume subscription found. Use it to resume the game after ads, purchases or returning to the tab.',
            !hasResumeHandler,
          ),
          createCheck(
            'GameplayAPI.start() marker detected',
            hasGameplayStart,
            hasGameplayStart ? undefined : 'GameplayAPI.start() not found. Optional, but recommended when you explicitly mark active gameplay periods.',
            !hasGameplayStart,
          ),
          createCheck(
            'GameplayAPI.stop() marker detected',
            hasGameplayStop,
            hasGameplayStop ? undefined : 'GameplayAPI.stop() not found. Optional, but recommended when you explicitly mark pauses, menus or ad breaks.',
            !hasGameplayStop,
          ),
        ],
      },
      {
        name: 'Ads',
        checks: [
          createCheck(
            'Fullscreen and rewarded ads use Yandex SDK',
            !usesAds || usesFullscreenAdv || usesRewardedVideo,
            usesAds ? 'Ad calls are routed through ysdk.adv.' : 'No Yandex fullscreen or rewarded ad calls detected.',
          ),
          createCheck(
            'Fullscreen/rewarded flow handles open/close/error callbacks',
            !usesAds || (hasOnOpen && hasOnClose && hasOnError),
            !usesAds
              ? 'No fullscreen or rewarded ad API usage detected.'
              : 'Expected ad callbacks onOpen/onClose/onError were not all detected near the Yandex ad flow.',
            usesAds && !(hasOnOpen && hasOnClose && hasOnError),
          ),
          createCheck(
            'Rewarded video grants reward in onRewarded()',
            !usesRewardedVideo || hasOnRewarded,
            usesRewardedVideo && !hasOnRewarded
              ? 'showRewardedVideo() detected without onRewarded callback. Rewarded ads should grant the reward only inside onRewarded().' 
              : usesRewardedVideo
                ? 'Rewarded callback detected.'
                : 'No rewarded video API usage detected.',
          ),
          createCheck(
            'Pause/resume logic exists for fullscreen interruptions',
            !usesAds || ((hasPauseHandler && hasResumeHandler) || (hasGameplayStart && hasGameplayStop)),
            !usesAds
              ? 'No fullscreen interruption flows detected.'
              : 'Ads require pausing gameplay and audio. Add game_api_pause/game_api_resume handlers or explicit GameplayAPI.start()/stop() markers.',
            usesAds && !((hasPauseHandler && hasResumeHandler) || (hasGameplayStart && hasGameplayStop)),
          ),
        ],
      },
      {
        name: 'Purchases',
        checks: [
          createCheck(
            'Purchases go through Yandex payments API',
            !usesPayments || usesGetPayments || hasMatch(content, /\bpayments\s*\./),
            usesPayments ? 'Purchase flow detected through ysdk.payments.' : 'No in-app purchase flow detected.',
          ),
          createCheck(
            'Unprocessed purchases are checked with getPurchases()',
            !usesPayments || hasGetPurchases,
            usesPayments && !hasGetPurchases
              ? 'payments.purchase() detected without payments.getPurchases(). Recovery of unprocessed purchases is mandatory for moderation.'
              : usesPayments
                ? 'getPurchases() detected.'
                : 'No in-app purchase flow detected.',
          ),
          createCheck(
            'Consumable purchases are consumed with consumePurchase()',
            !usesPayments || hasConsumePurchase,
            usesPayments && !hasConsumePurchase
              ? 'consumePurchase() was not detected. This is valid only if all products are non-consumable.'
              : usesPayments
                ? 'consumePurchase() detected.'
                : 'No in-app purchase flow detected.',
            usesPayments && !hasConsumePurchase,
          ),
          createCheck(
            'Catalog is fetched from SDK for titles/currency',
            !usesPayments || hasGetCatalog,
            usesPayments && !hasGetCatalog
              ? 'getCatalog() was not detected. Use it to get localized product data and portal currency metadata from the SDK.'
              : usesPayments
                ? 'getCatalog() detected.'
                : 'No in-app purchase flow detected.',
            usesPayments && !hasGetCatalog,
          ),
        ],
      },
      {
        name: 'Leaderboards',
        checks: [
          createCheck(
            'Leaderboards API usage detected through ysdk.leaderboards',
            !usesLeaderboards || !usesDeprecatedLeaderboards,
            usesDeprecatedLeaderboards
              ? 'ysdk.getLeaderboards() is deprecated. Use ysdk.leaderboards directly.'
              : usesLeaderboards
                ? 'Leaderboards API detected.'
                : 'No leaderboards API usage detected.',
            usesDeprecatedLeaderboards,
          ),
          createCheck(
            'setScore availability checked with isAvailableMethod()',
            !usesLeaderboardSetScore || hasSetScoreAvailabilityCheck,
            usesLeaderboardSetScore && !hasSetScoreAvailabilityCheck
              ? 'Before leaderboards.setScore(), Yandex recommends checking ysdk.isAvailableMethod(\'leaderboards.setScore\').' 
              : usesLeaderboardSetScore
                ? 'Availability check for setScore() detected.'
                : 'No leaderboard score submission detected.',
            usesLeaderboardSetScore && !hasSetScoreAvailabilityCheck,
          ),
          createCheck(
            'getPlayerEntry availability checked with isAvailableMethod()',
            !usesLeaderboardGetPlayerEntry || hasGetPlayerEntryAvailabilityCheck,
            usesLeaderboardGetPlayerEntry && !hasGetPlayerEntryAvailabilityCheck
              ? 'Before leaderboards.getPlayerEntry(), Yandex recommends checking ysdk.isAvailableMethod(\'leaderboards.getPlayerEntry\').' 
              : usesLeaderboardGetPlayerEntry
                ? 'Availability check for getPlayerEntry() detected.'
                : 'No direct player leaderboard lookup detected.',
            usesLeaderboardGetPlayerEntry && !hasGetPlayerEntryAvailabilityCheck,
          ),
        ],
      },
    ];

    return { categories };
  }
}