// Блокируем выделение текста, контекстное меню и drag-and-drop изображений
// (требования платформы 1.6.1.8 / 1.6.2.7).
(function suppressNativeInteractionGestures() {
    const stop = function(event) {
        event.preventDefault();
    };
    window.addEventListener('contextmenu', stop, { passive: false });
    window.addEventListener('selectstart', stop, { passive: false });
    window.addEventListener('dragstart', stop, { passive: false });
    document.addEventListener('gesturestart', stop, { passive: false });
})();

// --- AUDIO MANAGER (Web Audio API) ---
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.buffers = {};
        this.isInitialized = false;
        this.soundsEnabled = true;
        this.hasStartedSession = false;
        this.assetCacheName = 'block-chpok-audio-v1';
        this.soundConfigs = {
            pick: { file: 'pick.mp3', volume: 0.4 },
            click: { file: 'click.mp3', volume: 0.3 },
            pop: { file: 'pop1.mp3', volume: 0.5 },
            line: { file: 'line.mp3', volume: 0.6 },
            hardPop: { file: 'hard_pop.mp3', volume: 0.7 }
        };
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        return this.audioContext;
    }

    async fetchAudioArrayBuffer(fileName, cacheName) {
        const assetUrl = new URL(fileName, window.location.href).href;

        if ('caches' in window) {
            const cache = await caches.open(cacheName);
            let response = await cache.match(assetUrl);

            if (!response) {
                response = await fetch(assetUrl, { cache: 'force-cache' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                cache.put(assetUrl, response.clone()).catch(() => {});
            }

            return response.arrayBuffer();
        }

        const response = await fetch(assetUrl, { cache: 'force-cache' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.arrayBuffer();
    }

    async init() {
        if (this.isInitialized || !this.soundsEnabled) return;

        try {
            await this.ensureAudioContext();

            const loadPromises = Object.entries(this.soundConfigs).map(([key, config]) => {
                return this.loadSound(key, config.file);
            });

            await Promise.all(loadPromises);
            this.isInitialized = true;
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }

    async loadSound(name, fileName) {
        try {
            const arrayBuffer = await this.fetchAudioArrayBuffer(fileName, this.assetCacheName);
            this.buffers[name] = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.warn(`Failed to load sound ${name}:`, e);
        }
    }

    async beginGameSession() {
        this.hasStartedSession = true;

        if (!this.soundsEnabled) {
            return;
        }

        try {
            await this.ensureAudioContext();
        } catch (e) {
            console.warn('Audio context startup failed:', e);
        }

        this.init().catch(() => {});
    }

    async suspend() {
        if (!this.audioContext || this.audioContext.state !== 'running') {
            return;
        }

        try {
            await this.audioContext.suspend();
        } catch (e) {
            console.warn('Failed to suspend audio context:', e);
        }
    }

    async resume() {
        if (!this.soundsEnabled || !this.hasStartedSession) {
            return;
        }

        try {
            await this.ensureAudioContext();
            this.init().catch(() => {});
        } catch (e) {
            console.warn('Failed to resume audio context:', e);
        }
    }

    setSoundEnabled(enabled) {
        this.soundsEnabled = enabled;

        if (!enabled) {
            this.suspend().catch(() => {});
            return;
        }

        if (this.hasStartedSession) {
            this.resume().catch(() => {});
        }
    }

    play(soundName) {
        if (!this.soundsEnabled) {
            return;
        }

        if (!this.isInitialized) {
            this.init().catch(() => {});
            return;
        }

        if (!this.buffers[soundName]) return;

        try {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {});
            }

            const buffer = this.buffers[soundName];
            const config = this.soundConfigs[soundName];
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.value = config.volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } catch (e) {
            console.warn(`Failed to play sound ${soundName}:`, e);
        }
    }
}

const audioManager = new AudioManager();

// --- HAPTIC FEEDBACK SYSTEM ---
const canUseMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
const isCoarsePointerDevice = canUseMatchMedia && window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = canUseMatchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reportedHardwareConcurrency = typeof navigator !== 'undefined' && Number.isFinite(navigator.hardwareConcurrency)
    ? navigator.hardwareConcurrency
    : 8;
const reportedDeviceMemory = typeof navigator !== 'undefined' && typeof navigator.deviceMemory === 'number'
    ? navigator.deviceMemory
    : 8;
const supportsHaptics = typeof window !== 'undefined'
    && (isCoarsePointerDevice || /iPhone|iPad|iPod/.test(navigator.userAgent));
const isLowPerfParticleMode = prefersReducedMotion
    || (isCoarsePointerDevice && (reportedHardwareConcurrency <= 6 || reportedDeviceMemory <= 4));

const hapticFallbackState = {
    labelEl: null,
    inputEl: null,
    lastX: 0,
    lastY: 0,
    hideTimeoutId: null
};

function ensureHapticFallbackElement() {
    if (!supportsHaptics || typeof document === 'undefined') return null;
    if (hapticFallbackState.labelEl && hapticFallbackState.inputEl) {
        return hapticFallbackState;
    }

    const labelEl = document.createElement('label');
    labelEl.ariaHidden = 'true';
    labelEl.style.cssText = 'position:fixed;top:0;left:0;width:22px;height:22px;opacity:0.015;pointer-events:auto;z-index:2147483647;transform:translate3d(-100px,-100px,0);margin:0;padding:0;border:0;background:transparent;overflow:hidden;touch-action:none;';

    const inputEl = document.createElement('input');
    inputEl.type = 'checkbox';
    inputEl.setAttribute('switch', '');
    inputEl.tabIndex = -1;
    inputEl.style.cssText = 'width:100%;height:100%;margin:0;opacity:0.01;pointer-events:none;';

    labelEl.appendChild(inputEl);
    document.body.appendChild(labelEl);

    hapticFallbackState.labelEl = labelEl;
    hapticFallbackState.inputEl = inputEl;
    return hapticFallbackState;
}

function moveHapticFallback(x, y) {
    const state = ensureHapticFallbackElement();
    if (!state || !Number.isFinite(x) || !Number.isFinite(y)) return;

    state.lastX = x;
    state.lastY = y;

    const left = Math.round(x - 11);
    const top = Math.round(y - 11);
    state.labelEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
}

function hideHapticFallback() {
    const state = ensureHapticFallbackElement();
    if (!state) return;
    state.labelEl.style.transform = 'translate3d(-100px,-100px,0)';
}

function _haptic(options = null) {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(50);
            return;
        }

        if (!supportsHaptics) return;

        const state = ensureHapticFallbackElement();
        if (!state) return;

        if (options && Number.isFinite(options.x) && Number.isFinite(options.y)) {
            moveHapticFallback(options.x, options.y);
        } else if (Number.isFinite(state.lastX) && Number.isFinite(state.lastY)) {
            moveHapticFallback(state.lastX, state.lastY);
        }

        state.labelEl.click();
    } catch {
        // do nothing
    }
}

_haptic.confirm = (options = null) => {
    if (navigator.vibrate) {
        navigator.vibrate([50, 70, 50]);
        return;
    }

    _haptic(options);
    setTimeout(() => _haptic(options), 120);
};

_haptic.error = () => {
    if (navigator.vibrate) {
        navigator.vibrate([50, 70, 50, 70, 50]);
        return;
    }

    _haptic();
    setTimeout(() => _haptic(), 120);
    setTimeout(() => _haptic(), 240);
};

_haptic.track = (x, y) => {
    if (navigator.vibrate || !supportsHaptics) return;

    if (hapticFallbackState.hideTimeoutId !== null) {
        clearTimeout(hapticFallbackState.hideTimeoutId);
        hapticFallbackState.hideTimeoutId = null;
    }

    moveHapticFallback(x, y);
};

_haptic.release = () => {
    if (navigator.vibrate || !supportsHaptics) return;

    if (hapticFallbackState.hideTimeoutId !== null) {
        clearTimeout(hapticFallbackState.hideTimeoutId);
    }

    hapticFallbackState.hideTimeoutId = setTimeout(() => {
        hideHapticFallback();
        hapticFallbackState.hideTimeoutId = null;
    }, 220);
};

const haptic = _haptic;

