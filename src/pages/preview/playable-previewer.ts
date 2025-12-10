import { ComponentBase, customElement, html, inject, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewPreset } from "../../services/types";
import type { ValidationResult } from "../../services/PreviewServiceValidators";
import "../../assets/pako_inflate.min.js";

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;

  pageContent: string = "";
  loading: boolean = true;
  error: string = "";
  private uploadedContentUnsubscribe?: () => void;
  private presetUnsubscribe?: () => void;
  private validationUnsubscribe?: () => void;
  private zipPreviewUnsubscribe?: () => void;
  @state() private currentPreset: PreviewPreset | null = null;
  @state() private availablePresets: PreviewPreset[] = [];
  @state() private isPresetSwitching: boolean = false;
  @state() private presetSuccessMessage: string = "";
  @state() private validationResults: ValidationResult | null = null;
  @state() private zipPreviewUrl: string | null = null;

  devices = [
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
    
    this.uploadedContentUnsubscribe = this.previewService.onUploadedContentChange((content) => {
      console.log(`📁 playable-previewer: onUploadedContentChange fired, content length: ${content?.length || 0}`);
      if (content) {
        this.pageContent = content;
        this.loading = false;
        this.error = "";
        console.log(`✅ playable-previewer: Content set, loading=false`);
        this.requestUpdate();
      } else {
        console.log(`📁 Uploaded content cleared`);
        this.pageContent = "";
        this.loading = false;
        this.error = "";
      }
    });
    
    this.presetUnsubscribe = this.previewService.onPresetChange((preset) => {
      this.currentPreset = preset;
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
    if (this.validationUnsubscribe) {
      this.validationUnsubscribe();
    }
    if (this.zipPreviewUnsubscribe) {
      this.zipPreviewUnsubscribe();
    }
    if (this._playableLockHandler) {
      window.removeEventListener('playable-screen-lock', this._playableLockHandler as EventListener);
    }
  }

  private _playableLockHandler?: (e: Event) => void;
  @state() private _locked: boolean = false;
  @state() private _muted: boolean = false;

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
    const iframe = e.currentTarget as HTMLIFrameElement;
    const win = iframe?.contentWindow as (Window & { __ptGuardInstalled?: boolean; __ptGuard?: any });
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

    // Install screenshot capture script
    this._installScreenshotCapture(win, doc);
  };

  private renderPlayableIframe() {
    if (this.zipPreviewUrl) {
      return html`<iframe
        src="${this.zipPreviewUrl}"
        class="playable-iframe"
        frameborder="0"
        allowfullscreen
        style="width:100%; height:100%; border:none;"
        @load="${this._installFocusGuards}"
      ></iframe>`;
    }
    if (this.pageContent) {
      return html`<iframe
        srcdoc="${this.pageContent}"
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

  private _installScreenshotCapture(win: Window, doc: Document) {
    // Inject the screenshot script into the iframe
    const script = doc.createElement('script');
    script.src = '/playable-screenshot.js';
    script.onload = () => {
      console.log('Screenshot capture script loaded in iframe');
    };
    script.onerror = () => {
      console.warn('Failed to load screenshot capture script');
    };
    doc.head.appendChild(script);
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

  render() {
    const device = this.selectedDevice;
    const width = (this.isPortrait ? device.width : device.height) || 375;
    const height = (this.isPortrait ? device.height : device.width) || 667;
    
    // Log render state for debugging
    const hasZip = !!this.zipPreviewUrl;
    const hasPageContent = !!this.pageContent;
    const shouldShowContent = hasZip || hasPageContent;
    console.log(`🎨 playable-previewer render: loading=${this.loading}, error='${this.error}', zipPreview=${hasZip}, pageContent=${hasPageContent}, shouldShow=${shouldShowContent}`);
    
    return html`
      <div class="flex flex-col gap-8">
        <!-- Controls Bar -->
        <div class="flex items-center gap-6 flex-wrap">
          <!-- Validator Select -->
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
          
          <!-- Device Select -->
          <div class="flex items-center gap-2">
            <label for="device-select" class="text-sm font-medium text-slate-500 dark:text-slate-400">Device:</label>
            <div class="relative">
              <select 
                id="device-select" 
                @change="${this.handleDeviceChange.bind(this)}" 
                class="w-48 appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                ${this.devices.map((d, i) =>
                  d.disabled
                    ? html`<option disabled> ${d.name} </option>`
                    : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${d.name}</option>`
                )}
              </select>
              <span class="material-icons-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">expand_more</span>
            </div>
          </div>
          
          <!-- Info -->
          ${this.currentPreset ? html`
            <div class="ml-auto text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>
                Max size: ${this.currentPreset.maxFileSizeMB}MB
                ${this.currentPreset.injectScripts.length > 0 ? html`• Scripts: ${this.currentPreset.injectScripts.length}` : ''}
              </span>
              ${this.presetSuccessMessage ? html`
                <span class="text-green-500 font-medium animate-fade-in-out">
                  ${this.presetSuccessMessage}
                </span>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Validation Results -->
          <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Validation Results</h2>
            
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
          
          <!-- Phone Preview -->
          <div class="flex flex-col items-center">
            <!-- Simulator Controls -->
            <div class="flex items-center gap-2 mb-4 self-end">
              <button 
                @click=${() => this.toggleOrientation()} 
                title="${this.isPortrait ? 'Switch to landscape' : 'Switch to portrait'}"
                class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span class="material-icons-outlined">swap_vert</span>
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
            </div>
            
            <!-- Phone Frame -->
            <div class="bg-slate-800 dark:bg-black rounded-[40px] p-2.5 shadow-2xl transition-all duration-300" style="width: ${width + 20}px; height: ${height + 20}px;">
              <div class="w-full h-full bg-slate-900 rounded-[30px] overflow-hidden relative">
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
      </div>
    `;
  }
}