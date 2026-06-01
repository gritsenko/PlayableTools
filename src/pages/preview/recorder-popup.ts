import { ComponentBase, customElement, html, route, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewRecordingController, PreviewRecordingResult } from "../../services/types";
import { inject } from "fw";

type PreviewDeviceOption = {
  name: string;
  width?: number;
  height?: number;
  type?: 'phone' | 'tablet';
  disabled?: boolean;
};

type RecordingQualityId = 'standard' | 'high' | 'best';

type RecordingQualityOption = {
  id: RecordingQualityId;
  label: string;
  description: string;
  outputScale: number;
  maxOutputDimension: number;
};

type RecordingFrameRate = 30 | 60;

type RecordingFrameRateOption = {
  value: RecordingFrameRate;
  label: string;
  description: string;
};

@customElement("recorder-popup-page")
@route("/recorder-popup", {
  title: "PlayableTools - Gameplay Recorder",
  description: "Record gameplay footage.",
  noLayout: true
})
export class RecorderPopupPage extends ComponentBase {
  private static readonly CONTROLS_PANEL_WIDTH = 280;
  private static readonly LAYOUT_GAP = 24;
  private static readonly VIEWPORT_PADDING = 16;
  private static readonly WINDOW_FRAME_WIDTH = 48;
  private static readonly WINDOW_FRAME_HEIGHT = 112;
  private static readonly STORAGE_KEYS = {
    includeCursor: 'preview-recorder-include-cursor',
    recordingQuality: 'preview-recorder-quality',
    recordingFrameRate: 'preview-recorder-frame-rate',
  } as const;

  @inject(PreviewService) private previewService!: PreviewService;

  @state() private playableUrl: string = "";
  @state() private isRecording: boolean = false;
  @state() private isStoppingRecording: boolean = false;
  @state() private isSavingScreenshot: boolean = false;
  @state() private recordingElapsedMs: number = 0;
  private activeRecording?: PreviewRecordingController;
  private recordingStartedAt?: number;
  private recordingTimerId?: number;

  @state() private isPortrait: boolean = true;
  @state() private selectedDeviceIdx: number = 2; // Default to iPhone SE 375x667
  @state() private includeCursor: boolean = true;
  @state() private selectedRecordingQualityId: RecordingQualityId = 'high';
  @state() private selectedFrameRate: RecordingFrameRate = 30;

  private static readonly HIDE_CURSOR_STYLE_ID = '__pt_hide_cursor_style';
  private touchIndicatorEl?: HTMLDivElement;
  private iframeTracking?: {
    iframe: HTMLIFrameElement;
    doc: Document;
    onMove: (e: MouseEvent) => void;
    onDown: (e: MouseEvent) => void;
    onUp: (e: MouseEvent) => void;
    onLeave: (e: MouseEvent) => void;
    onEnter: (e: MouseEvent) => void;
  };