// --- ЧАСТИЧНАЯ СИСТЕМА ---
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = null;
        this.gameContainer = document.querySelector('.game-container');
        this.particles = [];
        this.landingParticles = [];
        this.animationFrameId = 0;
        this.lastFrameTime = 0;
        this.config = {
            particleCountScale: isLowPerfParticleMode ? 0.35 : (isCoarsePointerDevice ? 0.5 : 1),
            landingParticleCount: isLowPerfParticleMode ? 1 : 2,
            shadowBlur: isLowPerfParticleMode ? 0 : (isCoarsePointerDevice ? 3 : 6),
            maxParticles: isLowPerfParticleMode ? 56 : (isCoarsePointerDevice ? 84 : 144),
            maxLandingParticles: isLowPerfParticleMode ? 12 : (isCoarsePointerDevice ? 18 : 30)
        };
        
        if (this.canvas && this.gameContainer) {
            this.ctx = this.canvas.getContext('2d', {
                alpha: true
            });
            this.resizeCanvas();
            this.setCanvasVisibility(false);
            
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.gameContainer) return;
        
        // Размеры подстраиваются под весь игровой контейнер
        const containerRect = this.gameContainer.getBoundingClientRect();
        const width = Math.max(1, Math.round(containerRect.width));
        const height = Math.max(1, Math.round(containerRect.height));
        
        // Устанавливаем размеры canvas
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Позиционируем canvas внутри game-container
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }

    getRelativeCanvasPoint(x, y) {
        if (!this.canvas || !this.gameContainer) return null;

        const containerRect = this.gameContainer.getBoundingClientRect();
        const relX = x - containerRect.left;
        const relY = y - containerRect.top;

        if (relX < 0 || relX > this.canvas.width || relY < 0 || relY > this.canvas.height) {
            return null;
        }

        return { x: relX, y: relY };
    }

    trimParticleBuffer(list, maxCount) {
        const overflow = list.length - maxCount;

        if (overflow > 0) {
            list.splice(0, overflow);
        }
    }

    hasActiveParticles() {
        return this.particles.length > 0 || this.landingParticles.length > 0;
    }

    setCanvasVisibility(isVisible) {
        if (!this.canvas) return;

        this.canvas.style.display = isVisible ? 'block' : 'none';
        this.canvas.style.visibility = isVisible ? 'visible' : 'hidden';
        this.canvas.style.opacity = isVisible ? '1' : '0';
    }

    clearCanvas() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        ctx.globalCompositeOperation = 'copy';
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }

    ensureAnimation() {
        if (!this.ctx || this.animationFrameId) return;

        this.setCanvasVisibility(true);
        this.lastFrameTime = 0;
        this.animationFrameId = requestAnimationFrame(timestamp => this.animate(timestamp));
    }
    
    createParticles(x, y, colorStr, particleSize = 14, count = 7, particleType = 'explosion') {
        if (!this.ctx) return;

        const origin = this.getRelativeCanvasPoint(x, y);
        if (!origin) return;
        
        let color;
        if (particleType === 'tray') {
            // Для частиц в трее используем белый цвет
            color = '#ffffff';
        } else {
            const pal = BLOCK_PALETTES[colorStr] || BLOCK_PALETTES[COLORS.purple];
            color = pal.base;
        }
        
        // Адаптируем количество частиц под мобильные устройства
        const particleCount = Math.max(1, Math.round(count * this.config.particleCountScale));
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 60 + 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rot = Math.random() * 360;
            
            // Настройки для частиц в трее
            let adjustedSize = particleSize;
            let adjustedLife = 0.5;
            let adjustedTx = tx;
            let adjustedTy = ty;
            
            if (particleType === 'tray') {
                adjustedSize *= 0.7;  // 0.7x меньше
                adjustedLife *= 0.5;  // 0.5x жизни (быстрее исчезают)
                adjustedTx *= 2;      // 2x быстрее по X
                adjustedTy *= 2;      // 2x быстрее по Y
            }
            
            this.particles.push({
                x: origin.x,
                y: origin.y,
                color: color,
                size: adjustedSize,
                tx: adjustedTx,
                ty: adjustedTy,
                rot: rot,
                life: adjustedLife,
                startLife: adjustedLife,
                type: particleType
            });
        }

        this.trimParticleBuffer(this.particles, this.config.maxParticles);
        this.ensureAnimation();
    }
    
    createLandingParticles(x, y, colorStr, particleType = 'landing') {
        if (!this.ctx) return;

        const origin = this.getRelativeCanvasPoint(x, y);
        if (!origin) return;
        
        let color;
        if (particleType === 'tray') {
            // Для частиц в трее используем белый цвет
            color = '#ffffff';
        } else {
            const pal = BLOCK_PALETTES[colorStr] || BLOCK_PALETTES[COLORS.purple];
            color = pal.base;
        }
        
        // Уменьшенное количество частиц приземления
        for (let i = 0; i < this.config.landingParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 10;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // Настройки для частиц в трее
            let adjustedSize = 12;
            let adjustedOpacity = 0.6;
            let adjustedLife = 0.6;
            let adjustedTx = tx;
            let adjustedTy = ty;
            
            if (particleType === 'tray') {
                adjustedSize *= 0.7;  // 0.7x меньше
                adjustedOpacity *= 0.5;  // 0.5x прозрачнее
                adjustedLife *= 0.5;  // 0.5x жизни (быстрее исчезают)
                adjustedTx *= 2;      // 2x быстрее по X
                adjustedTy *= 2;      // 2x быстрее по Y
            }
            
            this.landingParticles.push({
                x: origin.x,
                y: origin.y,
                color: color,
                size: adjustedSize,
                opacity: adjustedOpacity,
                tx: adjustedTx,
                ty: adjustedTy,
                life: adjustedLife,
                startLife: adjustedLife,
                type: particleType
            });
        }

        this.trimParticleBuffer(this.landingParticles, this.config.maxLandingParticles);
        this.ensureAnimation();
    }
    
    updateParticles(list, deltaSeconds) {
        let writeIndex = 0;

        for (let readIndex = 0; readIndex < list.length; readIndex++) {
            const particle = list[readIndex];
            particle.life -= deltaSeconds;

            if (particle.life > 0) {
                list[writeIndex] = particle;
                writeIndex += 1;
            }
        }

        list.length = writeIndex;
    }

    update(deltaSeconds) {
        this.updateParticles(this.particles, deltaSeconds);
        this.updateParticles(this.landingParticles, deltaSeconds);
    }
    
    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        
        // Очищаем область для перерисовки
        this.clearCanvas();

        if (!this.hasActiveParticles()) {
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            this.setCanvasVisibility(false);
            return;
        }
        
        // Рисуем обычные частицы
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const lifeRatio = particle.life / particle.startLife;
            const progress = 1 - lifeRatio;
            const currentSize = particle.size * (1 - progress);
            const currentOpacity = Math.min(1, lifeRatio);
            
            // Для частиц в трее устанавливаем пониженную прозрачность
            let effectiveOpacity = currentOpacity;
            if (particle.type === 'tray') {
                effectiveOpacity *= 0.5; // 0.5 прозрачнее
            }

            if (currentSize <= 0.35 || effectiveOpacity <= 0.01) {
                continue;
            }
            
            ctx.globalAlpha = effectiveOpacity;
            ctx.fillStyle = particle.color;
            
            // Для частиц в трее уменьшаем размытие тени
            if (this.config.shadowBlur > 0) {
                ctx.shadowColor = particle.color;
                if (particle.type === 'tray') {
                    ctx.shadowBlur = Math.max(1, this.config.shadowBlur * 0.5);
                } else {
                    ctx.shadowBlur = this.config.shadowBlur;
                }
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.beginPath();
            ctx.arc(
                particle.x + particle.tx * progress,
                particle.y + particle.ty * progress,
                currentSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        
        // Рисуем частицы приземления
        for (let i = 0; i < this.landingParticles.length; i++) {
            const particle = this.landingParticles[i];
            const lifeRatio = particle.life / particle.startLife;
            const progress = 1 - lifeRatio;
            const scale = 0.5 + progress * 1.5; // увеличивается от 0.5 до 2.0
            const currentSize = particle.size * scale;
            const currentOpacity = particle.opacity * (1 - progress);
            
            // Для частиц в трее устанавливаем пониженную прозрачность
            let effectiveOpacity = currentOpacity;
            if (particle.type === 'tray') {
                effectiveOpacity *= 0.5; // 0.5 прозрачнее
            }

            if (currentSize <= 0.35 || effectiveOpacity <= 0.01) {
                continue;
            }
            
            ctx.globalAlpha = effectiveOpacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(
                particle.x + particle.tx * progress,
                particle.y + particle.ty * progress,
                currentSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }
    
    animate(timestamp) {
        const deltaSeconds = this.lastFrameTime
            ? Math.min(0.05, (timestamp - this.lastFrameTime) / 1000)
            : 1 / 60;

        this.lastFrameTime = timestamp;
        this.update(deltaSeconds);
        this.render();

        if (!this.hasActiveParticles()) {
            this.animationFrameId = 0;
            this.lastFrameTime = 0;
            this.setCanvasVisibility(false);
            return;
        }

        this.animationFrameId = requestAnimationFrame(nextTimestamp => this.animate(nextTimestamp));
    }
}

let particleSystem = null;
// Инициализируем систему частиц после полной загрузки страницы
if (document.readyState === 'complete') {
    particleSystem = new ParticleSystem();
} else {
    window.addEventListener('load', () => {
        particleSystem = new ParticleSystem();
    });
}

// --- НАСТРОЙКИ И ДАННЫЕ ---
const BOARD_SIZE = 8;
const BEST_SCORE_KEY = 'block-chpok-best-score';
const SOUND_ENABLED_KEY = 'block-chpok-sound-enabled';
const LEGACY_MUSIC_ENABLED_KEY = 'block-chpok-music-enabled';
const DEBUG_LANGUAGE_KEY = 'block-chpok-debug-language';
const DEFAULT_LANGUAGE = 'en';
const LOGO_BY_LANGUAGE = {
    en: 'logo.png',
    ru: 'logo_ru.png'
};
const I18N = {
    en: {
        numberLocale: 'en-US',
        documentTitle: 'Block Chpok',
        ogDescription: 'A playful block puzzle game',
        play: 'Play',
        gameOverTitle: 'Game Over!',
        scoreLabel: 'Score:',
        scoreLabelShort: 'SCORE:',
        crystalsLabel: 'BEST SCORE:',
        bestLabel: 'Best:',
        restart: 'Play Again',
        settingsTitle: 'Settings',
        openSettings: 'Open settings',
        closeSettings: 'Close settings',
        soundLabel: 'Sounds',
        soundOn: 'On',
        soundOff: 'Off',
        comboLabel: 'Combo',
        splashLogoAlt: 'Block Chpok',
        headerLogoAlt: 'Block Chpok Logo',
        secondChanceTitle: 'No moves!',
        secondChanceText: 'Watch an ad to get a new set of shapes?',
        secondChanceAdBtn: 'Watch Ad',
        secondChanceSkipBtn: 'No thanks',
        praiseLines: ['Good!', 'Great!', 'Super!', 'Excellent!', 'Amazing!', 'Incredible!', 'Unbelievable!', 'Godlike!']
    },
    ru: {
        numberLocale: 'ru-RU',
        documentTitle: 'Block Chpok',
        ogDescription: 'Увлекательная головоломка с блоками',
        play: 'Играть',
        gameOverTitle: 'Игра окончена!',
        scoreLabel: 'Счет:',
        scoreLabelShort: 'СЧЁТ:',
        crystalsLabel: 'ЛУЧШИЙ СЧЁТ:',
        bestLabel: 'Рекорд:',
        restart: 'Играть снова',
        settingsTitle: 'Настройки',
        openSettings: 'Открыть настройки',
        closeSettings: 'Закрыть настройки',
        soundLabel: 'Звуки',
        soundOn: 'Вкл',
        soundOff: 'Выкл',
        comboLabel: 'Комбо',
        splashLogoAlt: 'Block Chpok',
        headerLogoAlt: 'Логотип Block Chpok',
        secondChanceTitle: 'Нет ходов!',
        secondChanceText: 'Посмотреть рекламу и получить новые фигуры?',
        secondChanceAdBtn: 'Посмотреть',
        secondChanceSkipBtn: 'Нет, спасибо',
        praiseLines: ['Хорошо!', 'Отлично!', 'Супер!', 'Превосходно!', 'Потрясающе!', 'Невероятно!', 'Феноменально!', 'Легендарно!']
    }
};
const COLORS = {
    orange: 'var(--color-orange)',
    blue: 'var(--color-blue)',
    green: 'var(--color-green)',
    purple: 'var(--color-purple)',
    yellow: 'var(--color-yellow)',
    red: 'var(--color-red)'
};

const COLOR_CLASS_BY_TOKEN = {
    [COLORS.orange]: 'block-color-orange',
    [COLORS.blue]: 'block-color-blue',
    [COLORS.green]: 'block-color-green',
    [COLORS.purple]: 'block-color-purple',
    [COLORS.yellow]: 'block-color-yellow',
    [COLORS.red]: 'block-color-red'
};

// ОПТИМИЗАЦИЯ: палитра упрощена до базовых цветов (используется для частиц)
const BLOCK_PALETTES = {
    [COLORS.orange]: { base: '#f58220' },
    [COLORS.blue]: { base: '#35a0f0' },
    [COLORS.green]: { base: '#66cc33' },
    [COLORS.purple]: { base: '#b042ff' },
    [COLORS.yellow]: { base: '#ffcc00' },
    [COLORS.red]: { base: '#f03030' }
};

const SHAPES_DATA = [
    // 3x3 figures (most complex)
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: COLORS.red }, // 3x3 square
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: COLORS.purple }, // L-shape
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: COLORS.purple }, // L-shape reversed
    { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: COLORS.purple }, // L-shape mirrored
    { matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: COLORS.purple }, // L-shape mirrored reversed
    { matrix: [[1, 1, 1], [0, 1, 0]], color: COLORS.green }, // T-shape
    { matrix: [[0, 1, 0], [1, 1, 1]], color: COLORS.green }, // T-shape rotated
    { matrix: [[1, 0], [1, 1], [1, 0]], color: COLORS.green }, // T-shape sideways
    { matrix: [[0, 1], [1, 1], [0, 1]], color: COLORS.green }, // T-shape sideways mirrored
    { matrix: [[1, 1, 1], [1, 1, 1]], color: COLORS.red }, // 2x3 rectangle
    
    // 2x2 figures
    { matrix: [[1, 1], [1, 1]], color: COLORS.blue }, // 2x2 square
    
    // 2x3 and 3x2 rectangles
    { matrix: [[1, 1], [1, 1], [1, 1]], color: COLORS.purple },  // 3x2 rectangle
    
    // Z-shaped figures (Tetris-like)
    { matrix: [[1, 1, 0], [0, 1, 1]], color: COLORS.orange }, // Z-shape
    { matrix: [[0, 1, 1], [1, 1, 0]], color: COLORS.orange }, // Z-shape mirrored
    { matrix: [[1, 0], [1, 1], [0, 1]], color: COLORS.red }, // Z-shape vertical
    { matrix: [[0, 1], [1, 1], [1, 0]], color: COLORS.red }, // Z-shape vertical mirrored
    
    // L-shaped figures
    { matrix: [[1, 0], [1, 1]], color: COLORS.orange }, // L-shape small
    { matrix: [[0, 1], [1, 1]], color: COLORS.orange }, // L-shape small mirrored
    { matrix: [[1, 1], [1, 0]], color: COLORS.orange }, // L-shape small mirrored2
    { matrix: [[1, 1], [0, 1]], color: COLORS.orange }, // L-shape small mirrored3
    
    // Diagonal figures
    { matrix: [[1, 0], [0, 1]], color: COLORS.yellow }, // diagonal 2 blocks
    
    // 1xN and Nx1 figures
    { matrix: [[1, 1, 1, 1, 1]], color: COLORS.purple }, // 1x5
    { matrix: [[1], [1], [1], [1], [1]], color: COLORS.purple }, // 5x1
    { matrix: [[1, 1, 1, 1]], color: COLORS.blue }, // 1x4
    { matrix: [[1], [1], [1], [1]], color: COLORS.blue }, // 4x1
    { matrix: [[1, 1, 1]], color: COLORS.orange }, // 1x3
    { matrix: [[1], [1], [1]], color: COLORS.orange }  // 3x1
];

