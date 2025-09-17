import { ComponentBase, customElement, html, property, inject, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewPreset } from "../../services/types";
import type { ValidationResult } from "../../services/PreviewServiceValidators";
import "../../assets/pako_inflate.min.js";
import "./playable-previewer.ts.css";

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @property({ type: String }) githubUrl = "";
  @inject(PreviewService) previewService!: PreviewService;

  pageContent: string = "";
  loading: boolean = true;
  error: string = "";
  private uploadedContentUnsubscribe?: () => void;
  private presetUnsubscribe?: () => void;
  private validationUnsubscribe?: () => void;
  @state() private currentPreset: PreviewPreset | null = null;
  @state() private availablePresets: PreviewPreset[] = [];
  @state() private isPresetSwitching: boolean = false;
  @state() private presetSuccessMessage: string = "";
  @state() private validationResults: ValidationResult | null = null;

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

  connectedCallback() {
    super.connectedCallback();
    
    this.availablePresets = this.previewService.getAvailablePresets();
    this.currentPreset = this.previewService.getCurrentPreset();
    
    this.uploadedContentUnsubscribe = this.previewService.onUploadedContentChange((content) => {
      if (content) {
        this.pageContent = content;
        this.loading = false;
        this.error = "";
        this.requestUpdate();
      } else {
        console.log(`📁 Uploaded content cleared`);
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
    
    const existingContent = this.previewService.getUploadedContent();
    if (existingContent) {
      this.pageContent = existingContent;
      this.loading = false;
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
  };
  
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
  async updated(changedProps: Map<string, any>) {
    if (changedProps.has("githubUrl") && this.githubUrl) {
      await this.loadFromGithub();
    }
  }

  private async loadFromGithub() {
    this.loading = true;
    this.error = "";
    this.pageContent = "";
    
    const rawUrl = this.previewService.githubToRawUrl(this.githubUrl);
    if (!rawUrl) {
      console.error(`❌ Invalid GitHub URL: ${this.githubUrl}`);
      this.error = "Invalid GitHub URL";
      this.loading = false;
      this.requestUpdate();
      return;
    }
    
    try {
      this.pageContent = await this.previewService.fetchRawContent(rawUrl);
    } catch (err: any) {
      console.error(`❌ Failed to load from GitHub:`, err);
      this.error = err.message || String(err);
    }
    
    this.loading = false;
    this.requestUpdate();
  }

  get selectedDevice() {
    return this.devices[this.selectedDeviceIdx] || this.devices[0];
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
    const width = this.isPortrait ? device.width : device.height;
    const height = this.isPortrait ? device.height : device.width;
    
    return html`
      <!-- Device Controls -->
      <div class="device-controls" style="margin-bottom: 1em; display: flex; align-items: center; gap: 1em; flex-wrap: wrap;">
        <!-- Preset Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="preset-select" style="font-weight: bold; color: #1976d2;">Validator:</label>
          <select 
            id="preset-select"
            @change="${this.handlePresetChange.bind(this)}" 
            style="margin-bottom: 0; min-width: 150px; ${this.isPresetSwitching ? 'opacity: 0.7;' : ''}"
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
          ${this.isPresetSwitching ? html`
            <div style="display: flex; align-items: center; gap: 0.5em; color: #1976d2;">
              <div class="preset-spinner"></div>
              <span style="font-size: 0.9em;">Switching...</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Device Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="device-select" style="font-weight: bold; color: #1976d2;">Device:</label>
          <select id="device-select" @change="${this.handleDeviceChange.bind(this)}" style="margin-bottom: 0;">
            ${this.devices.map((d, i) =>
              d.disabled
                ? html`<option disabled> ${d.name} </option>`
                : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${d.name}</option>`
            )}
          </select>
        </div>
        
        <!-- Preset Info -->
        ${this.currentPreset ? html`
          <div style="font-size: 0.9em; color: #666; margin-left: auto; display: flex; align-items: center; gap: 1em;">
            <span>
              Max size: ${this.currentPreset.maxFileSizeMB}MB
              ${this.currentPreset.injectScripts.length > 0 ? html`• Scripts: ${this.currentPreset.injectScripts.length}` : ''}
            </span>
            ${this.presetSuccessMessage ? html`
              <span style="color: #4CAF50; font-weight: bold; animation: fadeInOut 3s ease-in-out;">
                ${this.presetSuccessMessage}
              </span>
            ` : ''}
          </div>
        ` : ''}
      </div>
      
      <!-- Main Content Layout -->
      <div class="preview-layout" style="display: grid; grid-template-columns: 350px 1fr; gap: 2em; align-items: start; margin-top: 1em;">
        
        <!-- Validation Results Sidebar -->
        ${this.validationResults && this.validationResults.categories.length > 0 ? html`
          <div class="validation-results" style="padding: 1em; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; height: fit-content;">
            <h3 style="margin: 0 0 1em 0; color: #495057; font-size: 1.1em;">Validation Results</h3>
            ${this.validationResults.categories.map(category => html`
              <div class="validation-category" style="margin-bottom: 1em;">
                <h4 style="margin: 0 0 0.5em 0; color: #1976d2; font-size: 1em; display: flex; align-items: center; gap: 0.5em;">
                  <span style="font-size: 1.2em;">${category.checks.every(check => check.passed) ? '✅' : '⚠️'}</span>
                  ${category.name}
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.3em;">
                  ${category.checks.map(check => html`
                    <div class="validation-check" style="display: flex; align-items: flex-start; gap: 0.5em; font-size: 0.9em;">
                      <span style="font-size: 1.1em; margin-top: -2px;">${check.passed ? '✅' : '❌'}</span>
                      <div style="flex: 1;">
                        <span style="color: ${check.passed ? '#28a745' : '#dc3545'}; font-weight: ${check.passed ? 'normal' : 'bold'};">${check.name}</span>
                        ${check.details ? html`
                          <div style="color: #6c757d; font-size: 0.85em; margin-top: 0.2em;">${check.details}</div>
                        ` : ''}
                      </div>
                    </div>
                  `)}
                </div>
              </div>
            `)}
          </div>
        ` : html`
          <!-- Placeholder for validation sidebar when no results -->
          <div style="padding: 1em; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; color: #6c757d; text-align: center; font-style: italic;">
            No validation results available
          </div>
        `}
        
      <!-- Preview Frame -->
        <div class="preview-frame-container">

          <!-- Simulator Controls -->
          <div class="simulator-controls" style="margin-bottom: 1em; display: flex; align-items: center; gap: 1em; justify-content: center;">
            <button @click=${() => this.toggleOrientation()} title="${this.isPortrait ? 'Switch to landscape' : 'Switch to portrait'}" aria-label="${this.isPortrait ? 'Switch to landscape orientation' : 'Switch to portrait orientation'}" style="width:38px;height:38px;border-radius:6px;border:1px solid #1976d2;background:#fff;color:#1976d2;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;">
              ${this.isPortrait ? '↕️' : '↔️'}
            </button>
            <button @click=${() => this._toggleLock()} title="Lock / Unlock" aria-pressed="${this._locked}" aria-label="Lock or unlock screen" style="width:38px;height:38px;border-radius:6px;border:1px solid #1976d2;background:#fff;color:#1976d2;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;">
              ${this._locked ? '🔒' : '🔓'}
            </button>
            <button @click=${() => this._toggleMute()} title="${this._muted ? 'Unmute audio' : 'Mute audio'}" aria-pressed="${this._muted}" aria-label="${this._muted ? 'Unmute audio' : 'Mute audio'}" style="width:38px;height:38px;border-radius:6px;border:1px solid #1976d2;background:#fff;color:#1976d2;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;">
              ${this._muted ? '🔇' : '🔊'}
            </button>
          </div>


          <div style="display:flex; justify-content:center;">
            <div class="phone-simulator">
              <div class="phone-simulator-bg">
                <div class="phone-frame" style="width:${width}px; height:${height}px;">
                ${this.loading
                  ? html`
                      <div class="spinner-container">
                        <div class="spinner"></div>
                        <div class="loading-message" style="margin-top: 1em; font-size: 1.1em; color: #bdbdbd;">
                          ${this.isPresetSwitching ? `Applying ${this.currentPreset?.name} preset...` : 'Loading playable content...'}
                        </div>
                      </div>
                    `
                  : this.error
                  ? html`
                      <div style="color: ${this.error.includes('re-upload') ? '#ff9800' : 'red'}; padding: 1em; background: ${this.error.includes('re-upload') ? '#fff3e0' : '#ffebee'}; border-radius: 4px; margin: 1em;">
                        ${this.error.includes('re-upload') ? '⚠️' : '❌'} ${this.error}
                      </div>
                    `
                  : this.pageContent
                  ? html`
                      <div style="position: relative; width: 100%; height: 100%;">
                        <iframe
                          srcdoc="${this.pageContent}"
                          class="playable-iframe"
                          frameborder="0"
                          allowfullscreen
                          style="width:100%; height:100%; border:none;"
                          @load="${this._installFocusGuards}"
                        ></iframe>
                            ${this.isPresetSwitching ? html`
                              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(25, 118, 210, 0.1); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(1px);">
                                <div style="background: rgba(25, 118, 210, 0.9); color: white; padding: 1em 2em; border-radius: 8px; display: flex; align-items: center; gap: 1em;">
                                  <div class="preset-spinner"></div>
                                  <span>Applying ${this.currentPreset?.name} preset...</span>
                                </div>
                              </div>
                            ` : ''}
                            ${this._locked ? html`
                              <div style="position: absolute; left:0; top:0; right:0; bottom:0; background: rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index: 2147483646;">
                                <div style="color:#fff; padding:12px 18px; background:rgba(0,0,0,0.6); border-radius:8px; font-size:18px;">Screen is locked</div>
                              </div>
                            ` : null}

                            </div>
                      </div>
                    `
                  : html`<div style="padding: 1em; color: #666; text-align: center;">
                      Ready to preview content.
                    </div>`}
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}