  private devices: PreviewDeviceOption[] = [
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

  private recordingQualityOptions: RecordingQualityOption[] = [
    {
      id: 'standard',
      label: 'Standard',
      description: 'Matches the preview size and keeps file size lower.',
      outputScale: 1,
      maxOutputDimension: 1280,
    },
    {
      id: 'high',
      label: 'High',
      description: 'Sharper UI and fewer compression artifacts. Recommended default.',
      outputScale: 1.5,
      maxOutputDimension: 1600,
    },
    {
      id: 'best',
      label: 'Best',
      description: 'Maximum detail with larger files and heavier CPU usage.',
      outputScale: 2,
      maxOutputDimension: 1920,
    },
  ];

  private recordingFrameRateOptions: RecordingFrameRateOption[] = [
    {
      value: 30,
      label: '30 FPS',
      description: 'Smaller files and lower CPU load.',
    },
    {
      value: 60,
      label: '60 FPS',
      description: 'Smoother motion for gameplay, with larger files and heavier capture load.',
    },
  ];

  protected override async firstUpdated(changedProperties: import("lit").PropertyValues) {
    super.firstUpdated(changedProperties);

    const storedIncludeCursor = localStorage.getItem(RecorderPopupPage.STORAGE_KEYS.includeCursor);
    if (storedIncludeCursor !== null) {
      this.includeCursor = storedIncludeCursor === 'true';
    }

    const storedRecordingQuality = localStorage.getItem(RecorderPopupPage.STORAGE_KEYS.recordingQuality);
    if (storedRecordingQuality && this.recordingQualityOptions.some(option => option.id === storedRecordingQuality)) {
      this.selectedRecordingQualityId = storedRecordingQuality as RecordingQualityId;
    }

    const storedFrameRate = localStorage.getItem(RecorderPopupPage.STORAGE_KEYS.recordingFrameRate);
    if (storedFrameRate === '30' || storedFrameRate === '60') {
      this.selectedFrameRate = Number.parseInt(storedFrameRate, 10) as RecordingFrameRate;
    }
    
    // Read the URL from query params
    const params = new URLSearchParams(window.location.search);
    this.playableUrl = params.get('url') || "";

    const wParam = params.get('width');
    const hParam = params.get('height');
    if (wParam && hParam) {
      const w = parseInt(wParam, 10);
      const h = parseInt(hParam, 10);
      this.isPortrait = w <= h;
      
      const matchIdx = this.devices.findIndex(d => 
        !d.disabled && ((d.width === w && d.height === h) || (d.height === w && d.width === h))
      );
      
      if (matchIdx >= 0) {
        this.selectedDeviceIdx = matchIdx;
      }
    }

    this.maybeResizeWindow();
  }

  get selectedDevice() {
    return this.devices[this.selectedDeviceIdx];
  }

  get selectedRecordingQuality() {
    return this.recordingQualityOptions.find(option => option.id === this.selectedRecordingQualityId)
      ?? this.recordingQualityOptions[1];
  }

  get selectedRecordingFrameRateOption() {
    return this.recordingFrameRateOptions.find(option => option.value === this.selectedFrameRate)
      ?? this.recordingFrameRateOptions[0];
  }

  override disconnectedCallback(): void {
    this.stopRecordingTimer(true);
    this.detachIframeTracking();
    this.touchIndicatorEl?.remove();
    this.touchIndicatorEl = undefined;
    super.disconnectedCallback();
  }

  private handleIframeLoad = (e: Event) => {
    const iframe = e.currentTarget as HTMLIFrameElement;
    this.attachIframeTracking(iframe);
  };

  private attachIframeTracking(iframe: HTMLIFrameElement) {
    this.detachIframeTracking();
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument;
    } catch {
      doc = null;
    }
    if (!doc) {
      console.warn('[RecorderPopup] iframe is cross-origin — touch indicator and cursor hiding are unavailable.');
      return;
    }

    const onMove = (event: MouseEvent) => this.moveTouchIndicator(iframe, event.clientX, event.clientY);
    const onDown = (event: MouseEvent) => {
      this.moveTouchIndicator(iframe, event.clientX, event.clientY);
      this.setTouchIndicatorPressed(true);
    };
    const onUp = (event: MouseEvent) => {
      this.moveTouchIndicator(iframe, event.clientX, event.clientY);
      this.setTouchIndicatorPressed(false);
    };
    const onLeave = () => this.hideTouchIndicator();
    const onEnter = (event: MouseEvent) => this.moveTouchIndicator(iframe, event.clientX, event.clientY);

    doc.addEventListener('mousemove', onMove);
    doc.addEventListener('mousedown', onDown);
    doc.addEventListener('mouseup', onUp);
    doc.addEventListener('mouseleave', onLeave);
    doc.addEventListener('mouseenter', onEnter);

    this.iframeTracking = { iframe, doc, onMove, onDown, onUp, onLeave, onEnter };
    this.applyCursorMode();
  }

  private detachIframeTracking() {
    const tracking = this.iframeTracking;
    if (!tracking) return;
    try {
      tracking.doc.removeEventListener('mousemove', tracking.onMove);
      tracking.doc.removeEventListener('mousedown', tracking.onDown);
      tracking.doc.removeEventListener('mouseup', tracking.onUp);
      tracking.doc.removeEventListener('mouseleave', tracking.onLeave);
      tracking.doc.removeEventListener('mouseenter', tracking.onEnter);
      tracking.doc.getElementById(RecorderPopupPage.HIDE_CURSOR_STYLE_ID)?.remove();
    } catch {}
    this.iframeTracking = undefined;
    this.hideTouchIndicator();
  }