// --- СОСТОЯНИЕ ИГРЫ ---
let board = [];
let trayPieces = [null, null, null];
let score = 0;
let bestScore = 0;
let displayedScore = 0;
let scoreAnimationToken = 0;
let refillTimeoutIds = [];
let gameOverTimeoutId = null;
let gameOverRevealTimeoutId = null;
let isRefillingTray = false;
let lastPlacementCoords = null;
let comboStreak = 0;
const isLocalhost = typeof window !== 'undefined'
    && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');

function readDebugLanguageOverride() {
    if (!isLocalhost) return null;
    try {
        const raw = window.localStorage.getItem(DEBUG_LANGUAGE_KEY);
        return (raw && Object.prototype.hasOwnProperty.call(I18N, raw)) ? raw : null;
    } catch {
        return null;
    }
}

let currentLanguage = readDebugLanguageOverride()
    || ((window.YandexSDK && typeof window.YandexSDK.getLanguage === 'function')
        ? window.YandexSDK.getLanguage()
        : (typeof navigator !== 'undefined' ? navigator.language : DEFAULT_LANGUAGE));
let isSoundEnabled = readStoredBoolean(SOUND_ENABLED_KEY, readStoredBoolean(LEGACY_MUSIC_ENABLED_KEY, true));
let hasGameStarted = false;
let isGameOverSequenceActive = false;
let isGameplayPausedBySdk = false;
let isGameplayMarkedActive = false;
let hasBoundYandexLifecycle = false;
let yandexLifecycleInitPromise = null;
let hasUsedSecondChance = false;
let pendingRewardShapes = null;
const SCORE_ANIMATION_DURATION_MS = isLowPerfParticleMode ? 520 : 1000;
const SCORE_POPUP_LIFETIME_MS = isLowPerfParticleMode ? 650 : 1000;
const PRAISE_POPUP_LIFETIME_MS = isLowPerfParticleMode ? 800 : 1200;
const GAME_OVER_REVEAL_DELAY_MS = isLowPerfParticleMode ? 600 : 850;

const gameContainer = document.querySelector('.game-container');
const boardEl = document.getElementById('board');
const traySlots = [
    document.getElementById('slot-0'),
    document.getElementById('slot-1'),
    document.getElementById('slot-2')
];
const scoreEl = document.getElementById('score');
const mainScoreEl = document.getElementById('main-score');
const bestScoreEl = document.getElementById('best-score');
const crystalCountEl = document.getElementById('crystal-count');
const scoreLabelEl = document.getElementById('score-label');
const crystalsLabelEl = document.getElementById('crystals-label');
const comboDisplay = document.getElementById('combo-display');
const gameOverScreen = document.getElementById('game-over');
const gameOverTitleEl = document.getElementById('game-over-title');
const gameOverScoreLabelEl = document.getElementById('game-over-score-label');
const gameOverScoreEl = document.getElementById('game-over-score');
const gameOverBestLabelEl = document.getElementById('game-over-best-label');
const gameOverBestEl = document.getElementById('game-over-best');
const restartBtn = document.getElementById('restart-btn');

const secondChanceModal = document.getElementById('second-chance-modal');
const secondChanceTitleEl = document.getElementById('second-chance-title');
const secondChanceTextEl = document.getElementById('second-chance-text');
const secondChanceShapesEl = document.getElementById('second-chance-shapes');
const secondChanceAdBtn = document.getElementById('second-chance-ad-btn');
const secondChanceSkipBtn = document.getElementById('second-chance-skip-btn');

const characterStateLayers = (() => {
    const map = {};
    document.querySelectorAll('.header-branch-banner-state').forEach(el => {
        const key = el.dataset.characterState;
        if (key) map[key] = el;
    });
    return map;
})();
let characterStateRevertTimeoutId = null;
let currentCharacterState = 'base';
let pendingShakeAnimationFrameId = 0;
let pendingComboAnimationFrameId = 0;
const CHARACTER_STATE_HOLD_MS = 500;

function setCharacterState(state) {
    if (!characterStateLayers[state]) state = 'base';
    if (characterStateRevertTimeoutId !== null) {
        clearTimeout(characterStateRevertTimeoutId);
        characterStateRevertTimeoutId = null;
    }
    if (currentCharacterState === state) {
        if (state === 'fire' || state === 'sad') {
            characterStateRevertTimeoutId = setTimeout(() => {
                characterStateRevertTimeoutId = null;
                setCharacterState('base');
            }, CHARACTER_STATE_HOLD_MS);
        }
        return;
    }
    Object.entries(characterStateLayers).forEach(([key, el]) => {
        if (key === state) el.classList.add('active');
        else el.classList.remove('active');
    });
    currentCharacterState = state;
    if (state === 'fire' || state === 'sad') {
        characterStateRevertTimeoutId = setTimeout(() => {
            characterStateRevertTimeoutId = null;
            setCharacterState('base');
        }, CHARACTER_STATE_HOLD_MS);
    }
}

function hideComboDisplay() {
    if (!comboDisplay) return;

    if (pendingComboAnimationFrameId !== 0) {
        cancelAnimationFrame(pendingComboAnimationFrameId);
        pendingComboAnimationFrameId = 0;
    }

    comboDisplay.classList.remove('combo-visible', 'combo-pop');
    comboDisplay.classList.add('fade-out');
}

function showComboDisplay(text) {
    if (!comboDisplay) return;

    comboDisplay.textContent = text;
    comboDisplay.classList.remove('fade-out', 'combo-pop');
    comboDisplay.classList.add('combo-visible');

    if (pendingComboAnimationFrameId !== 0) {
        cancelAnimationFrame(pendingComboAnimationFrameId);
    }

    pendingComboAnimationFrameId = requestAnimationFrame(() => {
        pendingComboAnimationFrameId = requestAnimationFrame(() => {
            comboDisplay.classList.add('combo-pop');
            pendingComboAnimationFrameId = 0;
        });
    });
}

const splashPlayBtn = document.getElementById('splash-play-btn');
const splashOverlay = document.getElementById('splash-overlay');
const splashLogoEl = document.getElementById('splash-logo');
const headerLogoEl = document.getElementById('header-logo');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsTitleEl = document.getElementById('settings-title');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const musicToggle = document.getElementById('music-toggle');
const musicToggleLabelEl = document.getElementById('music-toggle-label');
const musicToggleStatusEl = document.getElementById('music-toggle-status');
const ogTitleMeta = document.querySelector('meta[property="og:title"]');
const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
const localizedLogoEls = [splashLogoEl, headerLogoEl];

if (document.body) {
    document.body.classList.toggle('low-perf-effects', isLowPerfParticleMode);
}

audioManager.setSoundEnabled(isSoundEnabled);

