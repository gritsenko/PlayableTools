import { ComponentBase, customElement, html, inject, state, property } from "fw";
import type { PropertyValues } from 'lit';
import { PreviewService } from "../../services/PreviewService";
import { VideoStorageService } from "../../services/VideoStorageService";
import type { PreviewLanguageOption, PreviewPreset, PreviewRecordingResult } from "../../services/types";
import type { ValidationResult } from "../../services/PreviewServiceValidators";
import "../../assets/pako_inflate.min.js";
import { installIframeScreenshotCapture } from "./iframe-screenshot-capture";
import "./save-creative-modal";
import "./preview-video-modal";
import "./recordings-list-modal";

type PreviewDeviceOption = {
  name: string;
  width?: number;
  height?: number;
  type?: 'phone' | 'tablet';
  disabled?: boolean;
};

type PreviewVideoModalElement = HTMLElement & {
  show: (clip: PreviewRecordingResult, fileBaseName: string) => Promise<void> | void;
};

type PreviewIframeWindow = Window & {
  __ptGuardInstalled?: boolean;
  __ptGuard?: { setLocked: (locked: boolean) => void };
  __ptScreenshotInstalled?: boolean;
};

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;
  @inject(VideoStorageService) videoStorageService!: VideoStorageService;

  private static readonly sdkEventPresetIds = new Set(['preview-cta', 'yandex-games', 'ads-manager']);

  @property() fileName: string = "";

  pageContent: string = "";
  loading: boolean = true;
  error: string = "";
  private uploadedContentUnsubscribe?: () => void;
  private presetUnsubscribe?: () => void;
  private previewLanguageUnsubscribe?: () => void;
  private validationUnsubscribe?: () => void;
  private zipPreviewUnsubscribe?: () => void;
  @state() private currentPreset: PreviewPreset | null = null;
  @state() private currentLanguage: string | null = null;
  @state() private availablePresets: PreviewPreset[] = [];
  @state() private isPresetSwitching: boolean = false;
  @state() private isLanguageMenuOpen: boolean = false;
  @state() private presetSuccessMessage: string = "";
  @state() private validationResults: ValidationResult | null = null;
  @state() private zipPreviewUrl: string | null = null;
  @state() private _sdkEvents: Array<{ event: string; args: any[]; elapsedMs: number }> = [];
  @state() private _iframeLoadMs: number | null = null;
  @state() private _reloadKey: number = 0;
  @state() private _adOverlay: { id: string; kind: 'rewarded' | 'interstitial'; remaining: number; canClose: boolean } | null = null;
  @state() private _adBannerVisible: boolean = false;
  private _adOverlayTimer?: ReturnType<typeof setInterval>;
  private _sdkEventStart: number | null = null;
  private _iframeLoadStart: number | null = null;
  private _onMessageHandler?: (e: MessageEvent) => void;
  private _onDocumentMouseDown?: (e: MouseEvent) => void;
  private _onDocumentKeyDown?: (e: KeyboardEvent) => void;

  devices: PreviewDeviceOption[] = [
    { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'phone' },
    { name: 'iPhone 14', width: 390, height: 844, type: 'phone' },
    { name: 'iPhone SE', width: 375, height: 667, type: 'phone' },
    { name: 'Google Pixel 7 Pro', width: 412, height: 892, type: 'phone' },
    { name: 'Samsung Galaxy S23 Ultra', width: 384, height: 851, type: 'phone' },
    { name: 'Generic Android', width: 360, height: 800, type: 'phone' },
    { name: '--- Tablets ---', disabled: true },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet' },
    { name: 'iPad Air', width: 820, height: 1180, type: 'tablet' },
    { name: 'Samsung Galaxy Tab S8', width: 800, height: 1280, type: 'tablet' },
    { name: 'Generic tablet', width: 768, height: 1024, type: 'tablet' },
  ];
  selectedDeviceIdx: number = 2;
  isPortrait: boolean = true;

  get selectedDevice() {
    return this.devices[this.selectedDeviceIdx];
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.availablePresets = this.previewService.getAvailablePresets();
    this.currentPreset = this.previewService.getCurrentPreset();
    this.currentLanguage = this.previewService.getCurrentPresetLanguage();
    
    this.uploadedContentUnsubscribe = this.previewService.onUploadedContentChange((content) => {
      console.log(`📁 playable-previewer: onUploadedContentChange fired, content length: ${content?.length || 0}`);
      if (content) {
        this.pageContent = content;
        this.loading = false;
        this.error = "";
        this._sdkEvents = [];
        this._sdkEventStart = null;
        this._iframeLoadMs = null;
        this._iframeLoadStart = performance.now();
        this._resetAdOverlay();
        console.log(`✅ playable-previewer: Content set, loading=false`);
        this.requestUpdate();
      } else {
        console.log(`📁 Uploaded content cleared`);
        this.pageContent = "";
        this.loading = false;
        this.error = "";
        this._sdkEvents = [];
        this._sdkEventStart = null;
        this._iframeLoadMs = null;
        this._iframeLoadStart = null;
        this._resetAdOverlay();
      }
    });
    
    this.presetUnsubscribe = this.previewService.onPresetChange((preset) => {
      this.currentPreset = preset;
      this.isLanguageMenuOpen = false;
      this._resetAdOverlay();
      this.requestUpdate();
    });

    this.previewLanguageUnsubscribe = this.previewService.onPreviewLanguageChange((language) => {
      this.currentLanguage = language;
      if (!this._supportsLanguageSwitching()) {
        this.isLanguageMenuOpen = false;
      }
      this.requestUpdate();
    });
    
    this.validationUnsubscribe = this.previewService.onValidationChange((results) => {
      this.validationResults = results;
      this.requestUpdate();
    });

    this.zipPreviewUnsubscribe = this.previewService.onZipPreviewUrlChange((url) => {
      this.zipPreviewUrl = url;
      this.requestUpdate();
    });
    this.zipPreviewUrl = this.previewService.getZipPreviewUrl();
    
    const existingContent = this.previewService.getUploadedContent();
    console.log(`🔍 playable-previewer: checking existing content at connectedCallback, length: ${existingContent?.length || 0}`);
    if (existingContent) {
      this.pageContent = existingContent;
      this.loading = false;
      this.error = "";
      console.log(`✅ playable-previewer: Set existing content, loading=false`);
      this.requestUpdate();
    }

    // Get initial validation results
    this.validationResults = this.previewService.getValidationResults();

    // Listen for CTA SDK events posted from the playable iframe
    this._onMessageHandler = (e: MessageEvent) => {
      try {
        const data = e.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'cta-event' || data.type === 'sdk-event') {
          if (this._sdkEventStart === null) this._sdkEventStart = Date.now();
          const elapsedMs = typeof data.elapsedMs === 'number' ? data.elapsedMs : (Date.now() - this._sdkEventStart);
          this._sdkEvents = [...this._sdkEvents, { event: data.event, args: data.args || [], elapsedMs }];
          this.requestUpdate();
        } else if (data.type === 'ads-manager-show' && this.currentPreset?.id === 'ads-manager') {
          this._startAdOverlay(
            data.adKind === 'rewarded' ? 'rewarded' : 'interstitial',
            String(data.id || ''),
            Math.max(0, Number(data.durationMs) || 0),
          );
        } else if (data.type === 'ads-manager-banner' && this.currentPreset?.id === 'ads-manager') {
          this._adBannerVisible = !!data.visible;
          this.requestUpdate();
        } else if (data.type === 'cta-game-start' || data.type === 'sdk-session-start') {
          if (this._sdkEventStart === null) this._sdkEventStart = Date.now();
          this.requestUpdate();
        }
      } catch {
        // ignore malformed messages
      }

      try {
        const data = e.data;
        if (data && data.type === 'RECORDING_COMPLETE' && data.blob) {
          const durationMs = data.durationMs || 0;
          const width = Number.isFinite(data.width) ? data.width : 0;
          const height = Number.isFinite(data.height) ? data.height : 0;
          this._suppressIframe = false; // Restore preview
          this.videoStorageService.saveVideo(data.blob, durationMs).then(() => {
            const clip: PreviewRecordingResult = {
              blob: data.blob,
              mimeType: data.blob.type || 'video/webm',
              fileExtension: (data.blob.type || '').includes('mp4') ? 'mp4' : 'webm',
              durationMs,
              width,
              height,
              startedAt: Date.now() - durationMs
            };
            this._openRecordedClip(clip);
          }).catch(err => {
            this._showTransientError('Failed to save recorded video: ' + String(err));
          });
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', this._onMessageHandler);

    this._onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-preview-language-switcher]')) {
        return;
      }

      if (this.isLanguageMenuOpen) {
        this.isLanguageMenuOpen = false;
        this.requestUpdate();
      }
    };
    document.addEventListener('mousedown', this._onDocumentMouseDown);

    this._onDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isLanguageMenuOpen) {
        this.isLanguageMenuOpen = false;
        this.requestUpdate();
      }
    };
    document.addEventListener('keydown', this._onDocumentKeyDown);

    // Listen for playable-screen-lock events so external emitters (service or page) can update UI
    this._playableLockHandler = (e: Event) => {
      try {
        const ev = e as CustomEvent<{ locked: boolean }>;
        this._locked = !!ev.detail?.locked;
        this.requestUpdate();
      } catch (err) {
        console.warn('playable-previewer: lock handler error', err);
      }
    };
    window.addEventListener('playable-screen-lock', this._playableLockHandler as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.uploadedContentUnsubscribe) {
      this.uploadedContentUnsubscribe();
    }
    if (this.presetUnsubscribe) {
      this.presetUnsubscribe();
    }
    if (this.previewLanguageUnsubscribe) {
      this.previewLanguageUnsubscribe();
    }
    if (this.validationUnsubscribe) {
      this.validationUnsubscribe();
    }
    if (this.zipPreviewUnsubscribe) {
      this.zipPreviewUnsubscribe();
    }
    if (this._playableLockHandler) {
      window.removeEventListener('playable-screen-lock', this._playableLockHandler as EventListener);
    }
    if (this._onMessageHandler) {
      window.removeEventListener('message', this._onMessageHandler);
    }
    if (this._onDocumentMouseDown) {
      document.removeEventListener('mousedown', this._onDocumentMouseDown);
    }
    if (this._onDocumentKeyDown) {
      document.removeEventListener('keydown', this._onDocumentKeyDown);
    }
    if (this._adOverlayTimer) {
      clearInterval(this._adOverlayTimer);
      this._adOverlayTimer = undefined;
    }
  }

  private _resetAdOverlay() {
    if (this._adOverlayTimer) {
      clearInterval(this._adOverlayTimer);
      this._adOverlayTimer = undefined;
    }
    this._adOverlay = null;
    this._adBannerVisible = false;
  }

  protected override updated(_changedProps: PropertyValues): void {
    const logEl = this.querySelector('#sdk-log-scroll') as HTMLElement | null;
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  }

  private _playableLockHandler?: (e: Event) => void;
  @state() private _locked: boolean = false;
  @state() private _muted: boolean = false;
  @state() private _suppressIframe: boolean = false;

  private _restartPlayable() {
    this._reloadKey++;
    this._sdkEvents = [];
    this._sdkEventStart = null;
    this._iframeLoadMs = null;
    this._iframeLoadStart = performance.now();
    this._resetAdOverlay();
    this.requestUpdate();
  }

  private _toggleLock() {
    this._locked = !this._locked;
    try {
      this.previewService.handleScreenLockChange(this._locked);
    } catch (err) {
      console.warn('playable-previewer: failed to notify service about lock change', err);
    }
    this.requestUpdate();
    
    // Tell iframe to allow/disallow blur events and simulate accordingly
    this._setPlayableLocked(this._locked);
    
    // Refocus the iframe when unlocking to restore interaction
    if (!this._locked) {
      this._refocusIframe();
    }
  }

  private _toggleMute() {
    this._muted = !this._muted;
    try {
      // Dispatch custom event for mute state change (host window)
      window.dispatchEvent(new CustomEvent('playable-audio-mute', {
        detail: { muted: this._muted }
      }));
      // Also dispatch inside the playable iframe so in-iframe listeners (e.g., mraid shim) receive it
      this._dispatchToIframe('playable-audio-mute', { muted: this._muted });
    } catch (err) {
      console.warn('playable-previewer: failed to dispatch mute event', err);
    }
    this.requestUpdate();
    
    // When unmuting, restore focus to the playable content
    if (!this._muted) {
      this._refocusIframe();
    }
  }
  
  private _refocusIframe() {
    const iframe = this._getIframeEl();
    if (iframe) {
      try {
        iframe.focus();
        // Best-effort focus to the inner document as well
        iframe.contentWindow?.focus();
      } catch (err) {
        console.warn('playable-previewer: failed to refocus iframe', err);
      }
    }
  }
  
  private _getIframeEl(): HTMLIFrameElement | null {
    // ComponentBase renders in light DOM, so query directly
    return (this as unknown as HTMLElement).querySelector('.playable-iframe');
  }

  // ---- AdsManager ad-stub overlay (rendered on top of the simulator) --------
  private _startAdOverlay(kind: 'rewarded' | 'interstitial', id: string, durationMs: number) {
    if (this._adOverlayTimer) {
      clearInterval(this._adOverlayTimer);
      this._adOverlayTimer = undefined;
    }

    const remaining = Math.max(0, Math.ceil(durationMs / 1000));
    this._adOverlay = { id, kind, remaining, canClose: remaining === 0 };
    this.requestUpdate();

    if (remaining === 0) return;

    this._adOverlayTimer = setInterval(() => {
      if (!this._adOverlay) {
        if (this._adOverlayTimer) clearInterval(this._adOverlayTimer);
        this._adOverlayTimer = undefined;
        return;
      }
      const next = this._adOverlay.remaining - 1;
      if (next <= 0) {
        if (this._adOverlayTimer) clearInterval(this._adOverlayTimer);
        this._adOverlayTimer = undefined;
        this._adOverlay = { ...this._adOverlay, remaining: 0, canClose: true };
      } else {
        this._adOverlay = { ...this._adOverlay, remaining: next };
      }
      this.requestUpdate();
    }, 1000);
  }

  private _renderAdOverlay(overlay: { id: string; kind: 'rewarded' | 'interstitial'; remaining: number; canClose: boolean }) {
    const isRewarded = overlay.kind === 'rewarded';
    const title = isRewarded ? 'Simulated Rewarded Video' : 'Simulated Interstitial';
    const subtitle = isRewarded ? 'Watch to the end to earn your reward' : 'This is a full-screen ad';
    const statusLine = overlay.canClose
      ? 'Tap ✕ to close'
      : isRewarded
        ? `Reward in ${overlay.remaining}s…`
        : `You can close in ${overlay.remaining}s…`;

    return html`
      <div class="absolute inset-0 z-[60] flex flex-col items-center justify-center text-center select-none"
           style="background:#0b1020;color:#fff;">
        <div class="absolute top-3 left-3 bg-yellow-400 text-black text-[11px] font-bold leading-none px-2 py-1 rounded tracking-wide">Ad</div>

        <button
          @click=${() => { if (overlay.canClose) this._finishAdOverlay(isRewarded ? 'rewarded' : 'dismissed'); }}
          ?disabled=${!overlay.canClose}
          aria-label="Close ad"
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-base p-0 border-0 ${overlay.canClose ? 'bg-white/30 text-white cursor-pointer opacity-100' : 'bg-white/20 text-white cursor-not-allowed opacity-40'}"
        >✕</button>

        <div class="text-[18px] font-semibold mb-2.5 opacity-95">${title}</div>
        <div class="text-[13px] opacity-60 mb-5 max-w-[80%]">${subtitle}</div>

        <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-[3px] ${overlay.canClose ? (isRewarded ? 'border-emerald-400' : 'border-white/55') : 'border-white/25'}">
          ${overlay.remaining > 0 ? overlay.remaining : '✓'}
        </div>

        <div class="absolute bottom-[18px] text-xs opacity-55">${statusLine}</div>

        ${isRewarded && !overlay.canClose ? html`
          <button
            @click=${() => this._finishAdOverlay('dismissed')}
            class="absolute bottom-11 border border-white/30 bg-transparent text-white/70 text-xs px-3.5 py-1.5 rounded-md cursor-pointer"
          >Skip (no reward)</button>
        ` : null}
      </div>
    `;
  }

  private _finishAdOverlay(status: 'rewarded' | 'dismissed') {
    const overlay = this._adOverlay;
    if (!overlay) return;

    if (this._adOverlayTimer) {
      clearInterval(this._adOverlayTimer);
      this._adOverlayTimer = undefined;
    }
    this._adOverlay = null;
    this.requestUpdate();

    try {
      this._getIframeEl()?.contentWindow?.postMessage(
        { type: 'ads-manager-result', id: overlay.id, status },
        '*',
      );
    } catch (err) {
      console.warn('playable-previewer: failed to post ad result to iframe', err);
    }
  }
  
  private _dispatchToIframe(eventName: string, detail?: any) {
    try {
      const win = this._getIframeEl()?.contentWindow;
      if (win) {
        win.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    } catch (err) {
      console.warn('playable-previewer: failed to dispatch event into iframe', eventName, err);
    }
  }
  
  // Install event guards inside the iframe so normal page clicks do not pause the playable.
  // We stop blur/visibility events from reaching the playable unless the lock button is used.
  private _installFocusGuards = (e: Event) => {
    // Record iframe load time
    if (this._iframeLoadStart !== null) {
      this._iframeLoadMs = performance.now() - this._iframeLoadStart;
      this.requestUpdate();
    }

    const iframe = e.currentTarget as HTMLIFrameElement;
  const win = iframe?.contentWindow as PreviewIframeWindow | null;
    const doc = win?.document;
    if (!win || !doc) return;
    
    if (win.__ptGuardInstalled) return;
    win.__ptGuardInstalled = true;
    
  const state: { guardActive: boolean; locked: boolean } = { guardActive: true, locked: false };
    
    const stop = (ev: Event) => {
      if (state.guardActive) {
        try { (ev as any).stopImmediatePropagation?.(); } catch {}
        try { ev.stopPropagation(); } catch {}
        try { ev.preventDefault(); } catch {}
      }
    };
    
    // Block common events that playables use to pause when losing focus
    const windowEvents = ['blur'];
    const docEvents = ['blur', 'visibilitychange', 'pagehide'];
    windowEvents.forEach(t => win.addEventListener(t, stop, true));
    docEvents.forEach(t => doc.addEventListener(t, stop, true));

    // Stronger guard: override dispatchEvent so even earlier listeners don't receive these events
    try {
      const blocked = new Set(['blur', 'visibilitychange', 'pagehide']);
      const origDispatchEvent = EventTarget.prototype.dispatchEvent;
      (EventTarget.prototype as any).dispatchEvent = function(ev: Event) {
        try {
          if ((blocked as Set<string>).has(ev?.type) && state.guardActive) {
            return true; // swallow
          }
        } catch {}
        return origDispatchEvent.call(this, ev);
      };
    } catch {}
    
    // Optional: keep document.hasFocus() returning true unless locked
    try {
      const origHasFocus = doc.hasFocus.bind(doc);
      (doc as any).hasFocus = () => !state.guardActive ? origHasFocus() : true;
    } catch {}

    // Visibility state shim: reflect locked state as hidden for APIs that read it (e.g., MRAID shims)
    try {
      const visDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
      const hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
      const getVis = visDesc && visDesc.get ? () => visDesc.get!.call(doc) : () => 'visible';
      const getHidden = hiddenDesc && hiddenDesc.get ? () => hiddenDesc.get!.call(doc) : () => false;

      Object.defineProperty(doc, 'visibilityState', {
        get() { return state.locked ? 'hidden' as DocumentVisibilityState : (getVis() as DocumentVisibilityState); },
        configurable: true
      });
      Object.defineProperty(doc, 'hidden', {
        get() { return state.locked ? true : !!getHidden(); },
        configurable: true
      });
    } catch {}
    
    // API to toggle lock behavior from host
    win.__ptGuard = {
      setLocked(locked: boolean) {
        state.locked = locked;
        state.guardActive = !locked; // when locked, allow events through
        try {
          if (locked) {
            // Simulate blur/visibility change so playable can pause itself
            try { win.dispatchEvent(new Event('blur', { bubbles: false })); } catch {}
            try { doc.dispatchEvent(new Event('visibilitychange', { bubbles: true })); } catch {}
          } else {
            // Simulate focus back
            // Temporarily disable guard so synthetic events are delivered
            const prev = state.guardActive;
            state.guardActive = false;
            try { win.dispatchEvent(new Event('focus', { bubbles: false })); } catch {}
            try { doc.dispatchEvent(new Event('visibilitychange', { bubbles: true })); } catch {}
            state.guardActive = prev;
            try { win.focus(); } catch {}
          }
        } catch {}
      }
    };


    this._installScreenshotCaptureHelper(doc, win);
  };


  private _installScreenshotCaptureHelper(doc: Document, win: PreviewIframeWindow) {
    installIframeScreenshotCapture(win, doc);
  }
  private renderPlayableIframe() {
    if (this._suppressIframe) {
      return html`
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
          <div>
            <span class="material-icons-outlined text-4xl mb-2 opacity-50">videocam</span>
            <p>Recording in progress in a popup window...</p>
            <button class="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors text-sm" @click=${() => this._suppressIframe = false}>
              Restore Preview
            </button>
          </div>
        </div>
      `;
    }

    if (this.zipPreviewUrl) {
      // Append reload key as query param so the browser considers it a new URL
      const reloadUrl = this.zipPreviewUrl.split('?')[0] + (this._reloadKey ? `?_r=${this._reloadKey}` : '');
      return html`<iframe
        src="${reloadUrl}"
        class="playable-iframe"
        frameborder="0"
        allowfullscreen
        style="width:100%; height:100%; border:none;"
        @load="${this._installFocusGuards}"
      ></iframe>`;
    }
    
    // If content has a base href (ZIP playable), don't render srcdoc until ZIP preview URL is ready
    if (this.pageContent && this.pageContent.includes('<base href=')) {
      console.log(`⏳ playable-previewer: Waiting for ZIP preview URL to be set before rendering`);
      return html`<div class="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-800">
        <div class="text-center">
          <div class="inline-flex items-center justify-center mb-4">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
          <p class="text-slate-600 dark:text-slate-400">Initializing ZIP preview...</p>
        </div>
      </div>`;
    }
    
    if (this.pageContent) {
      // Prepend a reload comment so Lit sees a new srcdoc string and destroys/recreates the iframe
      const reloadedContent = this._reloadKey > 0 ? `<!-- reload:${this._reloadKey} -->\n${this.pageContent}` : this.pageContent;
      return html`<iframe
        srcdoc="${reloadedContent}"
        class="playable-iframe"
        frameborder="0"
        allowfullscreen
        style="width:100%; height:100%; border:none;"
        @load="${this._installFocusGuards}"
      ></iframe>`;
    }
    return null;
  }
  
  private _setPlayableLocked(locked: boolean) {
    const iframe = this._getIframeEl();
    const win = iframe?.contentWindow as (Window & { __ptGuard?: { setLocked: (b: boolean) => void } });
    try {
      win?.__ptGuard?.setLocked(locked);
    } catch (err) {
      // Guard may not yet be installed if iframe hasn't loaded; try again shortly.
      setTimeout(() => {
        try { iframe?.contentWindow && (iframe.contentWindow as any).__ptGuard?.setLocked(locked); } catch {}
      }, 50);
    }
  }

  private _supportsSdkEventLog(): boolean {
    return PlayablePreviewer.sdkEventPresetIds.has(this.currentPreset?.id || '');
  }

  async _captureScreenshot() {
    try {
      this.requestUpdate();
      const iframe = this._getIframeEl();
      if (!iframe) {
        throw new Error('Playable iframe not found');
      }
      const blob = await this.previewService.captureScreenshot(iframe);
      
      // Open in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      this.error = `Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`;
      this.requestUpdate();
      setTimeout(() => {
        this.error = '';
        this.requestUpdate();
      }, 3000);
    }
  }

  private _getRecordingBaseName(): string {
    const rawName = (this.fileName || this.previewService.getUploadedFileName() || 'playable-preview')
      .replace(/\.(html?|zip)$/i, '')
      .trim();
    const normalizedName = rawName.length > 0 ? rawName : 'playable-preview';
    return normalizedName.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'playable-preview';
  }

  private _showTransientError(message: string, timeoutMs: number = 4000) {
    this.error = message;
    this.requestUpdate();
    window.setTimeout(() => {
      if (this.error === message) {
        this.error = '';
        this.requestUpdate();
      }
    }, timeoutMs);
  }

  private _openRecordedClip(clip: PreviewRecordingResult) {
    const modal = ((this as unknown as HTMLElement).querySelector('preview-video-modal')
      || document.querySelector('preview-video-modal')) as PreviewVideoModalElement | null;

    if (modal) {
      void modal.show(clip, this._getRecordingBaseName());
      return;
    }

    this._showTransientError('Recorded clip is ready, but the export modal is unavailable.');
  }



  private async _toggleRecording() {
    let iframeUrl = '';
    if (this.zipPreviewUrl) {
      iframeUrl = this.zipPreviewUrl.split('?')[0] + (this._reloadKey ? `?_r=${this._reloadKey}` : '');
    } else if (this.pageContent) {
      const blob = new Blob([this.pageContent], { type: 'text/html' });
      iframeUrl = URL.createObjectURL(blob);
    }

    if (!iframeUrl) {
      this._showTransientError('No content available for recording.');
      return;
    }

    const device = this.selectedDevice;
    const width = (this.isPortrait ? device.width : device.height) || 375;
    const height = (this.isPortrait ? device.height : device.width) || 667;
    const popupOuterWidth = width + 420;
    const popupOuterHeight = Math.max(height + 120, 620);

    const popupUrl = `/recorder-popup?url=${encodeURIComponent(iframeUrl)}&width=${width}&height=${height}`;
    
    // Suspend the main iframe so we don't have overlapping audio
    this._suppressIframe = true;

    // Popup window options with dimensions to accommodate the device size
    window.open(
      popupUrl,
      'RecorderPopup',
      `width=${popupOuterWidth},height=${popupOuterHeight},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`,
    );
  }

  private _openRecordingsList() {
    const modal = (this as any).querySelector('recordings-list-modal') || document.querySelector('recordings-list-modal');
    if (modal) {
      (modal as any).show();
    } else {
      this._showTransientError('Recordings list modal is unavailable.');
    }
  }

  private _formatAspectRatio(width?: number, height?: number): string {
    if (!width || !height) {
      return 'n/a';
    }

    const normalizedRatio = Math.max(width, height) / Math.min(width, height);
    const ratioCandidates = [
      { label: '4:3', value: 4 / 3 },
      { label: '3:2', value: 3 / 2 },
      { label: '16:10', value: 16 / 10 },
      { label: '16:9', value: 16 / 9 },
      { label: '18:9', value: 18 / 9 },
      { label: '19:9', value: 19 / 9 },
      { label: '19.5:9', value: 19.5 / 9 },
      { label: '20:9', value: 20 / 9 },
      { label: '21:9', value: 21 / 9 },
    ];

    let bestCandidate = ratioCandidates[0];
    let bestDistance = Math.abs(normalizedRatio - bestCandidate.value);
    for (const candidate of ratioCandidates.slice(1)) {
      const distance = Math.abs(normalizedRatio - candidate.value);
      if (distance < bestDistance) {
        bestCandidate = candidate;
        bestDistance = distance;
      }
    }

    if (bestDistance <= 0.04) {
      return bestCandidate.label;
    }

    const normalizedToNine = (normalizedRatio * 9).toFixed(1).replace(/\.0$/, '');
    return `${normalizedToNine}:9`;
  }

  private _getDeviceLabel(device: PreviewDeviceOption): string {
    if (device.disabled) {
      return device.name;
    }

    const width = device.width || 0;
    const height = device.height || 0;
    return `${device.name} - ${width}x${height} - ${this._formatAspectRatio(width, height)}`;
  }

  private _getDeviceSummary(device: PreviewDeviceOption): string {
    const width = device.width || 0;
    const height = device.height || 0;
    return `${width} x ${height} px • ${this._formatAspectRatio(width, height)}`;
  }
  
  handleDeviceChange(e: Event) {
    const idx = Number((e.target as HTMLSelectElement).value);
    this.selectedDeviceIdx = idx;
    this.requestUpdate();
  }

  toggleOrientation() {
    this.isPortrait = !this.isPortrait;
    this.requestUpdate();
  }

  async handlePresetChange(e: Event) {
    const presetId = (e.target as HTMLSelectElement).value;
    const preset = this.previewService.getPresetById(presetId);
    
    if (preset) {
      this.isPresetSwitching = true;
      this.error = "";
      this.requestUpdate();
      
      try {
        this.previewService.setCurrentPreset(preset);
        
        // Reprocess existing content with new preset (works for both uploaded and GitHub content)
        await this.previewService.reloadContentWithPreset(preset);
        
        this.presetSuccessMessage = `✅ Applied ${preset.name} preset`;
        setTimeout(() => {
          this.presetSuccessMessage = "";
          this.requestUpdate();
        }, 3000);
        
      } catch (error) {
        console.error(`❌ Failed to switch preset:`, error);
        this.error = `Failed to apply preset: ${error instanceof Error ? error.message : String(error)}`;
      } finally {
        this.isPresetSwitching = false;
        this.requestUpdate();
      }
    }
  }

  private _supportsLanguageSwitching(): boolean {
    return !!this.currentPreset?.supportsLanguageSwitching
      && (this.currentPreset.availableLanguages?.length || 0) > 1;
  }

  private _getAvailableLanguages(): PreviewLanguageOption[] {
    return this.previewService.getAvailableLanguagesForPreset(this.currentPreset);
  }

  private _getCurrentLanguageOption(): PreviewLanguageOption | null {
    const currentLanguage = this.currentLanguage;
    if (!currentLanguage) {
      return null;
    }

    return this._getAvailableLanguages().find(language => language.code === currentLanguage) || null;
  }

  private _toggleLanguageMenu(e: Event) {
    e.stopPropagation();
    if (!this._supportsLanguageSwitching() || this.isPresetSwitching) {
      return;
    }

    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
    this.requestUpdate();
  }

  private async _handleLanguageSelection(languageCode: string) {
    if (!this._supportsLanguageSwitching()) {
      return;
    }

    const selectedLanguage = this._getAvailableLanguages().find(language => language.code === languageCode);
    if (!selectedLanguage) {
      return;
    }

    if (this.currentLanguage === languageCode) {
      this.isLanguageMenuOpen = false;
      this.requestUpdate();
      return;
    }

    this.isPresetSwitching = true;
    this.isLanguageMenuOpen = false;
    this.error = "";
    this.requestUpdate();

    try {
      await this.previewService.reloadContentWithCurrentLanguage(languageCode);
      this._restartPlayable();

      this.presetSuccessMessage = `✅ Language: ${selectedLanguage.label}`;
      setTimeout(() => {
        this.presetSuccessMessage = "";
        this.requestUpdate();
      }, 3000);
    } catch (error) {
      console.error(`❌ Failed to switch preview language:`, error);
      this.error = `Failed to switch language: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      this.isPresetSwitching = false;
      this.requestUpdate();
    }
  }

  async handleSaveToLibrary() {
    try {
      const iframe = this._getIframeEl();
      if (!iframe) {
        throw new Error('Playable iframe not found');
      }
      
      const blob = await this.previewService.captureScreenshot(iframe);
      
      // Modal is in light DOM, so query from the element itself (fallback to document)
      const modal = (this as any).querySelector('save-creative-modal') || document.querySelector('save-creative-modal');
      if (modal) {
        const content = this.previewService.getOriginalSourceContent() || this.pageContent;
        // Use fileName property or default
        const name = this.fileName || "Playable Ad.html";
        // Check if current preview is from ZIP
        const zipFile = this.previewService.getOriginalZipFile();
        console.log(`📱 playable-previewer.handleSaveToLibrary: zipFile=${zipFile ? `File(${zipFile.name}, ${zipFile.size} bytes)` : 'null'}, passing to modal.show()`);
        await modal.show(blob, content, name, zipFile);
      } else {
        console.warn('Modal not found in DOM');
      }
    } catch (error) {
      console.error('Failed to capture screenshot for library:', error);
      this.error = `Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`;
      this.requestUpdate();
      setTimeout(() => {
        this.error = '';
        this.requestUpdate();
      }, 3000);
    }
  }

  render() {
    const device = this.selectedDevice;
    const width = (this.isPortrait ? device.width : device.height) || 375;
    const height = (this.isPortrait ? device.height : device.width) || 667;
    const availableLanguages = this._getAvailableLanguages();
    const currentLanguageOption = this._getCurrentLanguageOption();

    // Layout: wide simulators (tablet / landscape phone) do not fit nicely side-by-side with validation panel.
    // In those cases, stack the preview below the page content (single column) even on large screens.
    const shouldStackPreview = !this.isPortrait || width >= 700;
    
    // Log render state for debugging
    const hasZip = !!this.zipPreviewUrl;
    const hasPageContent = !!this.pageContent;
    const shouldShowContent = hasZip || hasPageContent;
    console.log(`🎨 playable-previewer render: loading=${this.loading}, error='${this.error}', zipPreview=${hasZip}, pageContent=${hasPageContent}, shouldShow=${shouldShowContent}`);

    const uploadedSizeBytes = this.previewService.getUploadedSizeBytes?.() ?? 0;
    const sizeKb = uploadedSizeBytes > 0 ? (uploadedSizeBytes / 1024).toFixed(1) : null;
    const loadSec = this._iframeLoadMs !== null ? (this._iframeLoadMs / 1000).toFixed(2) : null;
    
    return html`
      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 ${shouldStackPreview ? '' : 'lg:grid-cols-2'} gap-8 items-start">
          <div class="flex flex-col gap-4">
          <!-- Validation Results -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <div class="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Validation Results</h2>
                ${sizeKb || loadSec ? html`
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    ${sizeKb ? html`<span class="flex items-center gap-1"><span class="material-icons-outlined" style="font-size:13px">description</span> ${sizeKb} KB</span>` : ''}
                    ${loadSec ? html`<span class="flex items-center gap-1"><span class="material-icons-outlined" style="font-size:13px">timer</span> ${loadSec}s load</span>` : ''}
                  </div>
                ` : ''}
              </div>

              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-2">
                  <label for="preset-select" class="text-sm font-medium text-slate-500 dark:text-slate-400">Validator:</label>
                  <div class="relative">
                    <select 
                      id="preset-select"
                      @change="${this.handlePresetChange.bind(this)}" 
                      class="w-48 appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      title="${this.currentPreset?.description || ''}"
                      ?disabled="${this.isPresetSwitching}"
                    >
                      ${this.availablePresets.map(preset =>
                        html`<option 
                          value="${preset.id}" 
                          ?selected="${preset.id === this.currentPreset?.id}"
                        >
                          ${preset.name}
                        </option>`
                      )}
                    </select>
                    <span class="material-icons-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">expand_more</span>
                  </div>
                  ${this.isPresetSwitching ? html`
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  ` : ''}
                </div>

                ${this._supportsLanguageSwitching() ? html`
                  <div class="relative" data-preview-language-switcher>
                    <button
                      type="button"
                      @click=${this._toggleLanguageMenu}
                      class="inline-flex items-center gap-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      title="Preview language"
                      ?disabled=${this.isPresetSwitching}
                    >
                      <span class="material-icons-outlined" style="font-size:18px">translate</span>
                      <span>${currentLanguageOption?.label || 'Language'}</span>
                      <span class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">${currentLanguageOption?.code || ''}</span>
                      <span class="material-icons-outlined text-slate-400 dark:text-slate-500" style="font-size:18px">expand_more</span>
                    </button>

                    ${this.isLanguageMenuOpen ? html`
                      <div class="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
                        ${availableLanguages.map(language => html`
                          <button
                            type="button"
                            @click=${() => this._handleLanguageSelection(language.code)}
                            class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${language.code === this.currentLanguage ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}"
                          >
                            <span>${language.label}</span>
                            <span class="text-xs uppercase tracking-wide ${language.code === this.currentLanguage ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}">${language.code}</span>
                          </button>
                        `)}
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                ${this.currentPreset ? html`
                  <div class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>
                      Max size: ${this.currentPreset.maxFileSizeMB}MB
                      ${this.currentPreset.injectScripts.length > 0 ? html`• Scripts: ${this.currentPreset.injectScripts.length}` : ''}
                      ${currentLanguageOption ? html`• Language: ${currentLanguageOption.code.toUpperCase()}` : ''}
                    </span>
                    ${this.presetSuccessMessage ? html`
                      <span class="text-green-500 font-medium animate-fade-in-out">
                        ${this.presetSuccessMessage}
                      </span>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
            
            ${this.validationResults && this.validationResults.categories.length > 0 ? html`
              <div class="space-y-6">
                ${this.validationResults.categories.map(category => html`
                  <div>
                    <div class="flex items-center gap-2 mb-4">
                      <span class="material-icons-outlined ${category.checks.every(check => check.passed) ? 'text-green-500' : 'text-yellow-500'}">
                        ${category.checks.every(check => check.passed) ? 'check_circle' : 'warning'}
                      </span>
                      <h3 class="font-semibold text-slate-800 dark:text-slate-200">${category.name}</h3>
                    </div>
                    <ul class="space-y-3 pl-7">
                      ${category.checks.map(check => html`
                        <li class="flex items-start gap-3">
                          <span class="material-icons-outlined ${check.passed ? 'text-green-500' : check.isWarning ? 'text-yellow-500' : 'text-red-500'}">
                            ${check.passed ? 'check_circle' : check.isWarning ? 'warning' : 'cancel'}
                          </span>
                          <div>
                            <p class="${check.passed ? '' : 'font-medium text-red-600 dark:text-red-500'}">
                              ${check.name}
                            </p>
                            ${check.details ? html`
                              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${check.details}</p>
                            ` : ''}
                          </div>
                        </li>
                      `)}
                    </ul>
                  </div>
                `)}
              </div>
            ` : html`
              <div class="text-center text-slate-500 dark:text-slate-400 italic">
                No validation results available
              </div>
            `}
          </div>

          <!-- SDK Event Log -->
          <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-indigo-500" style="font-size:18px">terminal</span>
                <h2 class="text-sm font-semibold text-slate-900 dark:text-white">SDK Event Log</h2>
                ${this._sdkEvents.length > 0 ? html`
                  <span class="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full px-2 py-0.5">${this._sdkEvents.length}</span>
                ` : ''}
                ${!this._supportsSdkEventLog() ? html`
                  <span class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span class="material-icons-outlined" style="font-size:13px">info</span>
                    Select &ldquo;CTA SDK&rdquo; or &ldquo;Yandex Games SDK&rdquo; preset to capture events
                  </span>
                ` : ''}
              </div>
              ${this._sdkEvents.length > 0 ? html`
                <button @click=${() => { this._sdkEvents = []; this._sdkEventStart = null; this.requestUpdate(); }}
                  class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Clear log"
                >Clear</button>
              ` : ''}
            </div>
            <div class="font-mono text-xs overflow-y-auto" style="max-height: 180px; min-height: 56px;" id="sdk-log-scroll">
              ${this._sdkEvents.length === 0 ? html`
                <div class="px-4 py-3 text-slate-400 dark:text-slate-500 italic">
                  No SDK events captured yet${this._supportsSdkEventLog() ? ' — interact with the playable to see events' : ''}.
                </div>
              ` : this._sdkEvents.map((ev, i) => {
                const ms = ev.elapsedMs;
                const timeStr = ms < 1000 ? `+${ms}ms` : `+${(ms/1000).toFixed(2)}s`;
                const argsStr = ev.args.length > 0 ? ev.args.map(a => JSON.stringify(a)).join(', ') : '';
                const isClick = ev.event === 'onClick';
                const isReady = ev.event === 'gameReady';
                return html`
                  <div class="px-4 py-1.5 flex items-baseline gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0 ${isClick ? 'bg-green-50 dark:bg-green-900/10' : isReady ? 'bg-blue-50 dark:bg-blue-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span class="text-slate-400 dark:text-slate-500 shrink-0" style="min-width:60px">[${timeStr}]</span>
                    <span class="font-semibold ${isClick ? 'text-green-700 dark:text-green-400' : isReady ? 'text-blue-700 dark:text-blue-400' : 'text-indigo-700 dark:text-indigo-300'}">${ev.event}</span>
                    ${argsStr ? html`<span class="text-slate-500 dark:text-slate-400 truncate">(${argsStr})</span>` : html`<span class="text-slate-400">()</span>`}
                    <span class="ml-auto text-slate-300 dark:text-slate-600 shrink-0">#${i + 1}</span>
                  </div>
                `;
              })}
            </div>
          </div>
          </div>

          <!-- Phone Preview -->
          <div class="flex flex-col items-center">
            <!-- Simulator Controls -->
            <div class="flex flex-col gap-3 mb-4" style="width: ${width + 20}px;">
              <div class="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Preview mode</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">${this._getDeviceSummary(device)}</span>
                </div>
                <div class="relative">
                  <select 
                    aria-label="Device"
                    @change="${this.handleDeviceChange.bind(this)}" 
                    class="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    ${this.devices.map((d, i) =>
                      d.disabled
                        ? html`<option disabled> ${d.name} </option>`
                        : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${this._getDeviceLabel(d)}</option>`
                    )}
                  </select>
                  <span class="material-icons-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">expand_more</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3">
                <button 
                  @click=${() => this._restartPlayable()} 
                  title="Restart content"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">replay</span>
                </button>
                <button 
                  @click=${() => this.toggleOrientation()} 
                  title="${this.isPortrait ? 'Switch to landscape' : 'Switch to portrait'}"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">${this.isPortrait ? 'stay_current_landscape' : 'stay_current_portrait'}</span>
                </button>
                <button 
                  @click=${() => this._toggleLock()} 
                  title="Lock / Unlock"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">${this._locked ? 'lock' : 'lock_open'}</span>
                </button>
                <button 
                  @click=${() => this._toggleMute()} 
                  title="${this._muted ? 'Unmute audio' : 'Mute audio'}"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">${this._muted ? 'volume_off' : 'volume_up'}</span>
                </button>
                <button 
                  @click=${() => this._captureScreenshot()} 
                  title="Capture screenshot"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">photo_camera</span>
                </button>
                <button 
                  @click=${() => this._toggleRecording()} 
                  title="${this._suppressIframe ? 'Recording in progress (in new tab)' : 'Record gameplay video'}"
                  ?disabled=${this.loading || (!this.zipPreviewUrl && !this.pageContent)}
                  class="w-10 h-10 flex items-center justify-center rounded border transition-colors ${this._suppressIframe ? 'border-red-600 bg-red-600 text-white hover:bg-red-700' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} ${this.loading || (!this.zipPreviewUrl && !this.pageContent) ? 'opacity-50 cursor-not-allowed' : ''}"
                >
                  <span class="material-icons-outlined">fiber_manual_record</span>
                </button>
                <button 
                  @click=${() => this._openRecordingsList()} 
                  title="Previous recordings"
                  class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-icons-outlined">video_library</span>
                </button>
              </div>

              <div class="flex items-center justify-between gap-3 px-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Viewport ready for capture</span>
                <span class="text-right">Recording opens in popup</span>
              </div>
            </div>
            
            <!-- Phone Frame -->
            <div class="bg-slate-800 dark:bg-black rounded-[40px] p-2.5 shadow-2xl transition-all duration-300" style="width: ${width + 20}px; height: ${height + 20}px;">
              <div class="playable-capture-surface w-full h-full bg-slate-900 rounded-[30px] overflow-hidden relative">
                ${this.loading
                  ? html`
                      <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
                        <div class="text-lg">
                          ${this.isPresetSwitching ? `Applying ${this.currentPreset?.name} preset...` : 'Loading playable content...'}
                        </div>
                      </div>
                    `
                  : this.error
                  ? html`
                      <div class="absolute inset-0 flex items-center justify-center p-4">
                        <div class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded text-center">
                          <p class="font-bold mb-2">${this.error.includes('re-upload') ? '⚠️ Warning' : '❌ Error'}</p>
                          <p>${this.error}</p>
                        </div>
                      </div>
                    `
                  : (this.zipPreviewUrl || this.pageContent)
                  ? html`
                      <div class="w-full h-full relative">
                        ${this.renderPlayableIframe()}
                        
                        ${this.isPresetSwitching ? html`
                          <div class="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center z-50">
                            <div class="bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg">
                              <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Applying ${this.currentPreset?.name} preset...</span>
                            </div>
                          </div>
                        ` : ''}
                        
                        ${this._locked ? html`
                          <div class="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                            <div class="bg-black/60 text-white px-6 py-3 rounded-lg text-lg backdrop-blur-sm">
                              Screen is locked
                            </div>
                          </div>
                        ` : null}

                        ${this._adBannerVisible && !this._adOverlay ? html`
                          <div class="absolute left-0 right-0 bottom-0 h-[50px] z-40 flex items-center justify-center bg-slate-800 text-slate-300 text-xs border-t border-white/10">
                            Ad banner (simulated)
                          </div>
                        ` : null}

                        ${this._adOverlay ? this._renderAdOverlay(this._adOverlay) : null}
                      </div>
                    `
                  : html`
                      <div class="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        Ready to preview content
                      </div>
                    `}
              </div>
            </div>
          </div>
        </div>
        <save-creative-modal id="save-modal"></save-creative-modal>
        <preview-video-modal id="preview-video-modal"></preview-video-modal>
        <recordings-list-modal id="recordings-list-modal"></recordings-list-modal>
      </div>
    `;
  }
}