  private applyCursorMode() {
    const tracking = this.iframeTracking;
    if (!tracking) {
      this.hideTouchIndicator();
      return;
    }
    const { doc } = tracking;
    let style = doc.getElementById(RecorderPopupPage.HIDE_CURSOR_STYLE_ID) as HTMLStyleElement | null;
    if (this.includeCursor) {
      style?.remove();
      this.hideTouchIndicator();
      return;
    }
    if (!style) {
      style = doc.createElement('style');
      style.id = RecorderPopupPage.HIDE_CURSOR_STYLE_ID;
      style.textContent = 'html, body, *, *::before, *::after { cursor: none !important; }';
      doc.head?.appendChild(style);
    }
  }

  private ensureTouchIndicatorEl(): HTMLDivElement {
    if (this.touchIndicatorEl && this.touchIndicatorEl.isConnected) {
      return this.touchIndicatorEl;
    }
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position: fixed',
      'left: 0',
      'top: 0',
      'width: 36px',
      'height: 36px',
      'border-radius: 50%',
      'background: radial-gradient(circle, rgba(120,120,120,0.45) 0%, rgba(120,120,120,0.18) 60%, transparent 100%)',
      'border: 1px solid rgba(60,60,60,0.55)',
      'transform: translate(-50%, -50%)',
      'pointer-events: none',
      'z-index: 2147483647',
      'display: none',
      'transition: width 80ms ease, height 80ms ease, background 80ms ease',
    ].join('; ');
    document.body.appendChild(el);
    this.touchIndicatorEl = el;
    return el;
  }

  private moveTouchIndicator(iframe: HTMLIFrameElement, iframeX: number, iframeY: number) {
    if (this.includeCursor) {
      this.hideTouchIndicator();
      return;
    }
    const rect = iframe.getBoundingClientRect();
    const el = this.ensureTouchIndicatorEl();
    el.style.display = 'block';
    el.style.left = `${rect.left + iframeX}px`;
    el.style.top = `${rect.top + iframeY}px`;
  }

  private setTouchIndicatorPressed(pressed: boolean) {
    if (!this.touchIndicatorEl || this.touchIndicatorEl.style.display === 'none') return;
    const el = this.touchIndicatorEl;
    if (pressed) {
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.background = 'radial-gradient(circle, rgba(40,40,40,0.7) 0%, rgba(40,40,40,0.3) 60%, transparent 100%)';
    } else {
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.background = 'radial-gradient(circle, rgba(120,120,120,0.45) 0%, rgba(120,120,120,0.18) 60%, transparent 100%)';
    }
  }

  private hideTouchIndicator() {
    if (this.touchIndicatorEl) {
      this.touchIndicatorEl.style.display = 'none';
    }
  }

  private _getDeviceLabel(device: PreviewDeviceOption): string {
    if (device.disabled) return device.name;
    return `${device.name} (${device.width}x${device.height})`;
  }

  private handleDeviceChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selectedDeviceIdx = parseInt(select.value, 10);
    this.maybeResizeWindow();
  }

  private toggleOrientation() {
    this.isPortrait = !this.isPortrait;
    this.maybeResizeWindow();
  }

  private handleIncludeCursorChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.includeCursor = input.checked;
    localStorage.setItem(RecorderPopupPage.STORAGE_KEYS.includeCursor, String(this.includeCursor));
    this.applyCursorMode();
  }

  private handleRecordingQualityChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const nextValue = select.value as RecordingQualityId;
    if (!this.recordingQualityOptions.some(option => option.id === nextValue)) {
      return;
    }

    this.selectedRecordingQualityId = nextValue;
    localStorage.setItem(RecorderPopupPage.STORAGE_KEYS.recordingQuality, nextValue);
  }

  private handleFrameRateChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const nextValue = Number.parseInt(select.value, 10);
    if (nextValue !== 30 && nextValue !== 60) {
      return;
    }

    this.selectedFrameRate = nextValue;
    localStorage.setItem(RecorderPopupPage.STORAGE_KEYS.recordingFrameRate, String(nextValue));
  }

  private maybeResizeWindow() {
    const device = this.selectedDevice;
    const width = (this.isPortrait ? device.width : device.height) || 375;
    const height = (this.isPortrait ? device.height : device.width) || 667;

    const outerWidth = width
      + RecorderPopupPage.CONTROLS_PANEL_WIDTH
      + RecorderPopupPage.LAYOUT_GAP
      + (RecorderPopupPage.VIEWPORT_PADDING * 2)
      + RecorderPopupPage.WINDOW_FRAME_WIDTH;
    const outerHeight = Math.max(
      height + (RecorderPopupPage.VIEWPORT_PADDING * 2) + RecorderPopupPage.WINDOW_FRAME_HEIGHT,
      620,
    );

    if (width && height) {
      window.resizeTo(outerWidth, outerHeight);
    }
  }

  private startRecordingTimer(startedAt: number) {
    this.stopRecordingTimer(true);
    this.recordingStartedAt = startedAt;
    this.updateRecordingElapsed();
    this.recordingTimerId = window.setInterval(() => {
      this.updateRecordingElapsed();
    }, 250);
  }

  private freezeRecordingTimer() {
    this.updateRecordingElapsed();
    this.stopRecordingTimer(false);
  }

  private stopRecordingTimer(resetElapsed: boolean) {
    if (this.recordingTimerId !== undefined) {
      window.clearInterval(this.recordingTimerId);
      this.recordingTimerId = undefined;
    }

    this.recordingStartedAt = undefined;
    if (resetElapsed) {
      this.recordingElapsedMs = 0;
    }
  }

  private updateRecordingElapsed() {
    if (this.recordingStartedAt === undefined) {
      return;
    }

    this.recordingElapsedMs = Math.max(0, Date.now() - this.recordingStartedAt);
  }

  private formatRecordingElapsed(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private getCaptureSurface(): HTMLElement | null {
    return this.renderRoot.querySelector('.iframe-container') as HTMLElement | null;
  }

  private getSelectedViewportSize(): { width: number; height: number } {
    const device = this.selectedDevice;
    return {
      width: (this.isPortrait ? device.width : device.height) || 375,
      height: (this.isPortrait ? device.height : device.width) || 667,
    };
  }

  private buildScreenshotFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `playable-screenshot-${timestamp}.png`;
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async saveScreenshot() {
    if (this.isStoppingRecording || this.isSavingScreenshot) {
      return;
    }

    const captureSurface = this.getCaptureSurface();
    if (!captureSurface) {
      alert('Could not find the playable capture area.');
      return;
    }

    let temporaryRecording: PreviewRecordingController | undefined;

    try {
      this.isSavingScreenshot = true;

      const recording = this.activeRecording ?? await (async () => {
        const { width, height } = this.getSelectedViewportSize();
        const createdRecording = await this.previewService.startPreviewRecording(captureSurface, {
          frameRate: this.selectedFrameRate,
          targetWidth: width,
          targetHeight: height,
          includeCursor: this.includeCursor,
          captureAudio: false,
        });
        void createdRecording.result.catch(() => undefined);
        temporaryRecording = createdRecording;
        return createdRecording;
      })();

      const screenshotBlob = await recording.captureScreenshot();
      this.downloadBlob(screenshotBlob, this.buildScreenshotFileName());
    } catch (e) {
      alert('Failed to save screenshot: ' + (e as Error).message);
    } finally {
      if (temporaryRecording) {
        await temporaryRecording.cancel();
      }
      this.isSavingScreenshot = false;
    }
  }

  private async toggleRecording() {
    if (this.isStoppingRecording || this.isSavingScreenshot) return;

    if (this.activeRecording) {
      this.isStoppingRecording = true;
      this.freezeRecordingTimer();
      try {
        await this.activeRecording.stop();
      } catch (error) {
        // Ignored
      }
      return;
    }

    try {
      this.stopRecordingTimer(true);
      this.isRecording = true;
      this.isStoppingRecording = false;
      this.requestUpdate();
      await this.updateComplete;

      // We explicitly record the exact area of the iframe wrapper
      const captureSurface = this.getCaptureSurface();
      if (!captureSurface) throw new Error("Could not find .iframe-container");

      const quality = this.selectedRecordingQuality;
      const { width: targetWidth, height: targetHeight } = this.getSelectedViewportSize();

      const recording = await this.previewService.startPreviewRecording(captureSurface, {
        frameRate: this.selectedFrameRate,
        targetWidth,
        targetHeight,
        includeCursor: this.includeCursor,
        outputScale: quality.outputScale,
        maxOutputDimension: quality.maxOutputDimension,
      });
      this.activeRecording = recording;
      this.startRecordingTimer(recording.startedAt);

      recording.result.then((clip) => {
        this.finishRecording(clip);
      }).catch(() => {
        this.stopRecordingTimer(true);
        this.isRecording = false;
        this.activeRecording = undefined;
        this.isStoppingRecording = false;
      });
    } catch (e) {
      this.stopRecordingTimer(true);
      this.isRecording = false;
      this.isStoppingRecording = false;
      alert("Failed to start recording: " + (e as Error).message);
    }
  }

  private finishRecording(clip: PreviewRecordingResult) {
    this.freezeRecordingTimer();
    this.isRecording = false;
    this.activeRecording = undefined;
    this.isStoppingRecording = false;

    // Send the blob back to the parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'RECORDING_COMPLETE',
        blob: clip.blob,
        durationMs: clip.durationMs,
        width: clip.width,
        height: clip.height,
      }, '*');
      window.close();
    } else {
      alert("Recording complete, but opener window not found. You can close this tab.");
    }
  }

  protected override render() {
    const device = this.selectedDevice;
    const width = Math.max(300, (this.isPortrait ? device.width : device.height) || 375);
    const height = Math.max(300, (this.isPortrait ? device.height : device.width) || 667);
    const recordingElapsedLabel = this.formatRecordingElapsed(this.recordingElapsedMs);

    return html`
      <style>
        html, body {
          margin: 0;
          min-height: 100%;
          /* Black surround so any sub-pixel crop drift bleeds black (matching the
             .iframe-container) into the recording instead of a light window frame. */
          background: #000;
          overflow: auto;
        }

        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #334155;
        }

        .popup-page {
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 16px;
          display: grid;
          place-items: start center;
          background: #000;
        }

        .popup-layout {
          display: grid;
          grid-template-columns: ${width}px ${RecorderPopupPage.CONTROLS_PANEL_WIDTH}px;
          align-items: start;
          gap: ${RecorderPopupPage.LAYOUT_GAP}px;
        }
        
        .iframe-container {
          background: #000;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          flex-shrink: 0;
          position: relative;
        }
        
        iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
          padding: 16px;
          border-radius: 12px;
          width: ${RecorderPopupPage.CONTROLS_PANEL_WIDTH}px;
          box-sizing: border-box;
          flex-shrink: 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border: 1px solid #e2e8f0;
        }

        h2 {
          margin: 0 0 2px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #64748b;
        }

        .info-tip {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          font-size: 10px;
          font-weight: 700;
          font-style: italic;
          color: #94a3b8;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          cursor: help;
          flex-shrink: 0;
          user-select: none;
        }
        .info-tip::before {
          content: 'i';
        }
        .info-tip::after {
          content: attr(data-tip);
          position: absolute;
          bottom: calc(100% + 6px);
          right: -4px;
          background: #0f172a;
          color: #f1f5f9;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 400;
          font-style: normal;
          line-height: 1.45;
          white-space: normal;
          width: max-content;
          max-width: 240px;
          text-align: left;
          pointer-events: none;
          opacity: 0;
          transform: translateY(2px);
          transition: opacity 0.12s ease, transform 0.12s ease;
          z-index: 100;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
        }
        .info-tip:hover::after,
        .info-tip:focus-visible::after {
          opacity: 1;
          transform: translateY(0);
        }

        select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #fff;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
        }
        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 2px;
        }

        .toggle-option input {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
          flex: 0 0 auto;
          margin: 0;
        }

        .toggle-option-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #0f172a;
          flex: 1 1 auto;
        }
        
        button {
          appearance: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 16px;
          font-size: 0.875rem;
        }
        .btn-outline:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .btn-primary {
          background: #3b82f6;
          border: 1px solid transparent;
          color: white;
          padding: 10px 16px;
          font-size: 0.9375rem;
          margin-top: 6px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-primary.recording {
          background: #ef4444;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .recording-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 4px;
          padding: 10px 12px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fff1f2;
          color: #b91c1c;
        }

        .recording-status-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .recording-status-label::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: currentColor;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35);
          animation: recordDotPulse 1.6s infinite;
        }

        .recording-status.is-saving .recording-status-label::before {
          animation: none;
          background: #fb7185;
        }

        .recording-status-time {
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }

        .recording-idle-hint {
          color: #64748b;
          font-size: 13px;
          text-align: center;
          margin-top: 4px;
        }

        @keyframes recordDotPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .record-overlay {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border: 4px solid #ef4444;
          z-index: 10;
        }

        @media (max-width: ${width + RecorderPopupPage.CONTROLS_PANEL_WIDTH + RecorderPopupPage.LAYOUT_GAP + 48}px) {
          .popup-page {
            place-items: start;
          }

          .popup-layout {
            grid-template-columns: 1fr;
          }

          .controls-panel {
            width: min(100%, ${RecorderPopupPage.CONTROLS_PANEL_WIDTH}px);
          }
        }
      </style>
      
      <div class="popup-page">
        <div class="popup-layout">
          <div class="iframe-container" style="width: ${width}px; height: ${height}px;">
            ${this.playableUrl ? html`<iframe src="${this.playableUrl}" @load="${this.handleIframeLoad}"></iframe>` : html`<div style="color: white; padding: 20px; text-align: center;">No URL provided</div>`}
          </div>

          <div class="controls-panel">
            <h2>Recording Setup</h2>
            
            <div class="form-group">
              <label>Target Device Size</label>
              <select @change="${this.handleDeviceChange}" ?disabled="${this.isRecording || this.isSavingScreenshot}">
                ${this.devices.map((d, i) =>
                  d.disabled
                    ? html`<option disabled> ${d.name} </option>`
                    : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${this._getDeviceLabel(d)}</option>`
                )}
              </select>
            </div>

            <div class="form-group">
              <label>Recording Quality <span class="info-tip" tabindex="0" data-tip="${this.selectedRecordingQuality.description}"></span></label>
              <select @change="${this.handleRecordingQualityChange}" ?disabled="${this.isRecording || this.isSavingScreenshot}">
                ${this.recordingQualityOptions.map(option => html`
                  <option value="${option.id}" ?selected="${option.id === this.selectedRecordingQualityId}">${option.label}</option>
                `)}
              </select>
            </div>

            <div class="form-group">
              <label>Frame Rate <span class="info-tip" tabindex="0" data-tip="${this.selectedRecordingFrameRateOption.description}"></span></label>
              <select @change="${this.handleFrameRateChange}" ?disabled="${this.isRecording || this.isSavingScreenshot}">
                ${this.recordingFrameRateOptions.map(option => html`
                  <option value="${option.value}" ?selected="${option.value === this.selectedFrameRate}">${option.label}</option>
                `)}
              </select>
            </div>

            <button class="btn-outline mt-2" @click="${this.toggleOrientation}" ?disabled="${this.isRecording || this.isSavingScreenshot}">
              <span class="material-icons-outlined" style="font-size: 18px">${this.isPortrait ? 'stay_current_landscape' : 'stay_current_portrait'}</span>
              Switch to ${this.isPortrait ? 'Landscape' : 'Portrait'}
            </button>

            <label class="toggle-option">
              <input
                type="checkbox"
                .checked="${this.includeCursor}"
                @change="${this.handleIncludeCursorChange}"
                ?disabled="${this.isRecording || this.isSavingScreenshot}"
              />
              <span class="toggle-option-title">Record mouse cursor</span>
              <span class="info-tip" tabindex="0" data-tip="Turn off to try keeping the cursor out of recordings. Chromium only honors this for tab capture — pick &quot;This Tab&quot; in the share dialog. Check the DevTools console after starting a recording to confirm the constraint was applied."></span>
            </label>

            <button
              class="btn-outline"
              @click="${this.saveScreenshot}"
              ?disabled="${this.isStoppingRecording || this.isSavingScreenshot}"
            >
              <span class="material-icons-outlined" style="font-size: 18px">photo_camera</span>
              ${this.isSavingScreenshot ? 'Saving Screenshot...' : 'Save Screenshot (PNG)'}
            </button>
            
            <button 
              class="btn-primary ${this.isRecording ? 'recording' : ''}" 
              @click="${this.toggleRecording}"
              ?disabled="${this.isStoppingRecording || this.isSavingScreenshot}"
            >
              <span class="material-icons-outlined" style="font-size: 20px">${this.isRecording ? 'stop_circle' : 'fiber_manual_record'}</span>
              ${this.isStoppingRecording ? 'Saving...' : this.isRecording ? 'Stop Recording' : 'Start Record'}
            </button>

            ${this.isRecording 
              ? html`
                  <div class="recording-status ${this.isStoppingRecording ? 'is-saving' : ''}">
                    <span class="recording-status-label">${this.isStoppingRecording ? 'Saving clip' : 'Recording active'}</span>
                    <span class="recording-status-time">${recordingElapsedLabel}</span>
                  </div>
                `
              : html`<div class="recording-idle-hint">Choose current tab in share dialog</div>`
            }
          </div>
        </div>
      </div>
    `;
  }
}