function updateSplashPlayButtonPosition() {
    if (!splashPlayBtn || !boardEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    if (boardRect.width <= 0 || boardRect.height <= 0) return;

    splashPlayBtn.style.left = `${boardRect.left + boardRect.width / 2}px`;
    splashPlayBtn.style.top = `${boardRect.top + boardRect.height / 2}px`;
}

function normalizeLanguage(lang) {
    if (typeof lang !== 'string') return DEFAULT_LANGUAGE;
    return lang.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function getMessages() {
    return I18N[currentLanguage] || I18N[DEFAULT_LANGUAGE];
}

function formatNumber(value) {
    const locale = getMessages().numberLocale;
    return Number.isFinite(value) ? value.toLocaleString(locale) : '0';
}

function readStoredBoolean(key, fallbackValue) {
    try {
        const rawValue = window.localStorage.getItem(key);
        if (rawValue === null) return fallbackValue;
        return rawValue !== '0' && rawValue !== 'false';
    } catch {
        return fallbackValue;
    }
}

function writeStoredBoolean(key, value) {
    try {
        window.localStorage.setItem(key, value ? '1' : '0');
    } catch {
        // ignore storage errors
    }
}

function applyLocalizedLogos(language) {
    const preferredLogo = LOGO_BY_LANGUAGE[language] || LOGO_BY_LANGUAGE[DEFAULT_LANGUAGE];
    const fallbackLogo = LOGO_BY_LANGUAGE[DEFAULT_LANGUAGE];

    localizedLogoEls.forEach(img => {
        if (!img) return;

        img.onerror = preferredLogo !== fallbackLogo ? () => {
            img.onerror = null;
            img.src = fallbackLogo;
        } : null;

        if (img.getAttribute('src') !== preferredLogo) {
            img.src = preferredLogo;
        }
    });
}

function syncSoundToggleUI() {
    const messages = getMessages();

    if (musicToggle) {
        musicToggle.checked = isSoundEnabled;
    }

    if (musicToggleStatusEl) {
        musicToggleStatusEl.textContent = isSoundEnabled ? messages.soundOn : messages.soundOff;
    }
}

function refreshVisibleScoreText() {
    scoreEl.textContent = formatNumber(score);
    if (mainScoreEl) mainScoreEl.textContent = formatNumber(displayedScore);
    gameOverScoreEl.textContent = formatNumber(score);
    updateBestScoreDisplay();
}

function applyTranslations(language) {
    currentLanguage = normalizeLanguage(language);
    const messages = getMessages();

    document.documentElement.lang = currentLanguage;
    document.title = messages.documentTitle;

    if (ogTitleMeta) {
        ogTitleMeta.setAttribute('content', messages.documentTitle);
    }

    if (ogDescriptionMeta) {
        ogDescriptionMeta.setAttribute('content', messages.ogDescription);
    }

    splashPlayBtn.textContent = messages.play;
    gameOverTitleEl.textContent = messages.gameOverTitle;
    gameOverScoreLabelEl.textContent = messages.scoreLabel;
    gameOverBestLabelEl.textContent = messages.bestLabel;
    if (scoreLabelEl) scoreLabelEl.textContent = messages.scoreLabelShort;
    if (crystalsLabelEl) crystalsLabelEl.textContent = messages.crystalsLabel;
    restartBtn.textContent = messages.restart;
    settingsTitleEl.textContent = messages.settingsTitle;
    musicToggleLabelEl.textContent = messages.soundLabel;
    settingsBtn.setAttribute('aria-label', messages.openSettings);
    settingsCloseBtn.setAttribute('aria-label', messages.closeSettings);
    if (splashLogoEl) splashLogoEl.alt = messages.splashLogoAlt;
    if (headerLogoEl) headerLogoEl.alt = messages.headerLogoAlt;
    
    if (secondChanceTitleEl) secondChanceTitleEl.textContent = messages.secondChanceTitle;
    if (secondChanceTextEl) secondChanceTextEl.textContent = messages.secondChanceText;
    if (secondChanceAdBtn) secondChanceAdBtn.textContent = messages.secondChanceAdBtn;
    if (secondChanceSkipBtn) secondChanceSkipBtn.textContent = messages.secondChanceSkipBtn;

    applyLocalizedLogos(currentLanguage);
    syncSoundToggleUI();

    if (comboStreak >= 2) {
        comboDisplay.textContent = `${messages.comboLabel} x${comboStreak}`;
    }

    refreshVisibleScoreText();
}

function playSound(soundName) {
    audioManager.play(soundName);
}

let dragElement = null;
let dragPieceIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartPointerX = 0;
let dragStartPointerY = 0;
let dragAnchorX = 0;
let dragAnchorY = 0;
let dragPointerType = 'mouse';
let cellSize = 0;
let lastKnownCellSize = 0;
let gapSize = 3;
let isDragging = false;
let isAnimating = false;

const DRAG_GAIN_X = 1.35;
const DRAG_GAIN_Y = 1.55;
const DRAG_POPUP_LIFT_Y = 58;

// ОПТИМИЗАЦИЯ: переиспользуем объект координат и уменьшаем давление на GC
const currentCoords = { r: -1, c: -1 };

function canInteractWithGameplay() {
    return shouldGameplayBeActive();
}

function waitForGameplayResume() {
    if (!isGameplayPausedBySdk) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        const check = () => {
            if (!isGameplayPausedBySdk) {
                resolve();
                return;
            }

            setTimeout(check, 50);
        };

        check();
    });
}

function cloneShape(shape) {
    if (!shape) return null;
    return {
        matrix: shape.matrix.map(row => row.slice()),
        color: shape.color
    };
}

function clearPendingRefill() {
    refillTimeoutIds.forEach(id => clearTimeout(id));
    refillTimeoutIds = [];
    isRefillingTray = false;
}

function clearPendingGameOver() {
    if (gameOverTimeoutId !== null) {
        clearTimeout(gameOverTimeoutId);
        gameOverTimeoutId = null;
    }

    if (gameOverRevealTimeoutId !== null) {
        clearTimeout(gameOverRevealTimeoutId);
        gameOverRevealTimeoutId = null;
    }

    isGameOverSequenceActive = false;
}

function shouldGameplayBeActive() {
    return !settingsModal.classList.contains('show')
        && !gameOverScreen.classList.contains('show')
        && !secondChanceModal.classList.contains('show')
        && !isGameOverSequenceActive
        && !isGameplayPausedBySdk;
}

function syncGameplayState() {
    const shouldBeActive = shouldGameplayBeActive();

    if (!window.YandexSDK || !window.YandexSDK.isAvailable || !window.YandexSDK.isAvailable()) {
        isGameplayMarkedActive = false;
        return;
    }

    if (shouldBeActive === isGameplayMarkedActive) {
        return;
    }

    isGameplayMarkedActive = shouldBeActive;

    if (shouldBeActive) {
        window.YandexSDK.startGameplay();
    } else {
        window.YandexSDK.stopGameplay();
    }
}

function handleYandexPause() {
    isGameplayPausedBySdk = true;

    if (isDragging) {
        cancelDrag();
    }

    audioManager.suspend().catch(() => {});
    syncGameplayState();
}

function handleYandexResume() {
    isGameplayPausedBySdk = false;

    if (hasGameStarted) {
        audioManager.resume().catch(() => {});
    }

    syncGameplayState();
}

async function initializeYandexLifecycle() {
    if (hasBoundYandexLifecycle) {
        syncGameplayState();
        return;
    }

    if (yandexLifecycleInitPromise) {
        return yandexLifecycleInitPromise;
    }

    if (!window.YandexSDK || typeof window.YandexSDK.init !== 'function') {
        return;
    }

    yandexLifecycleInitPromise = (async () => {
        try {
            await window.YandexSDK.init();
            hasBoundYandexLifecycle = true;

            if (typeof window.YandexSDK.onPause === 'function') {
                window.YandexSDK.onPause(handleYandexPause);
            }

            if (typeof window.YandexSDK.onResume === 'function') {
                window.YandexSDK.onResume(handleYandexResume);
            }

            if (typeof window.YandexSDK.isPaused === 'function' && window.YandexSDK.isPaused()) {
                handleYandexPause();
            } else {
                syncGameplayState();
            }
        } catch (error) {
            console.warn('Failed to initialize Yandex lifecycle:', error);
        } finally {
            yandexLifecycleInitPromise = null;
        }
    })();

    return yandexLifecycleInitPromise;
}

function setSoundPreference(enabled) {
    isSoundEnabled = enabled;
    writeStoredBoolean(SOUND_ENABLED_KEY, enabled);
    syncSoundToggleUI();
    audioManager.setSoundEnabled(enabled);
}

function openSettingsModal() {
    settingsModal.classList.add('show');
    settingsModal.setAttribute('aria-hidden', 'false');
    syncSoundToggleUI();
    syncGameplayState();
}

function closeSettingsModal() {
    settingsModal.classList.remove('show');
    settingsModal.setAttribute('aria-hidden', 'true');
    syncGameplayState();
}

async function initializeLanguage() {
    const debugOverride = readDebugLanguageOverride();
    if (debugOverride) {
        applyTranslations(debugOverride);
        return;
    }

    let initialLang = typeof navigator !== 'undefined' ? navigator.language : DEFAULT_LANGUAGE;
    if (window.YandexSDK && typeof window.YandexSDK.getLanguage === 'function') {
        initialLang = window.YandexSDK.getLanguage();
    }
    applyTranslations(initialLang);

    if (!window.YandexSDK || typeof window.YandexSDK.init !== 'function') {
        return;
    }

    const applyYandexLanguage = async () => {
        await window.YandexSDK.init();
        if (window.YandexSDK.isAvailable() && typeof window.YandexSDK.getLanguage === 'function') {
            applyTranslations(window.YandexSDK.getLanguage());
            return true;
        }
        return false;
    };

    try {
        const applied = await applyYandexLanguage();
        if (!applied) {
            setTimeout(() => {
                applyYandexLanguage().catch(() => {});
            }, 1000);
            setTimeout(() => {
                applyYandexLanguage().catch(() => {});
            }, 2500);
        }
    } catch (error) {
        console.warn('Failed to resolve Yandex language:', error);
    }
}

function loadBestScore() {
    try {
        const savedValue = window.localStorage.getItem(BEST_SCORE_KEY);
        const parsedValue = Number(savedValue);
        bestScore = Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    } catch (error) {
        bestScore = 0;
    }
    updateBestScoreDisplay();
}

function saveBestScore(nextBestScore) {
    bestScore = nextBestScore;
    try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
    } catch (error) {
        // ignore storage errors
    }
    updateBestScoreDisplay();

    // Синхронизируем с Yandex SDK
    if (window.YandexSDK && window.YandexSDK.isAvailable()) {
        window.YandexSDK.saveBestScore(bestScore);
        if (!window.YandexSDK.isMethodAvailable || window.YandexSDK.isMethodAvailable('leaderboards.setScore')) {
            window.YandexSDK.setLeaderboardScore(bestScore);
        }
    }
}

function updateBestScoreDisplay() {
    const formattedBestScore = formatNumber(Math.max(bestScore, score));
    if (bestScoreEl) {
        bestScoreEl.textContent = formattedBestScore;
    }
    if (crystalCountEl) {
        crystalCountEl.textContent = formattedBestScore;
    }
    gameOverBestEl.textContent = formattedBestScore;
}

function isThreeByThreeSquare(shape) {
    return Boolean(shape)
        && shape.matrix.length === 3
        && shape.matrix[0].length === 3
        && shape.matrix.every(row => row.every(cell => cell === 1));
}

