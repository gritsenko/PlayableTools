/* Simple Yandex Games SDK shim for preview/testing purposes.
   - Exposes YaGames.init() and a mock SDK instance.
   - Simulates LoadingAPI/GamePlayAPI lifecycle calls.
   - Simulates ads, purchases, leaderboards, player data and SDK events.
   - Emits game_api_pause/game_api_resume on fullscreen interruptions.
   - Posts all activity to the parent frame so PlayableTools can show it in SDK Event Log.
*/
(function () {
  if (window.YaGames && window.YaGames.__previewShimInstalled) {
    console.warn('[Yandex Games Preview] sdk.js already defined, skipping shim');
    return;
  }

  var PREFIX = '[Yandex Games Preview]';
  var startTime = null;
  var previewUserId = 'preview-player';
  var bannerVisible = false;
  var playerAuthorized = true;
  var playerData = {};
  var playerStats = {};
  var safeStorageState = Object.create(null);
  var listenerMap = Object.create(null);
  var purchaseCounter = 0;
  var leaderboardState = Object.create(null);
  var previewLanguage = 'ru';

  function getContextLanguage() {
    try {
      var context = window.__PLAYABLETOOLS_PREVIEW_CONTEXT || {};
      if (typeof context.language === 'string' && context.language.trim()) {
        return context.language.trim().toLowerCase();
      }
    } catch (err) {}

    try {
      if (typeof window.__PLAYABLETOOLS_PREVIEW_LANGUAGE === 'string' && window.__PLAYABLETOOLS_PREVIEW_LANGUAGE.trim()) {
        return window.__PLAYABLETOOLS_PREVIEW_LANGUAGE.trim().toLowerCase();
      }
    } catch (err) {}

    return null;
  }

  function getActiveLanguage() {
    return getContextLanguage() || previewLanguage;
  }

  function setActiveLanguage(nextLanguage) {
    if (typeof nextLanguage !== 'string' || !nextLanguage.trim()) {
      return previewLanguage;
    }

    previewLanguage = nextLanguage.trim().toLowerCase();

    try {
      var currentContext = window.__PLAYABLETOOLS_PREVIEW_CONTEXT || {};
      window.__PLAYABLETOOLS_PREVIEW_CONTEXT = Object.assign({}, currentContext, { language: previewLanguage });
    } catch (err) {}

    try {
      window.__PLAYABLETOOLS_PREVIEW_LANGUAGE = previewLanguage;
    } catch (err) {}

    post('preview.setLanguage', [previewLanguage]);
    return previewLanguage;
  }

  function defineLanguageProperty(target, propertyName) {
    Object.defineProperty(target, propertyName, {
      configurable: true,
      enumerable: true,
      get: function () {
        return getActiveLanguage();
      }
    });
  }

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

  function error() {
    console.error.apply(console, [PREFIX].concat([].slice.call(arguments)));
  }

  function safeCall(fn) {
    if (typeof fn !== 'function') return;
    try {
      return fn.apply(null, [].slice.call(arguments, 1));
    } catch (err) {
      error('callback failed', err);
    }
  }

  function post(event, args) {
    var payload = {
      type: 'sdk-event',
      source: 'yandex-games',
      event: event,
      args: args || [],
      ts: Date.now(),
      elapsedMs: elapsed(),
    };

    try {
      window.parent.postMessage(payload, '*');
    } catch (err) {
      warn('parent postMessage failed', err);
    }

    try {
      window.postMessage(payload, '*');
    } catch (err) {
      warn('local postMessage failed', err);
    }
  }

  function addListener(eventName, listener) {
    if (typeof listener !== 'function') {
      return function () {};
    }

    listenerMap[eventName] = listenerMap[eventName] || [];
    listenerMap[eventName].push(listener);
    log('on', eventName, listener.name || '<anonymous>');

    return function unsubscribe() {
      removeListener(eventName, listener);
    };
  }

  function removeListener(eventName, listener) {
    if (!listenerMap[eventName]) return;

    if (!listener) {
      listenerMap[eventName] = [];
      return;
    }

    listenerMap[eventName] = listenerMap[eventName].filter(function (registered) {
      return registered !== listener;
    });
    log('off', eventName, listener.name || '<anonymous>');
  }

  function emit(eventName, detail) {
    post(eventName, detail === undefined ? [] : [detail]);
    var listeners = listenerMap[eventName] || [];

    listeners.slice().forEach(function (listener) {
      safeCall(listener, detail);
    });
  }

  function transparentPng() {
    return 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
  }

  function currencyImage() {
    return transparentPng();
  }

  setActiveLanguage(getContextLanguage() || previewLanguage);

  var products = [
    {
      id: 'gold500',
      title: '500 Gold',
      description: 'Preview consumable purchase',
      imageURI: transparentPng(),
      price: '49 YAN',
      priceValue: '49',
      priceCurrencyCode: 'YAN',
      getPriceCurrencyImage: function () {
        return currencyImage();
      }
    },
    {
      id: 'disable_ads',
      title: 'Disable Ads',
      description: 'Preview permanent purchase',
      imageURI: transparentPng(),
      price: '99 YAN',
      priceValue: '99',
      priceCurrencyCode: 'YAN',
      getPriceCurrencyImage: function () {
        return currencyImage();
      }
    }
  ];

  var purchases = [];

  function buildSignature(data) {
    try {
      return 'preview-signature.' + btoa(JSON.stringify(data));
    } catch (err) {
      return 'preview-signature';
    }
  }

  function createPurchaseRecord(id, developerPayload) {
    purchaseCounter += 1;

    var purchase = {
      productID: id,
      purchaseToken: 'preview-purchase-' + purchaseCounter,
      developerPayload: developerPayload || '',
    };

    purchase.signature = buildSignature({
      data: {
        token: purchase.purchaseToken,
        status: 'waiting',
        developerPayload: purchase.developerPayload,
        product: {
          id: purchase.productID,
        }
      }
    });

    return purchase;
  }

  function createPlayerApi() {
    return {
      getMode: function () {
        return 'lite';
      },
      isAuthorized: function () {
        return playerAuthorized;
      },
      getUniqueID: function () {
        return previewUserId;
      },
      getName: function () {
        return 'Preview Player';
      },
      getAvatarSrc: function () {
        return transparentPng();
      },
      getPhoto: function () {
        return transparentPng();
      },
      getAvatarSrcSet: function () {
        return transparentPng();
      },
      getData: function (keys) {
        post('player.getData', [keys || null]);
        if (!Array.isArray(keys) || keys.length === 0) {
          return Promise.resolve(Object.assign({}, playerData));
        }

        var filteredData = {};
        keys.forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(playerData, key)) {
            filteredData[key] = playerData[key];
          }
        });
        return Promise.resolve(filteredData);
      },
      setData: function (data) {
        playerData = Object.assign({}, playerData, data || {});
        post('player.setData', [data || {}]);
        return Promise.resolve();
      },
      getStats: function (keys) {
        post('player.getStats', [keys || null]);
        if (!Array.isArray(keys) || keys.length === 0) {
          return Promise.resolve(Object.assign({}, playerStats));
        }

        var filteredStats = {};
        keys.forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(playerStats, key)) {
            filteredStats[key] = playerStats[key];
          }
        });
        return Promise.resolve(filteredStats);
      },
      setStats: function (data) {
        playerStats = Object.assign({}, playerStats, data || {});
        post('player.setStats', [data || {}]);
        return Promise.resolve();
      },
      incrementStats: function (delta) {
        Object.keys(delta || {}).forEach(function (key) {
          var current = typeof playerStats[key] === 'number' ? playerStats[key] : 0;
          playerStats[key] = current + Number(delta[key] || 0);
        });
        post('player.incrementStats', [delta || {}]);
        return Promise.resolve(Object.assign({}, playerStats));
      },
      getSignature: function () {
        return Promise.resolve('preview-player-signature');
      }
    };
  }

  function createSafeStorageApi() {
    var storageApi = {
      get length() {
        return Object.keys(safeStorageState).length;
      },
      getItem: function (key) {
        var normalizedKey = String(key);
        return Object.prototype.hasOwnProperty.call(safeStorageState, normalizedKey)
          ? safeStorageState[normalizedKey]
          : null;
      },
      setItem: function (key, value) {
        safeStorageState[String(key)] = String(value);
      },
      removeItem: function (key) {
        delete safeStorageState[String(key)];
      },
      clear: function () {
        safeStorageState = Object.create(null);
      },
      key: function (index) {
        var keys = Object.keys(safeStorageState);
        return keys[index] || null;
      },
    };

    return storageApi;
  }

  function createLeaderboardEntry(name, publicName, uniqueID, score, extraData) {
    return {
      extraData: extraData || '',
      rank: 0,
      score: score,
      player: {
        publicName: publicName,
        uniqueID: uniqueID,
        getAvatarSrc: function () {
          return transparentPng();
        },
        getAvatarSrcSet: function () {
          return transparentPng();
        }
      },
      leaderboardName: name,
    };
  }

  function ensureLeaderboard(name) {
    if (!leaderboardState[name]) {
      leaderboardState[name] = [
        createLeaderboardEntry(name, 'Alice', 'alice', 4500, 'Top player'),
        createLeaderboardEntry(name, 'Bob', 'bob', 3200, 'Second place'),
        createLeaderboardEntry(name, 'Cara', 'cara', 2400, 'Third place'),
      ];
    }

    leaderboardState[name].sort(function (left, right) {
      return right.score - left.score;
    });

    leaderboardState[name].forEach(function (entry, index) {
      entry.rank = index;
    });

    return leaderboardState[name];
  }

  function getLeaderboardDescription(name) {
    return {
      appID: 'preview-app',
      default: false,
      description: {
        invert_sort_order: false,
        score_format: {
          options: {
            decimal_offset: 0,
          },
          type: 'numeric',
        },
        sort_order: 'desc',
      },
      name: name,
      title: {
        ru: name,
        en: name,
      },
    };
  }

  function createEnvironmentApi() {
    var i18n = {
      getLang: function () {
        return getActiveLanguage();
      },
      t: function (key) {
        return String(key);
      }
    };
    var browser = {};
    var app = {};
    var environment = {
      i18n: i18n,
      browser: browser,
      app: app,
    };

    defineLanguageProperty(i18n, 'lang');
    defineLanguageProperty(i18n, 'language');
    defineLanguageProperty(browser, 'lang');
    defineLanguageProperty(browser, 'language');
    defineLanguageProperty(app, 'lang');
    defineLanguageProperty(app, 'language');
    defineLanguageProperty(environment, 'lang');
    defineLanguageProperty(environment, 'language');

    return environment;
  }

  var player = createPlayerApi();

  var features = {
    LoadingAPI: {
      ready: function () {
        post('features.LoadingAPI.ready', []);
        try {
          window.parent.postMessage({ type: 'sdk-session-start', source: 'yandex-games', ts: Date.now(), elapsedMs: elapsed() }, '*');
        } catch (err) {}
        return Promise.resolve();
      }
    },
    GameplayAPI: {
      start: function () {
        post('features.GameplayAPI.start', []);
        return Promise.resolve();
      },
      stop: function () {
        post('features.GameplayAPI.stop', []);
        return Promise.resolve();
      }
    }
  };

  function simulateFullscreenFlow(eventName, callbacks, options) {
    var config = options || {};
    emit('game_api_pause', { source: eventName });
    safeCall(callbacks && callbacks.onOpen);
    post(eventName + '.onOpen', []);

    setTimeout(function () {
      if (config.rewarded) {
        safeCall(callbacks && callbacks.onRewarded);
        post(eventName + '.onRewarded', []);
      }

      safeCall(callbacks && callbacks.onClose, true);
      post(eventName + '.onClose', [true]);
      emit('game_api_resume', { source: eventName });
    }, config.delay || 250);
  }

  var adv = {
    showFullscreenAdv: function (options) {
      post('adv.showFullscreenAdv', []);
      simulateFullscreenFlow('adv.showFullscreenAdv', options && options.callbacks, { delay: 250 });
    },
    showRewardedVideo: function (options) {
      post('adv.showRewardedVideo', []);
      simulateFullscreenFlow('adv.showRewardedVideo', options && options.callbacks, { delay: 300, rewarded: true });
    },
    getBannerAdvStatus: function () {
      post('adv.getBannerAdvStatus', [bannerVisible]);
      return Promise.resolve({
        stickyAdvIsShowing: bannerVisible,
      });
    },
    showBannerAdv: function () {
      bannerVisible = true;
      post('adv.showBannerAdv', []);
      return Promise.resolve({
        stickyAdvIsShowing: true,
      });
    },
    hideBannerAdv: function () {
      bannerVisible = false;
      post('adv.hideBannerAdv', []);
      return Promise.resolve({
        stickyAdvIsShowing: false,
      });
    }
  };

  var payments = {
    purchase: function (data) {
      var request = data || {};
      post('payments.purchase', [request]);
      emit('game_api_pause', { source: 'payments.purchase' });

      return new Promise(function (resolve) {
        setTimeout(function () {
          var purchase = createPurchaseRecord(request.id || 'preview-item', request.developerPayload || '');
          purchases.push(purchase);
          post('payments.purchase.success', [purchase]);
          emit('game_api_resume', { source: 'payments.purchase' });
          resolve(Object.assign({}, purchase));
        }, 250);
      });
    },
    getPurchases: function () {
      post('payments.getPurchases', [purchases.length]);
      return Promise.resolve(purchases.map(function (purchase) {
        return Object.assign({}, purchase);
      }));
    },
    getCatalog: function () {
      post('payments.getCatalog', [products.length]);
      return Promise.resolve(products.map(function (product) {
        return Object.assign({}, product);
      }));
    },
    consumePurchase: function (purchaseToken) {
      post('payments.consumePurchase', [purchaseToken]);
      purchases = purchases.filter(function (purchase) {
        return purchase.purchaseToken !== purchaseToken;
      });
      return Promise.resolve();
    }
  };

  var leaderboards = {
    getDescription: function (leaderboardName) {
      post('leaderboards.getDescription', [leaderboardName]);
      ensureLeaderboard(leaderboardName);
      return Promise.resolve(getLeaderboardDescription(leaderboardName));
    },
    setScore: function (leaderboardName, score, extraData) {
      post('leaderboards.setScore', [leaderboardName, score, extraData || '']);
      var entries = ensureLeaderboard(leaderboardName);
      var playerEntry = entries.find(function (entry) {
        return entry.player.uniqueID === previewUserId;
      });

      if (!playerEntry) {
        playerEntry = createLeaderboardEntry(leaderboardName, 'Preview Player', previewUserId, 0, extraData || '');
        entries.push(playerEntry);
      }

      playerEntry.score = Math.max(0, Number(score || 0));
      playerEntry.extraData = extraData || '';
      ensureLeaderboard(leaderboardName);

      return Promise.resolve();
    },
    getPlayerEntry: function (leaderboardName) {
      post('leaderboards.getPlayerEntry', [leaderboardName]);
      var entries = ensureLeaderboard(leaderboardName);
      var playerEntry = entries.find(function (entry) {
        return entry.player.uniqueID === previewUserId;
      });

      if (!playerEntry) {
        return Promise.reject({
          code: 'LEADERBOARD_PLAYER_NOT_PRESENT',
          message: 'Preview player has no score yet.',
        });
      }

      return Promise.resolve(Object.assign({}, playerEntry));
    },
    getEntries: function (leaderboardName, options) {
      var config = options || {};
      var quantityTop = Math.max(1, Math.min(20, Number(config.quantityTop || 5)));
      var quantityAround = Math.max(1, Math.min(10, Number(config.quantityAround || 5)));
      var includeUser = !!config.includeUser;
      var entries = ensureLeaderboard(leaderboardName);
      var topEntries = entries.slice(0, quantityTop);
      var combined = topEntries.slice();
      var ranges = [{ start: 0, size: topEntries.length }];
      var userRank = 0;

      if (includeUser) {
        var playerIndex = entries.findIndex(function (entry) {
          return entry.player.uniqueID === previewUserId;
        });

        if (playerIndex >= 0) {
          userRank = playerIndex;
          var aroundStart = Math.max(0, playerIndex - quantityAround);
          var aroundEnd = Math.min(entries.length, playerIndex + quantityAround + 1);
          var aroundEntries = entries.slice(aroundStart, aroundEnd);

          aroundEntries.forEach(function (entry) {
            if (!combined.some(function (existing) {
              return existing.player.uniqueID === entry.player.uniqueID;
            })) {
              combined.push(entry);
            }
          });

          ranges.push({ start: aroundStart, size: aroundEntries.length });
        }
      }

      post('leaderboards.getEntries', [leaderboardName, config]);

      return Promise.resolve({
        leaderboard: getLeaderboardDescription(leaderboardName),
        ranges: ranges,
        userRank: userRank,
        entries: combined.map(function (entry) {
          return Object.assign({}, entry);
        }),
      });
    }
  };

  var safeStorage = createSafeStorageApi();
  var environment = createEnvironmentApi();

  var auth = {
    openAuthDialog: function () {
      playerAuthorized = true;
      post('auth.openAuthDialog', []);
      emit(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_OPENED, {});

      return new Promise(function (resolve) {
        setTimeout(function () {
          emit(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_CLOSED, {});
          resolve({ value: true });
        }, 120);
      });
    }
  };

  var sdk = {
    EVENTS: {
      EXIT: 'EXIT',
      HISTORY_BACK: 'HISTORY_BACK',
      ACCOUNT_SELECTION_DIALOG_OPENED: 'ACCOUNT_SELECTION_DIALOG_OPENED',
      ACCOUNT_SELECTION_DIALOG_CLOSED: 'ACCOUNT_SELECTION_DIALOG_CLOSED',
    },
    features: features,
    adv: adv,
    payments: payments,
    leaderboards: leaderboards,
    player: player,
    auth: auth,
    environment: environment,
    on: function (eventName, listener) {
      return addListener(eventName, listener);
    },
    off: function (eventName, listener) {
      removeListener(eventName, listener);
    },
    dispatchEvent: function (eventName, detail) {
      post('dispatchEvent', [eventName, detail || {}]);
      emit(eventName, detail || {});
      return Promise.resolve();
    },
    dispatchYandexEvent: function (payload) {
      post('dispatchYandexEvent', [payload]);

      if (payload === 'game_start') {
        emit('yandex-event:game_start', {});
        return features.GameplayAPI.start();
      }

      if (payload && typeof payload === 'object' && payload.level_complete) {
        emit('yandex-event:level_complete', payload.level_complete);
      }

      return Promise.resolve();
    },
    isAvailableMethod: function (methodName) {
      post('isAvailableMethod', [methodName]);
      return Promise.resolve(true);
    },
    getStorage: function () {
      post('getStorage', []);
      return Promise.resolve(safeStorage);
    },
    getPayments: function () {
      post('getPayments', []);
      return Promise.resolve(payments);
    },
    getLeaderboards: function () {
      post('getLeaderboards', []);
      return Promise.resolve(leaderboards);
    },
    getEnvironment: function () {
      post('getEnvironment', [getActiveLanguage()]);
      return Promise.resolve(environment);
    },
    getPlayer: function () {
      post('getPlayer', []);
      return Promise.resolve(player);
    },
    openAuthDialog: function () {
      post('openAuthDialog', []);
      return auth.openAuthDialog();
    }
  };

  window.YaGames = {
    __previewShimInstalled: true,
    init: function (options) {
      if (options && typeof options.lang === 'string') {
        setActiveLanguage(options.lang);
      } else if (options && typeof options.language === 'string') {
        setActiveLanguage(options.language);
      }

      post('YaGames.init', [options || {}]);
      return new Promise(function (resolve) {
        setTimeout(function () {
          window.ysdk = sdk;
          resolve(sdk);
        }, 25);
      });
    }
  };

  window.__ysdkPreview = {
    emitPause: function (source) {
      emit('game_api_pause', { source: source || 'manual' });
    },
    emitResume: function (source) {
      emit('game_api_resume', { source: source || 'manual' });
    },
    historyBack: function () {
      emit(sdk.EVENTS.HISTORY_BACK, {});
    },
    exit: function () {
      emit(sdk.EVENTS.EXIT, {});
    },
    accountSelectionDialog: function () {
      emit(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_OPENED, {});
      setTimeout(function () {
        emit(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_CLOSED, {});
      }, 200);
    },
    showFullscreenAdv: function () {
      adv.showFullscreenAdv({ callbacks: {} });
    },
    showRewardedVideo: function () {
      adv.showRewardedVideo({ callbacks: {} });
    },
    purchase: function (id) {
      return payments.purchase({ id: id || 'gold500' });
    },
    setLanguage: function (language) {
      return setActiveLanguage(language);
    },
    setAuthorized: function (value) {
      playerAuthorized = !!value;
      post('preview.setAuthorized', [playerAuthorized]);
    },
    dumpState: function () {
      return {
        previewLanguage: getActiveLanguage(),
        purchases: purchases.slice(),
        leaderboardState: leaderboardState,
        bannerVisible: bannerVisible,
        playerAuthorized: playerAuthorized,
        playerData: Object.assign({}, playerData),
        playerStats: Object.assign({}, playerStats),
      };
    }
  };

  try {
    window.addEventListener('playable-screen-lock', function (e) {
      var detail = e && e.detail ? e.detail : {};
      if (detail.locked) {
        emit('game_api_pause', { source: 'playable-screen-lock' });
      } else {
        emit('game_api_resume', { source: 'playable-screen-lock' });
      }
    });
  } catch (err) {
    warn('failed to register playable-screen-lock listener', err);
  }

  log('shim installed');
})();