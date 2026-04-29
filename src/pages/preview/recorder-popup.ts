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

  @inject(PreviewService) private previewService!: PreviewService;

  @state() private playableUrl: string = "";
  @state() private isRecording: boolean = false;
  @state() private isStoppingRecording: boolean = false;
  private activeRecording?: PreviewRecordingController;

  @state() private isPortrait: boolean = true;
  @state() private selectedDeviceIdx: number = 2; // Default to iPhone SE 375x667

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

  protected override async firstUpdated(changedProperties: import("lit").PropertyValues) {
    super.firstUpdated(changedProperties);
    
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

  private async toggleRecording() {
    if (this.isStoppingRecording) return;

    if (this.activeRecording) {
      this.isStoppingRecording = true;
      try {
        await this.activeRecording.stop();
      } catch (error) {
        // Ignored
      }
      return;
    }

    try {
      this.isRecording = true;
      this.isStoppingRecording = false;
      this.requestUpdate();
      await this.updateComplete;

      // We explicitly record the exact area of the iframe wrapper
      const captureSurface = this.renderRoot.querySelector('.iframe-container') as HTMLElement;
      if (!captureSurface) throw new Error("Could not find .iframe-container");

      const recording = await this.previewService.startPreviewRecording(captureSurface, 30);
      this.activeRecording = recording;

      recording.result.then((clip) => {
        this.finishRecording(clip);
      }).catch(() => {
        this.isRecording = false;
        this.activeRecording = undefined;
      });
    } catch (e) {
      this.isRecording = false;
      alert("Failed to start recording: " + (e as Error).message);
    }
  }

  private finishRecording(clip: PreviewRecordingResult) {
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

    return html`
      <style>
        html, body {
          margin: 0;
          min-height: 100%;
          background: #f1f5f9;
          overflow: hidden;
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
          background: #f1f5f9;
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
          gap: 16px;
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          width: ${RecorderPopupPage.CONTROLS_PANEL_WIDTH}px;
          box-sizing: border-box;
          flex-shrink: 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border: 1px solid #e2e8f0;
        }

        h2 {
          margin: 0 0 8px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
        }

        select {
          width: 100%;
          padding: 10px 12px;
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
          padding: 12px 20px;
          font-size: 1rem;
          margin-top: 16px;
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

        .record-overlay {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border: 4px solid #ef4444;
          z-index: 10;
        }

        @media (max-width: ${width + RecorderPopupPage.CONTROLS_PANEL_WIDTH + RecorderPopupPage.LAYOUT_GAP + 48}px) {
          html, body {
            overflow: auto;
          }

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
            ${this.playableUrl ? html`<iframe src="${this.playableUrl}"></iframe>` : html`<div style="color: white; padding: 20px; text-align: center;">No URL provided</div>`}
          </div>

          <div class="controls-panel">
            <h2>Recording Setup</h2>
            
            <div class="form-group">
              <label>Target Device Size</label>
              <select @change="${this.handleDeviceChange}" ?disabled="${this.isRecording}">
                ${this.devices.map((d, i) =>
                  d.disabled
                    ? html`<option disabled> ${d.name} </option>`
                    : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${this._getDeviceLabel(d)}</option>`
                )}
              </select>
            </div>
            
            <button class="btn-outline mt-2" @click="${this.toggleOrientation}" ?disabled="${this.isRecording}">
              <span class="material-icons-outlined" style="font-size: 18px">${this.isPortrait ? 'stay_current_landscape' : 'stay_current_portrait'}</span>
              Switch to ${this.isPortrait ? 'Landscape' : 'Portrait'}
            </button>
            
            <button 
              class="btn-primary ${this.isRecording ? 'recording' : ''}" 
              @click="${this.toggleRecording}"
              ?disabled="${this.isStoppingRecording}"
            >
              <span class="material-icons-outlined" style="font-size: 20px">${this.isRecording ? 'stop_circle' : 'fiber_manual_record'}</span>
              ${this.isStoppingRecording ? 'Saving...' : this.isRecording ? 'Stop Recording' : 'Start Record'}
            </button>

            ${this.isRecording 
              ? html`<div style="color: #ef4444; font-size: 13px; text-align: center; margin-top: 4px; font-weight: 500;">Recording active...</div>` 
              : html`<div style="color: #64748b; font-size: 13px; text-align: center; margin-top: 4px;">Choose current tab in share dialog</div>`
            }
          </div>
        </div>
      </div>
    `;
  }
}