function triggerCameraShake() {
    if (!gameContainer) return;

    gameContainer.classList.remove('shake');

    if (pendingShakeAnimationFrameId !== 0) {
        cancelAnimationFrame(pendingShakeAnimationFrameId);
    }

    pendingShakeAnimationFrameId = requestAnimationFrame(() => {
        pendingShakeAnimationFrameId = requestAnimationFrame(() => {
            gameContainer.classList.add('shake');
            pendingShakeAnimationFrameId = 0;
        });
    });
}

function finalizeBestScore() {
    if (score > bestScore) {
        saveBestScore(score);
    } else {
        updateBestScoreDisplay();
    }
}

function revealGameOverScreen() {
    gameOverScreen.classList.add('show');
    isGameOverSequenceActive = false;
    syncGameplayState();

    if (window.YandexSDK && window.YandexSDK.isAvailable()) {
        window.YandexSDK.dispatchLevelCompleteEvent(1);
    }
}

function generateRewardShapes() {
    const newShapes = [];
    newShapes.push({ matrix: [[1]], color: COLORS.yellow }); // Одиночный квадратик
    
    const possibleShapes = getAllPossibleShapes();
    for (let i = 0; i < 2; i++) {
        if (possibleShapes.length > i) {
            newShapes.push(cloneShape(SHAPES_DATA[possibleShapes[i]]));
        } else {
            newShapes.push(cloneShape(SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)]));
        }
    }
    
    // Перемешиваем чтобы квадратик не всегда был первым
    newShapes.sort(() => Math.random() - 0.5);
    return newShapes;
}

function renderRewardShapes(shapes) {
    if (!secondChanceShapesEl) return;
    secondChanceShapesEl.innerHTML = '';
    
    shapes.forEach(piece => {
        const slot = document.createElement('div');
        slot.className = 'reward-shape-slot';
        
        const rows = piece.matrix.length;
        const cols = piece.matrix[0].length;
        const gap = 2;

        const trayCellSize = 16; // Фиксированный размер ячейки для предпросмотра

        const container = document.createElement('div');
        container.innerHTML = createShapeHTML(piece, false);
        const shapeEl = container.firstElementChild;

        const w = cols * trayCellSize + (cols - 1) * gap;
        const h = rows * trayCellSize + (rows - 1) * gap;

        shapeEl.style.width = `${w}px`;
        shapeEl.style.height = `${h}px`;
        shapeEl.style.transform = 'none';

        slot.appendChild(shapeEl);
        secondChanceShapesEl.appendChild(slot);
    });
}

function revealSecondChanceScreen() {
    secondChanceModal.classList.add('show');
    isGameOverSequenceActive = false;
    syncGameplayState();
}

function showSecondChance() {
    if (isGameOverSequenceActive || secondChanceModal.classList.contains('show')) {
        return;
    }

    isGameOverSequenceActive = true;
    haptic.error();
    setCharacterState('sad');
    gameContainer.classList.add('game-over-transition');
    syncGameplayState();

    gameOverRevealTimeoutId = setTimeout(async () => {
        await waitForGameplayResume();
        revealSecondChanceScreen();
        gameOverRevealTimeoutId = null;
    }, GAME_OVER_REVEAL_DELAY_MS);
}

function showGameOver() {
    if (isGameOverSequenceActive || gameOverScreen.classList.contains('show')) {
        return;
    }

    isGameOverSequenceActive = true;
    finalizeBestScore();
    gameOverScoreEl.textContent = formatNumber(score);
    haptic.error();
    setCharacterState('sad');
    gameContainer.classList.add('game-over-transition');
    syncGameplayState();

    gameOverRevealTimeoutId = setTimeout(async () => {
        await waitForGameplayResume();
        revealGameOverScreen();
        gameOverRevealTimeoutId = null;
    }, GAME_OVER_REVEAL_DELAY_MS);
}

function getBlockClass(colorStr) {
    return COLOR_CLASS_BY_TOKEN[colorStr] || 'block-color-purple';
}

function createBlockElement(colorStr) {
    const block = document.createElement('div');
    block.className = `block-item ${getBlockClass(colorStr)}`;
    return block;
}

function getCurrentCellSize() {
    const boardRect = boardEl.getBoundingClientRect();
    const boardStyles = window.getComputedStyle(boardEl);
    const parsedGap = parseFloat(boardStyles.columnGap || boardStyles.gap || '3');
    gapSize = Number.isFinite(parsedGap) ? parsedGap : 3;

    const firstCell = document.querySelector('.cell');
    const directCellSize = firstCell ? firstCell.getBoundingClientRect().width : 0;
    const fallbackCellSize = (boardRect.width - gapSize * (BOARD_SIZE - 1)) / BOARD_SIZE;

    const nextCellSize = [directCellSize, fallbackCellSize, lastKnownCellSize, cellSize, 32]
        .find(size => Number.isFinite(size) && size > 0);

    lastKnownCellSize = nextCellSize;
    return nextCellSize;
}

function initGame() {
    clearPendingRefill();
    clearPendingGameOver();
    if (pendingShakeAnimationFrameId !== 0) {
        cancelAnimationFrame(pendingShakeAnimationFrameId);
        pendingShakeAnimationFrameId = 0;
    }
    if (dragElement) {
        dragElement.remove();
        dragElement = null;
    }
    gameContainer.classList.remove('shake');
    gameContainer.classList.remove('game-over-transition');
    setCharacterState('base');
    closeSettingsModal();
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    trayPieces = [null, null, null];
    score = 0;
    displayedScore = 0;
    isAnimating = false;
    isDragging = false;
    dragPieceIndex = -1;
    dragPointerType = 'mouse';
    comboStreak = 0;
    hasUsedSecondChance = false;
    updateScore();
    gameOverScreen.classList.remove('show');
    secondChanceModal.classList.remove('show');
    isGameOverSequenceActive = false;
    hideComboDisplay();
    boardEl.innerHTML = '';
    renderBoard();
    fillTray();
    syncGameplayState();
}

