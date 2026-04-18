/**
 * Yandex Games SDK Wrapper
 * Подключение: добавьте <script src="/sdk.js"></script> перед этим скриптом
 * Затем добавьте: <script src="yandex-sdk.js"></script>
 */

(function() {
    'use strict';

    // Состояние SDK
    let ysdk = null;
    let player = null;
    let isInitialized = false;

    // Константы
    const LEADERBOARD_NAME = 'block_chpok_scores';
    const STATS_KEY = 'bestScore';
    const DATA_KEY = 'gameData';

    // ============================================
    // Инициализация SDK
    // ============================================

    /**
     * Инициализирует Yandex Games SDK
     * Вызывается автоматически при загрузке страницы
     */
    async function initSDK() {
        if (isInitialized) return;

        try {
            // Ждем, пока YaGames станет доступен
            if (typeof YaGames === 'undefined') {
                console.warn('[Yandex SDK] YaGames не найден. SDK недоступен.');
                return;
            }

            ysdk = await YaGames.init();
            isInitialized = true;
            console.log('[Yandex SDK] Инициализирован');

            // Получаем данные игрока
            await initPlayer();

            // Переопределяем localStorage для iOS
            await setupSafeStorage();

        } catch (error) {
            console.error('[Yandex SDK] Ошибка инициализации:', error);
        }
    }

    /**
     * Инициализирует объект игрока
     */
    async function initPlayer() {
        if (!ysdk) return;

        try {
            player = await ysdk.getPlayer();
            console.log('[Yandex SDK] Игрок получен');
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения игрока:', error);
        }
    }

    /**
     * Настраивает безопасное хранилище для iOS
     */
    async function setupSafeStorage() {
        if (!ysdk) return;

        try {
            const safeStorage = await ysdk.getStorage();
            Object.defineProperty(window, 'localStorage', {
                get: () => safeStorage,
                configurable: false
            });
            console.log('[Yandex SDK] Safe storage установлен');
        } catch (error) {
            console.warn('[Yandex SDK] Safe storage недоступен:', error);
        }
    }

    // ============================================
    // Проверка доступности
    // ============================================

    /**
     * Проверяет, инициализирован ли SDK
     */
    function isAvailable() {
        return isInitialized && ysdk !== null;
    }

    /**
     * Проверяет метод на доступность
     */
    function isMethodAvailable(methodName) {
        if (!ysdk) return false;
        return ysdk.isAvailableMethod(methodName);
    }

    // ============================================
    // Данные игрока
    // ============================================

    /**
     * Проверяет, авторизован ли игрок
     */
    function isPlayerAuthorized() {
        return player && player.isAuthorized ? player.isAuthorized() : false;
    }

    /**
     * Получает имя игрока
     */
    function getPlayerName() {
        return player && player.getName ? player.getName() : null;
    }

    /**
     * Получает URL аватара игрока
     */
    function getPlayerPhoto(size) {
        if (!player || !player.getPhoto) return null;
        return player.getPhoto(size || 'medium');
    }

    /**
     * Получает уникальный ID игрока
     */
    function getPlayerUniqueID() {
        return player && player.getUniqueID ? player.getUniqueID() : null;
    }

    /**
     * Открывает диалог авторизации
     */
    async function openAuthDialog() {
        if (!ysdk) return false;

        try {
            await ysdk.auth.openAuthDialog();
            // Переинициализируем игрока после авторизации
            await initPlayer();
            return true;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка авторизации:', error);
            return false;
        }
    }

    // ============================================
    // Статистика (численные данные)
    // ============================================

    /**
     * Сохраняет статистику (численные данные)
     */
    async function setStats(stats) {
        if (!player || !player.setStats) return false;

        try {
            await player.setStats(stats);
            return true;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка сохранения статистики:', error);
            return false;
        }
    }

    /**
     * Получает статистику
     */
    async function getStats(keys) {
        if (!player || !player.getStats) return {};

        try {
            return await player.getStats(keys);
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения статистики:', error);
            return {};
        }
    }

    /**
     * Увеличивает статистику
     */
    async function incrementStats(increments) {
        if (!player || !player.incrementStats) return {};

        try {
            return await player.incrementStats(increments);
        } catch (error) {
            console.error('[Yandex SDK] Ошибка увеличения статистики:', error);
            return {};
        }
    }

    /**
     * Сохраняет лучший счет
     */
    async function saveBestScore(score) {
        return await setStats({ [STATS_KEY]: score });
    }

    /**
     * Получает лучший счет
     */
    async function getBestScore() {
        const stats = await getStats([STATS_KEY]);
        return stats[STATS_KEY] || 0;
    }

    // ============================================
    // Внутриигровые данные
    // ============================================

    /**
     * Сохраняет внутриигровые данные
     */
    async function setGameData(data, flush) {
        if (!player || !player.setData) return false;

        try {
            await player.setData(data, flush || false);
            return true;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка сохранения данных:', error);
            return false;
        }
    }

    /**
     * Получает внутриигровые данные
     */
    async function getGameData(keys) {
        if (!player || !player.getData) return {};

        try {
            return await player.getData(keys);
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения данных:', error);
            return {};
        }
    }

    // ============================================
    // Лидерборды
    // ============================================

    /**
     * Устанавливает счет в лидерборде
     */
    async function setLeaderboardScore(score, extraData) {
        if (!ysdk || !isMethodAvailable('leaderboards.setScore')) return false;

        try {
            await ysdk.leaderboards.setScore(LEADERBOARD_NAME, score, extraData || null);
            return true;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка установки лидерборда:', error);
            return false;
        }
    }

    /**
     * Получает описание лидерборда
     */
    async function getLeaderboardDescription() {
        if (!ysdk) return null;

        try {
            return await ysdk.leaderboards.getDescription(LEADERBOARD_NAME);
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения описания лидерборда:', error);
            return null;
        }
    }

    /**
     * Получает запись игрока в лидерборде
     */
    async function getLeaderboardEntry() {
        if (!ysdk || !isMethodAvailable('leaderboards.getPlayerEntry')) return null;

        try {
            return await ysdk.leaderboards.getPlayerEntry(LEADERBOARD_NAME);
        } catch (error) {
            if (error.code === 'LEADERBOARD_PLAYER_NOT_PRESENT') {
                return null;
            }
            console.error('[Yandex SDK] Ошибка получения записи:', error);
            return null;
        }
    }

    /**
     * Получает список записей лидерборда
     */
    async function getLeaderboardEntries(options) {
        if (!ysdk) return null;

        try {
            const defaultOptions = {
                quantityTop: 10,
                includeUser: true,
                quantityAround: 3
            };
            const opts = Object.assign({}, defaultOptions, options);
            return await ysdk.leaderboards.getEntries(LEADERBOARD_NAME, opts);
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения записей:', error);
            return null;
        }
    }

    // ============================================
    // Реклама
    // ============================================

    /**
     * Показывает полноэкранную рекламу
     */
    function showFullscreenAdv(callbacks) {
        if (!ysdk) {
            if (callbacks && callbacks.onError) {
                callbacks.onError({ message: 'SDK не инициализирован' });
            }
            return;
        }

        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onOpen: callbacks && callbacks.onOpen || function() {},
                onClose: callbacks && callbacks.onClose || function(wasShown) {},
                onError: callbacks && callbacks.onError || function(error) {}
            }
        });
    }

    /**
     * Показывает видеорекламу с вознаграждением
     */
    function showRewardedVideo(callbacks) {
        if (!ysdk) {
            if (callbacks && callbacks.onError) {
                callbacks.onError({ message: 'SDK не инициализирован' });
            }
            return;
        }

        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: callbacks && callbacks.onOpen || function() {},
                onRewarded: callbacks && callbacks.onRewarded || function() {},
                onClose: callbacks && callbacks.onClose || function(wasShown) {},
                onError: callbacks && callbacks.onError || function(error) {}
            }
        });
    }

    /**
     * Показывает стики-баннер
     */
    async function showBannerAdv() {
        if (!ysdk) return false;

        try {
            const result = await ysdk.adv.showBannerAdv();
            return result.stickyAdvIsShowing;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка показа баннера:', error);
            return false;
        }
    }

    /**
     * Скрывает стики-баннер
     */
    async function hideBannerAdv() {
        if (!ysdk) return false;

        try {
            const result = await ysdk.adv.hideBannerAdv();
            return !result.stickyAdvIsShowing;
        } catch (error) {
            console.error('[Yandex SDK] Ошибка скрытия баннера:', error);
            return false;
        }
    }

    /**
     * Получает статус стики-баннера
     */
    async function getBannerAdvStatus() {
        if (!ysdk) return { stickyAdvIsShowing: false, reason: 'SDK_NOT_INITIALIZED' };

        try {
            return await ysdk.adv.getBannerAdvStatus();
        } catch (error) {
            console.error('[Yandex SDK] Ошибка получения статуса баннера:', error);
            return { stickyAdvIsShowing: false, reason: 'UNKNOWN' };
        }
    }

    // ============================================
    // События
    // ============================================

    /**
     * Отправляет событие начала игры
     */
    function dispatchGameStartEvent() {
        if (ysdk && ysdk.dispatchYandexEvent) {
            ysdk.dispatchYandexEvent('game_start');
        }
    }

    /**
     * Отправляет событие завершения уровня
     */
    function dispatchLevelCompleteEvent(level) {
        if (ysdk && ysdk.dispatchYandexEvent) {
            ysdk.dispatchYandexEvent({ level_complete: { level: level } });
        }
    }

    // ============================================
    // Публичный API
    // ============================================

    window.YandexSDK = {
        // Инициализация
        init: initSDK,
        isAvailable: isAvailable,
        isInitialized: function() { return isInitialized; },

        // Игрок
        isAuthorized: isPlayerAuthorized,
        getPlayerName: getPlayerName,
        getPlayerPhoto: getPlayerPhoto,
        getPlayerUniqueID: getPlayerUniqueID,
        openAuthDialog: openAuthDialog,

        // Статистика
        setStats: setStats,
        getStats: getStats,
        incrementStats: incrementStats,
        saveBestScore: saveBestScore,
        getBestScore: getBestScore,

        // Данные
        setGameData: setGameData,
        getGameData: getGameData,

        // Лидерборды
        setLeaderboardScore: setLeaderboardScore,
        getLeaderboardDescription: getLeaderboardDescription,
        getLeaderboardEntry: getLeaderboardEntry,
        getLeaderboardEntries: getLeaderboardEntries,

        // Реклама
        showFullscreenAdv: showFullscreenAdv,
        showRewardedVideo: showRewardedVideo,
        showBannerAdv: showBannerAdv,
        hideBannerAdv: hideBannerAdv,
        getBannerAdvStatus: getBannerAdvStatus,

        // События
        dispatchGameStartEvent: dispatchGameStartEvent,
        dispatchLevelCompleteEvent: dispatchLevelCompleteEvent,

        // Константы
        LEADERBOARD_NAME: LEADERBOARD_NAME,
        STATS_KEY: STATS_KEY,
        DATA_KEY: DATA_KEY
    };

    // Автоматическая инициализация при загрузке скрипта SDK
    // Если YaGames уже загружен, инициализируем сразу
    if (typeof YaGames !== 'undefined') {
        initSDK();
    } else {
        // Ждем загрузки SDK
        window.addEventListener('load', function() {
            // Пробуем инициализировать после небольшой задержки
            setTimeout(initSDK, 100);
        });
    }

    console.log('[Yandex SDK] Скрипт загружен');

})();