function renderBoard() {
    if (boardEl.children.length === 0) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${r}-${c}`;
                boardEl.appendChild(cell);
            }
        }
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.getElementById(`cell-${r}-${c}`);
            const currentColor = cell.dataset.color || null;
            const targetColor = board[r][c];

            const hasChild = cell.children.length > 0;
            const shouldHaveChild = targetColor !== null;
            const logicalStateMatch = currentColor === targetColor;
            const domStateMatch = hasChild === shouldHaveChild;

            if (!logicalStateMatch || !domStateMatch) {
                cell.innerHTML = '';
                if (targetColor) {
                    const block = createBlockElement(targetColor);
                    cell.appendChild(block);
                }
                cell.dataset.color = targetColor || '';
            }
        }
    }
}

function createShapeHTML(shape, withPop = true) {
    const rows = shape.matrix.length;
    const cols = shape.matrix[0].length;
    const colorClass = getBlockClass(shape.color);

    let html = `<div class="shape" style="grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr); width: 100%; height: 100%;">`;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (shape.matrix[r][c]) {
                const popClass = withPop ? '' : ' no-pop';
                html += `<div class="block" style="aspect-ratio: 1/1;"><div class="block-item ${colorClass}${popClass}"></div></div>`;
            } else {
                html += '<div class="block empty" style="aspect-ratio: 1/1;"></div>';
            }
        }
    }
    html += '</div>';
    return html;
}

function getAllPossibleShapes() {
    const possibleShapes = [];
    
    for (let s = 0; s < SHAPES_DATA.length; s++) {
        const shape = SHAPES_DATA[s];
        let canPlaceShape = false;
        let placementCount = 0; // Количество возможных мест для размещения
        
        // Проверяем все возможные позиции на доске
        for (let r = 0; r <= BOARD_SIZE - shape.matrix.length; r++) {
            for (let c = 0; c <= BOARD_SIZE - shape.matrix[0].length; c++) {
                if (canPlace(shape, r, c)) {
                    canPlaceShape = true;
                    placementCount++; // Увеличиваем счетчик возможных мест
                }
            }
        }
        
        if (canPlaceShape) {
            // Добавляем индекс фигуры и вычисляем её "сложность" и количество возможных мест
            const complexity = shape.matrix.length * shape.matrix[0].length;
            // Вычисляем приоритет: сложность + коэффициент от количества доступных мест
            const priority = complexity + (placementCount / 10); // Делим на 10, чтобы не перекрывать влияние сложности
            possibleShapes.push({ 
                index: s, 
                complexity: complexity,
                placementCount: placementCount,
                priority: priority 
            });
        }
    }
    
    // Сортируем по приоритету: сначала более сложные фигуры с большим количеством доступных мест
    possibleShapes.sort((a, b) => b.priority - a.priority);
    
    // Возвращаем только индексы фигур в порядке приоритета
    return possibleShapes.map(item => item.index);
}

// Проверяет, можно ли разместить все 3 фигуры из данного списка на текущей доске
function canPlaceAllShapesInOrder(shapeList) {
    // Создаем копию доски для симуляции
    const tempBoard = board.map(row => [...row]);
    
    // Функция, которая проверяет возможность размещения фигуры на временной доске
    function canPlaceOnTempBoard(shape, startR, startC) {
        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[0].length; c++) {
                if (shape.matrix[r][c]) {
                    const boardR = startR + r;
                    const boardC = startC + c;
                    if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE || tempBoard[boardR][boardC] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Функция, которая размещает фигуру на временной доске
    function placeOnTempBoard(shape, startR, startC) {
        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[0].length; c++) {
                if (shape.matrix[r][c]) {
                    tempBoard[startR + r][startC + c] = shape.color;
                }
            }
        }
    }
    
    // Пробуем разместить все фигуры из списка
    for (const shapeIndex of shapeList) {
        const shape = SHAPES_DATA[shapeIndex];
        let placed = false;
        
        // Ищем позицию для размещения фигуры
        for (let r = 0; r <= BOARD_SIZE - shape.matrix.length; r++) {
            for (let c = 0; c <= BOARD_SIZE - shape.matrix[0].length; c++) {
                if (canPlaceOnTempBoard(shape, r, c)) {
                    placeOnTempBoard(shape, r, c);
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        
        // Если не можем разместить хотя бы одну фигуру, возвращаем false
        if (!placed) {
            return false;
        }
    }
    
    return true;
}

function wouldCreateLineClear(shape, startR, startC) {
    // Validate inputs first
    if (!shape || startR < 0 || startC < 0) {
        return { rows: [], cols: [] };
    }
    
    // Create a temporary board to simulate the placement
    const tempBoard = board.map(row => [...row]);
    
    // Place the shape on the temporary board
    for (let r = 0; r < shape.matrix.length; r++) {
        for (let c = 0; c < shape.matrix[0].length; c++) {
            if (shape.matrix[r][c]) {
                const boardR = startR + r;
                const boardC = startC + c;
                if (boardR >= 0 && boardR < BOARD_SIZE && boardC >= 0 && boardC < BOARD_SIZE) {
                    tempBoard[boardR][boardC] = shape.color;
                }
            }
        }
    }
    
    // Check which rows and columns would be filled completely
    const rowsToClear = [];
    const colsToClear = [];
    
    // Check rows
    for (let r = 0; r < BOARD_SIZE; r++) {
        let isRowFull = true;
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (tempBoard[r][c] === null) {
                isRowFull = false;
                break;
            }
        }
        if (isRowFull) {
            rowsToClear.push(r);
        }
    }
    
    // Check columns
    for (let c = 0; c < BOARD_SIZE; c++) {
        let isColFull = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (tempBoard[r][c] === null) {
                isColFull = false;
                break;
            }
        }
        if (isColFull) {
            colsToClear.push(c);
        }
    }
    
    return { rows: rowsToClear, cols: colsToClear };
}

function fillTray() {
    const emptyCount = trayPieces.filter(p => !p).length;

    if (emptyCount === 3) {
        clearPendingRefill();
        isRefillingTray = true;
        renderTray(true);

        const refillStartTimeoutId = setTimeout(async () => {
            await waitForGameplayResume();

            // Получаем все фигуры, которые можно разместить на текущей доске, в порядке убывания сложности
            const possibleShapeIndices = getAllPossibleShapes();
            
            // Если нет доступных фигур, игра закончится в checkGameOver
            // Но если они есть, выбираем 3 такие фигуры, чтобы все они могли быть размещены
            let selectedShapes = [];
            
            if (possibleShapeIndices.length > 0) {
                // Попробуем найти комбинацию из 3 фигур, которую можно разместить
                let foundValidCombination = false;
                
                // Попробуем найти комбинацию без дубликатов
                const maxAttempts = 100;
                let attempts = 0;
                
                while (!foundValidCombination && attempts < maxAttempts && possibleShapeIndices.length >= 3) {
                    attempts++;
                    
                    // Создаем копию массива возможных фигур и перемешиваем
                    const shuffledIndices = [...possibleShapeIndices].sort(() => Math.random() - 0.5);
                    
                    // Берем первые 3 разных фигуры из перемешанного массива
                    const tempSelected = [];
                    const usedIndices = new Set();
                    
                    for (const idx of shuffledIndices) {
                        if (tempSelected.length >= 3) break;
                        if (!usedIndices.has(idx)) {
                            tempSelected.push(idx);
                            usedIndices.add(idx);
                        }
                    }
                    
                    // Проверяем, можно ли разместить все 3 выбранные фигуры
                    if (tempSelected.length === 3 && canPlaceAllShapesInOrder(tempSelected)) {
                        selectedShapes = tempSelected.map(idx => cloneShape(SHAPES_DATA[idx]));
                        foundValidCombination = true;
                    }
                }
                
                // Если не нашлась комбинация из 3 разных фигур, пробуем с меньшим приоритетом уникальности
                if (!foundValidCombination && possibleShapeIndices.length > 0) {
                    // Берем 3 фигуры, максимально избегая дубликатов
                    const tempSelected = [];
                    const usedIndices = new Set();
                    
                    for (let i = 0; i < 3; i++) {
                        let selectedIndex;
                        
                        if (i === 0) {
                            // Для первой фигуры берем самую сложную (если возможно)
                            selectedIndex = possibleShapeIndices[0];
                        } else {
                            // Для последующих стараемся избегать дубликатов
                            let candidateIndex = -1;
                            
                            // Сначала пытаемся найти фигуру, которой нет в текущем списке
                            for (let j = 0; j < possibleShapeIndices.length; j++) {
                                const idx = possibleShapeIndices[j];
                                if (!usedIndices.has(idx)) {
                                    candidateIndex = idx;
                                    break;
                                }
                            }
                            
                            // Если все фигуры уже используются, берем любую
                            if (candidateIndex === -1) {
                                selectedIndex = possibleShapeIndices[0]; // или первую доступную
                            } else {
                                selectedIndex = candidateIndex;
                            }
                        }
                        
                        tempSelected.push(selectedIndex);
                        usedIndices.add(selectedIndex);
                    }
                    
                    // Проверяем, можно ли разместить эти фигуры
                    if (canPlaceAllShapesInOrder(tempSelected)) {
                        selectedShapes = tempSelected.map(idx => cloneShape(SHAPES_DATA[idx]));
                    } else {
                        // Если нельзя разместить, берем три разные фигуры без проверки размещения
                        const differentShapes = [];
                        const usedShapes = new Set();
                        
                        for (const idx of possibleShapeIndices) {
                            if (differentShapes.length >= 3) break;
                            
                            // Проверяем, является ли фигура уникальной (на основе матрицы)
                            const shapeMatrixKey = JSON.stringify(SHAPES_DATA[idx].matrix);
                            if (!usedShapes.has(shapeMatrixKey)) {
                                differentShapes.push(idx);
                                usedShapes.add(shapeMatrixKey);
                            }
                        }
                        
                        // Если уникальных не хватает, добавляем оставшиеся
                        if (differentShapes.length < 3) {
                            for (const idx of possibleShapeIndices) {
                                if (differentShapes.length >= 3) break;
                                differentShapes.push(idx);
                            }
                        }
                        
                        selectedShapes = differentShapes.slice(0, 3).map(idx => cloneShape(SHAPES_DATA[idx]));
                    }
                }
                
                // Если и это не помогло, просто берём первые 3 возможные фигуры
                if (selectedShapes.length === 0 && possibleShapeIndices.length > 0) {
                    const limitedIndices = possibleShapeIndices.slice(0, 3);
                    selectedShapes = limitedIndices.map(idx => cloneShape(SHAPES_DATA[idx]));
                }
            }
            
            // Заполняем трей фигурами
            for (let i = 0; i < 3; i++) {
                // Если смогли подобрать подходящие фигуры, используем их, иначе берем случайную
                const randomShape = selectedShapes[i] || cloneShape(SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)]);
                
                const slotFillTimeoutId = setTimeout(async () => {
                    await waitForGameplayResume();

                    trayPieces[i] = randomShape;
                    renderTray(false, new Set([i]));

                    playSound('click');

                    const slot = traySlots[i];
                    if (slot) {
                        const rect = slot.getBoundingClientRect();
                        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, randomShape.color, 42, 7, 'tray');
                    }

                    if (i === 2) {
                        isRefillingTray = false;
                        refillTimeoutIds = [];
                        checkGameOver();
                    }
                }, i * 150);
                refillTimeoutIds.push(slotFillTimeoutId);
            }
        }, 300);
        refillTimeoutIds.push(refillStartTimeoutId);
    } else {
        renderTray();
        checkGameOver();
    }
}

function renderTray(forceEmpty = false, popIndexes = null) {
    for (let i = 0; i < 3; i++) {
        const slot = traySlots[i];
        const piece = forceEmpty ? null : trayPieces[i];

        slot.innerHTML = '';
        slot.onpointerdown = null;

        if (piece) {
            const rows = piece.matrix.length;
            const cols = piece.matrix[0].length;
            const longestSide = Math.max(rows, cols);
            const gap = 3;

            const slotW = slot.clientWidth || 100;
            const slotH = slot.clientHeight || 140;

            const paddingW = 24;
            const paddingH = 24;

            const maxW = slotW - paddingW;
            const maxH = slotH - paddingH;

            const maxCellW = (maxW - gap * (cols - 1)) / cols;
            const maxCellH = (maxH - gap * (rows - 1)) / rows;

            let trayCellSize = Math.min(maxCellW, maxCellH);
            const minTrayCellSize = longestSide >= 5 ? 12 : longestSide >= 4 ? 16 : 20;
            trayCellSize = Math.min(Math.max(trayCellSize, minTrayCellSize), 38);

            const container = document.createElement('div');
            const shouldPop = popIndexes instanceof Set ? popIndexes.has(i) : false;
            container.innerHTML = createShapeHTML(piece, shouldPop);
            const shapeEl = container.firstElementChild;

            const w = cols * trayCellSize + (cols - 1) * gap;
            const h = rows * trayCellSize + (rows - 1) * gap;

            shapeEl.classList.add('tray-shape');
            shapeEl.style.width = `${w}px`;
            shapeEl.style.height = `${h}px`;

            slot.appendChild(shapeEl);
            slot.onpointerdown = e => startDrag(e, i);
        }
    }
}

function startDrag(e, index) {
    if (!trayPieces[index] || isDragging || isAnimating || !canInteractWithGameplay()) return;

    e.preventDefault();

    const piece = trayPieces[index];
    cellSize = getCurrentCellSize();
    dragPointerType = e.pointerType === 'touch' ? 'touch' : 'mouse';

    haptic.track(e.clientX, e.clientY);
    playSound('pick');
    haptic({ x: e.clientX, y: e.clientY });

    setCharacterState('wait');

    isDragging = true;
    dragPieceIndex = index;

    dragElement = document.createElement('div');
    dragElement.className = 'drag-clone';
    dragElement.innerHTML = createShapeHTML(piece, false);

    const shapeEl = dragElement.firstElementChild;
    shapeEl.style.width = `${piece.matrix[0].length * cellSize + (piece.matrix[0].length - 1) * gapSize}px`;
    shapeEl.style.height = `${piece.matrix.length * cellSize + (piece.matrix.length - 1) * gapSize}px`;

    // ОПТИМИЗАЦИЯ: фиксируем left/top один раз, далее двигаем только transform
    dragElement.style.left = '0px';
    dragElement.style.top = '0px';

    document.body.appendChild(dragElement);

    if (traySlots[index].firstElementChild) {
        traySlots[index].firstElementChild.style.opacity = '0';
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    dragOffsetX = shapeEl.offsetWidth / 2;
    dragOffsetY = shapeEl.offsetHeight / 2 + DRAG_POPUP_LIFT_Y;

    const slotRect = traySlots[index].getBoundingClientRect();
    dragAnchorX = slotRect.left + slotRect.width / 2;
    dragAnchorY = slotRect.top + slotRect.height / 2;
    dragStartPointerX = clientX;
    dragStartPointerY = clientY;

    // Фигура появляется над центром слота, а не под точкой касания
    moveDrag(dragAnchorX, dragAnchorY);

    addDragListeners();
}

function addDragListeners() {
    document.addEventListener('pointermove', onDragMove, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', cancelDrag);
    window.addEventListener('blur', cancelDrag);
}

function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    haptic.track(e.clientX, e.clientY);

    const gainX = dragPointerType === 'touch' ? DRAG_GAIN_X : 1;
    const gainY = dragPointerType === 'touch' ? DRAG_GAIN_Y : 1;
    const dx = (e.clientX - dragStartPointerX) * gainX;
    const dy = (e.clientY - dragStartPointerY) * gainY;
    const virtualX = dragAnchorX + dx;
    const virtualY = dragAnchorY + dy;

    moveDrag(virtualX, virtualY);
    updatePreview();
}

function moveDrag(x, y) {
    if (!dragElement) return;
    // ОПТИМИЗАЦИЯ: GPU-ускорение через translate3d без reflow
    dragElement.style.transform = `translate3d(${x - dragOffsetX}px, ${y - dragOffsetY}px, 0)`;
}

function updatePreview() {
    clearPreview();
    const coords = getBoardCoordinates();
    if (coords && dragPieceIndex >= 0 && trayPieces[dragPieceIndex] && canPlace(trayPieces[dragPieceIndex], coords.r, coords.c)) {
        drawPreview(trayPieces[dragPieceIndex], coords.r, coords.c);
    }
}

function getBoardCoordinates() {
    if (!dragElement) return null;

    if (!Number.isFinite(cellSize) || cellSize <= 0) {
        cellSize = getCurrentCellSize();
    }

    const rect = dragElement.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();

    const relX = rect.left - boardRect.left;
    const relY = rect.top - boardRect.top;

    const c = Math.round(relX / (cellSize + gapSize));
    const r = Math.round(relY / (cellSize + gapSize));

    currentCoords.r = r;
    currentCoords.c = c;
    return currentCoords;
}

function clearPreview() {
    document.querySelectorAll('.cell.preview').forEach(el => {
        el.classList.remove('preview');
        el.style.backgroundColor = ''; // Reset custom background
    });
    
    // Also clear any line highlights
    document.querySelectorAll('.cell.line-highlight').forEach(el => {
        el.classList.remove('line-highlight');
        el.style.removeProperty('--line-preview-color');
    });
}

// Helper function to convert hex color to RGBA
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawPreview(shape, startR, startC) {
    // First clear all previous previews
    clearPreview();
    
    // Validate inputs
    if (!shape || startR < 0 || startC < 0) {
        return;
    }
    
    // Convert CSS variable to actual color value
    const computedStyle = getComputedStyle(document.documentElement);
    let shapeColor = shape.color;
    if (shape.color && shape.color.includes('var(')) {
        const varName = shape.color.replace('var(', '').replace(')', '').trim();
        shapeColor = computedStyle.getPropertyValue(varName).trim();
        
        // If the resolved color is empty, use a default
        if (!shapeColor) {
            shapeColor = '#888888'; // default gray
        }
    } else if (!shape.color) {
        shapeColor = '#888888'; // default gray
    }
    
    // Add preview styling to the shape cells
    for (let r = 0; r < shape.matrix.length; r++) {
        for (let c = 0; c < shape.matrix[0].length; c++) {
            if (shape.matrix && shape.matrix[r] && shape.matrix[r][c]) {
                const cell = document.getElementById(`cell-${startR + r}-${startC + c}`);
                if (cell) {
                    cell.classList.add('preview');
                    
                    // Apply the shape's color with reduced opacity (semi-transparent)
                    // ~0.5 opacity for preview
                    cell.style.backgroundColor = hexToRgba(shapeColor, 0.5);
                }
            }
        }
    }
    
    // Check if placing this shape would cause any line clears
    try {
        const wouldCauseLineClear = wouldCreateLineClear(shape, startR, startC);
        if (wouldCauseLineClear.rows.length > 0 || wouldCauseLineClear.cols.length > 0) {
            // Highlight the lines that would be cleared with the shape's color
            for (const row of wouldCauseLineClear.rows) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    const cell = document.getElementById(`cell-${row}-${c}`);
                    if (cell) {
                        cell.classList.add('line-highlight');
                        cell.style.setProperty(
                            '--line-preview-color',
                            cell.classList.contains('preview') ? hexToRgba(shapeColor, 0.7) : hexToRgba(shapeColor, 0.6)
                        );
                    }
                }
            }
            
            for (const col of wouldCauseLineClear.cols) {
                for (let r = 0; r < BOARD_SIZE; r++) {
                    const cell = document.getElementById(`cell-${r}-${col}`);
                    if (cell) {
                        cell.classList.add('line-highlight');
                        cell.style.setProperty(
                            '--line-preview-color',
                            cell.classList.contains('preview') ? hexToRgba(shapeColor, 0.7) : hexToRgba(shapeColor, 0.6)
                        );
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error in drawPreview when checking for line clears:", e);
    }
}

async function endDrag(e) {
    if (!isDragging) return;

    if (e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) {
        haptic.track(e.clientX, e.clientY);
    }

    removeDragListeners();

    const coords = getBoardCoordinates();
    const piece = trayPieces[dragPieceIndex];
    const savedDragPieceIndex = dragPieceIndex;

    if (dragElement) {
        dragElement.remove();
        dragElement = null;
    }

    clearPreview();
    isDragging = false;
    dragPieceIndex = -1;
    dragPointerType = 'mouse';

    if (coords && canPlace(piece, coords.r, coords.c)) {
        const blocksPlaced = placeShape(piece, coords.r, coords.c);
        trayPieces[savedDragPieceIndex] = null;

        haptic.confirm(e ? { x: e.clientX, y: e.clientY } : null);
        renderBoard();

        if (isThreeByThreeSquare(piece)) {
            triggerCameraShake();
            playSound('hardPop');
        }

        for (let r = 0; r < piece.matrix.length; r++) {
            for (let c = 0; c < piece.matrix[0].length; c++) {
                if (piece.matrix[r][c]) {
                    const cellR = coords.r + r;
                    const cellC = coords.c + c;
                    const cell = document.getElementById(`cell-${cellR}-${cellC}`);
                    if (cell) {
                        const rect = cell.getBoundingClientRect();
                        createLandingParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, piece.color);
                    }
                }
            }
        }

        traySlots[savedDragPieceIndex].innerHTML = '';
        await checkLines(blocksPlaced);
        if (currentCharacterState === 'wait') {
            setCharacterState('base');
        }
        renderTray();
        fillTray();
    } else {
        playSound('click');
        if (traySlots[savedDragPieceIndex].firstElementChild) {
            traySlots[savedDragPieceIndex].firstElementChild.style.opacity = '1';
        }
        traySlots[savedDragPieceIndex].style.opacity = '1';
        if (currentCharacterState === 'wait') {
            setCharacterState('base');
        }
    }

    haptic.release();
}

function removeDragListeners() {
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', cancelDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', cancelDrag);
    window.removeEventListener('blur', cancelDrag);
}

function cancelDrag() {
    if (!isDragging) return;

    const savedDragPieceIndex = dragPieceIndex;

    removeDragListeners();

    if (dragElement) {
        dragElement.remove();
        dragElement = null;
    }

    clearPreview();
    isDragging = false;
    dragPieceIndex = -1;
    dragPointerType = 'mouse';

    if (savedDragPieceIndex >= 0 && traySlots[savedDragPieceIndex]?.firstElementChild) {
        traySlots[savedDragPieceIndex].firstElementChild.style.opacity = '1';
    }

    if (currentCharacterState === 'wait') {
        setCharacterState('base');
    }

    haptic.release();
}

function refreshLayoutMetrics() {
    cellSize = getCurrentCellSize();
    updateSplashPlayButtonPosition();
}

function canPlace(shape, startR, startC) {
    for (let r = 0; r < shape.matrix.length; r++) {
        for (let c = 0; c < shape.matrix[0].length; c++) {
            if (shape.matrix[r][c]) {
                const boardR = startR + r;
                const boardC = startC + c;
                if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
                    return false;
                }
                if (board[boardR][boardC] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeShape(shape, startR, startC) {
    let blocksPlaced = 0;
    for (let r = 0; r < shape.matrix.length; r++) {
        for (let c = 0; c < shape.matrix[0].length; c++) {
            if (shape.matrix[r][c]) {
                board[startR + r][startC + c] = shape.color;
                blocksPlaced++;
            }
        }
    }

    lastPlacementCoords = { r: startR, c: startC };
    playSound('pop');
    return blocksPlaced;
}

async function checkLines(blocksPlaced) {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r].every(cell => cell !== null)) {
            rowsToClear.push(r);
        }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
        let colFull = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (board[r][c] === null) {
                colFull = false;
                break;
            }
        }
        if (colFull) colsToClear.push(c);
    }

    const linesToClear = [];
    rowsToClear.forEach(r => {
        const line = [];
        for (let c = 0; c < BOARD_SIZE; c++) line.push(`${r},${c}`);
        linesToClear.push(line);
    });
    colsToClear.forEach(c => {
        const line = [];
        for (let r = 0; r < BOARD_SIZE; r++) line.push(`${r},${c}`);
        linesToClear.push(line);
    });

    const totalLines = linesToClear.length;
    if (totalLines > 0) {
        comboStreak += 1;
    } else {
        comboStreak = 0;
    }

    const initialPoints = 10 * blocksPlaced * (totalLines + 1);
    score += initialPoints;
    updateScore();

    if (lastPlacementCoords) {
        const centerR = lastPlacementCoords.r;
        const centerC = lastPlacementCoords.c;
        const cell = document.getElementById(`cell-${centerR}-${centerC}`);
        if (cell) {
            const rect = cell.getBoundingClientRect();
            createScorePopup(rect.left + rect.width / 2, rect.top + rect.height / 2, `+${initialPoints}`);
        }
    }

    if (totalLines > 0) {
        isAnimating = true;

        try {
            setCharacterState('fire');
            renderBoard();

            const linePoints = totalLines * 100;
            const comboBonus = comboStreak > 1 ? (comboStreak - 1) * 50 : 0;
            const extraPoints = linePoints + comboBonus;

            score += extraPoints;
            updateScore();

            if (lastPlacementCoords) {
                const centerR = lastPlacementCoords.r;
                const centerC = lastPlacementCoords.c;
                const cell = document.getElementById(`cell-${centerR}-${centerC}`);
                if (cell) {
                    const rect = cell.getBoundingClientRect();
                    const praiseLines = getMessages().praiseLines;
                    const praise = praiseLines[Math.min(totalLines - 1, praiseLines.length - 1)];
                    createPraisePopup(praise);

                    if (totalLines > 1 && extraPoints > 0) {
                        createScorePopup(rect.left + rect.width / 2, rect.top + rect.height / 2 + rect.height, `+${extraPoints}`);
                    }
                }
            }

            const cellsToClear = new Set();
            if (comboStreak >= 2) {
                showComboDisplay(`${getMessages().comboLabel} x${comboStreak}`);
            } else {
                hideComboDisplay();
            }

            playSound('line');

            for (let i = 0; i < totalLines; i++) {
                const currentLine = linesToClear[i];

                for (let j = 0; j < currentLine.length; j++) {
                    cellsToClear.add(currentLine[j]);
                }
            }

            const coordsArray = Array.from(cellsToClear).map(coord => {
                const [r, c] = coord.split(',').map(Number);
                return { coord, r, c };
            });

            if (lastPlacementCoords) {
                coordsArray.sort((a, b) => {
                    const distA = Math.abs(a.r - lastPlacementCoords.r) + Math.abs(a.c - lastPlacementCoords.c);
                    const distB = Math.abs(b.r - lastPlacementCoords.r) + Math.abs(b.c - lastPlacementCoords.c);
                    return distA - distB;
                });
            }

            await waitForGameplayResume();
            await new Promise(resolve => setTimeout(resolve, 120));

            // Последовательное исчезновение: от ближайших к последней установке к дальним
            for (const item of coordsArray) {
                const [r, c] = item.coord.split(',').map(Number);
                const cell = document.getElementById(`cell-${r}-${c}`);
                if (cell) {
                    const colorStr = board[r][c];
                    const rect = cell.getBoundingClientRect();
                    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, colorStr, 14);

                    const blockEl = cell.querySelector('.block-item');
                    if (blockEl) {
                        blockEl.classList.add('clearing');
                    }
                }

                await waitForGameplayResume();
                await new Promise(resolve => setTimeout(resolve, 45));

                board[r][c] = null;
                if (cell) {
                    const blockEl = cell.querySelector('.block-item');
                    if (blockEl) {
                        blockEl.style.opacity = '0';
                    }
                }
            }

            await waitForGameplayResume();
            await new Promise(resolve => setTimeout(resolve, 150));

            hideComboDisplay();

            renderBoard();
        } finally {
            isAnimating = false;
        }
    }

    lastPlacementCoords = null;
    return totalLines;
}

function createScorePopup(x, y, text) {
    const p = document.createElement('div');
    p.className = 'score-popup';
    p.textContent = text;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), SCORE_POPUP_LIFETIME_MS);
}

function createPraisePopup(text) {
    const p = document.createElement('div');
    p.className = 'praise-popup';
    p.textContent = text;
    p.style.left = `${window.innerWidth / 2}px`;
    p.style.top = `${window.innerHeight / 2}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), PRAISE_POPUP_LIFETIME_MS);
}

function createParticles(x, y, colorStr, particleSize = 14, count = 7, particleType = 'explosion') {
    // Вызываем метод из новой системы частиц
    particleSystem.createParticles(x, y, colorStr, particleSize, count, particleType);
}

function createLandingParticles(x, y, colorStr, particleType = 'landing') {
    // Вызываем метод из новой системы частиц
    particleSystem.createLandingParticles(x, y, colorStr, particleType);
}

function updateScore() {
    scoreEl.textContent = formatNumber(score);

    const duration = SCORE_ANIMATION_DURATION_MS;
    const startVal = displayedScore;
    const endVal = score;
    const startTime = performance.now();
    const currentAnimationToken = ++scoreAnimationToken;

    if (startVal === endVal) {
        displayedScore = endVal;
        mainScoreEl.textContent = formatNumber(displayedScore);
        return;
    }

    function animate(now) {
        if (currentAnimationToken !== scoreAnimationToken) {
            return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress);
        const nextDisplayedScore = Math.floor(startVal + (endVal - startVal) * ease);

        if (nextDisplayedScore !== displayedScore) {
            displayedScore = nextDisplayedScore;
            mainScoreEl.textContent = formatNumber(displayedScore);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            displayedScore = endVal;
            mainScoreEl.textContent = formatNumber(displayedScore);
        }
    }
    requestAnimationFrame(animate);
}

function checkGameOver() {
    if (isGameOverSequenceActive || gameOverScreen.classList.contains('show') || secondChanceModal.classList.contains('show')) {
        return;
    }

    clearPendingGameOver();

    for (let i = 0; i < 3; i++) {
        const piece = trayPieces[i];
        if (!piece) continue;

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlace(piece, r, c)) {
                    return;
                }
            }
        }
    }

    gameOverTimeoutId = setTimeout(async () => {
        await waitForGameplayResume();
        
        if (!hasUsedSecondChance && window.YandexSDK && window.YandexSDK.isAvailable()) {
            pendingRewardShapes = generateRewardShapes();
            renderRewardShapes(pendingRewardShapes);
            showSecondChance();
        } else {
            showGameOver();
        }
        
        gameOverTimeoutId = null;
    }, 500);
}

applyTranslations(currentLanguage);
loadBestScore();
syncSoundToggleUI();
void initializeLanguage();
void initializeYandexLifecycle();

async function syncBestScoreWithYandex() {
    if (window.YandexSDK && window.YandexSDK.isAvailable()) {
        try {
            const currentLocal = bestScore || 0;
            const yaScore = await window.YandexSDK.getBestScore();
            
            if (typeof yaScore === 'number' && yaScore > currentLocal) {
                bestScore = yaScore;
                try {
                    window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
                } catch (e) {}
                updateBestScoreDisplay();
            } else if (currentLocal > (yaScore || 0)) {
                window.YandexSDK.saveBestScore(currentLocal);
                if (!window.YandexSDK.isMethodAvailable || window.YandexSDK.isMethodAvailable('leaderboards.setScore')) {
                    window.YandexSDK.setLeaderboardScore(currentLocal);
                }
            }
        } catch (e) {
            console.warn('Error syncing Yandex score:', e);
        }
    }
}

function handleGlobalKeydown(event) {
    if (event.key === 'Escape' && settingsModal.classList.contains('show')) {
        closeSettingsModal();
    }
}

function startGame() {
    splashOverlay.classList.add('hidden');
    closeSettingsModal();
    hasGameStarted = true;
    audioManager.beginGameSession().catch(() => {});
    haptic.confirm();
    initGame();
    syncGameplayState();
    void initializeYandexLifecycle();

    if (window.YandexSDK) {
        if (window.YandexSDK.isAvailable()) {
            window.YandexSDK.dispatchGameStartEvent();
            syncGameplayState();
        } else {
            // Ждем инициализации
            setTimeout(() => {
                if (window.YandexSDK.isAvailable()) {
                    window.YandexSDK.dispatchGameStartEvent();
                    syncGameplayState();
                }
            }, 1000);
        }
        
        // Синхронизируем рекорды с небольшой задержкой, чтобы SDK точно успело загрузить данные
        setTimeout(syncBestScoreWithYandex, 500);
        // Запросим еще раз чуть позже на случай долгой инициализации SDK
        setTimeout(syncBestScoreWithYandex, 2500);
    }
}

// Start game on tap anywhere in the splash overlay
splashOverlay.addEventListener('pointerdown', (e) => {
    if (!hasGameStarted) {
        startGame();
    }
});

restartBtn.addEventListener('click', startGame);

if (secondChanceAdBtn) {
    secondChanceAdBtn.addEventListener('click', () => {
        if (!window.YandexSDK || !window.YandexSDK.isAvailable()) {
            // Фолбэк, если SDK вдруг недоступен
            window.open('https://gritsenko.biz', '_blank');
            applySecondChanceReward();
            return;
        }

        window.YandexSDK.showRewardedVideo({
            onOpen: () => {
                audioManager.suspend().catch(() => {});
                syncGameplayState();
            },
            onRewarded: () => {
                applySecondChanceReward();
            },
            onClose: () => {
                if (!isGameplayPausedBySdk) {
                    audioManager.resume().catch(() => {});
                }
                
                // Если награда не получена, показываем game over
                if (!hasUsedSecondChance) {
                    pendingRewardShapes = null;
                    secondChanceModal.classList.remove('show');
                    finalizeBestScore();
                    gameOverScoreEl.textContent = formatNumber(score);
                    revealGameOverScreen();
                } else {
                    syncGameplayState();
                }
            },
            onError: () => {
                if (!isGameplayPausedBySdk) {
                    audioManager.resume().catch(() => {});
                }
                pendingRewardShapes = null;
                secondChanceModal.classList.remove('show');
                finalizeBestScore();
                gameOverScoreEl.textContent = formatNumber(score);
                revealGameOverScreen();
            }
        });
    });
}

if (secondChanceSkipBtn) {
    secondChanceSkipBtn.addEventListener('click', () => {
        pendingRewardShapes = null;
        secondChanceModal.classList.remove('show');
        finalizeBestScore();
        gameOverScoreEl.textContent = formatNumber(score);
        revealGameOverScreen();
    });
}

function applySecondChanceReward() {
    hasUsedSecondChance = true;
    secondChanceModal.classList.remove('show');
    isGameOverSequenceActive = false;
    gameContainer.classList.remove('game-over-transition');
    
    if (pendingRewardShapes) {
        for (let i = 0; i < 3; i++) {
            trayPieces[i] = pendingRewardShapes[i];
        }
    }
    pendingRewardShapes = null;
    
    renderTray();
    syncGameplayState();
}

settingsBtn.addEventListener('click', openSettingsModal);
settingsCloseBtn.addEventListener('click', closeSettingsModal);
musicToggle.addEventListener('change', event => {
    setSoundPreference(Boolean(event.target.checked));
});
document.addEventListener('keydown', handleGlobalKeydown);

document.addEventListener('pointermove', function (e) {
    if (isDragging) e.preventDefault();
}, { passive: false });

window.addEventListener('resize', refreshLayoutMetrics);
window.addEventListener('orientationchange', refreshLayoutMetrics);
window.addEventListener('load', refreshLayoutMetrics);
requestAnimationFrame(refreshLayoutMetrics);

const debugGameOverBtn = document.getElementById('debug-gameover-btn');
if (debugGameOverBtn && isLocalhost) {
    debugGameOverBtn.style.display = 'block';
    debugGameOverBtn.addEventListener('click', () => {
        if (!hasUsedSecondChance) {
            pendingRewardShapes = generateRewardShapes();
            renderRewardShapes(pendingRewardShapes);
            showSecondChance();
        } else {
            showGameOver();
        }
    });
}

const debugLangBtn = document.getElementById('debug-lang-btn');
if (debugLangBtn && isLocalhost) {
    const SUPPORTED_LANGUAGES = Object.keys(I18N);
    const updateDebugLangLabel = () => {
        debugLangBtn.textContent = `Lang: ${currentLanguage.toUpperCase()}`;
    };
    debugLangBtn.style.display = 'block';
    updateDebugLangLabel();
    debugLangBtn.addEventListener('click', () => {
        const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLanguage);
        const nextLang = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
        applyTranslations(nextLang);
        try {
            window.localStorage.setItem(DEBUG_LANGUAGE_KEY, currentLanguage);
        } catch {
            // ignore storage errors
        }
        updateDebugLangLabel();
    });
}

window.initGame = initGame;
window.startGame = startGame;
