import { ComponentBase, customElement, html, inject, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewRecordingResult } from "../../services/types";

@customElement("preview-video-modal")
export class PreviewVideoModal extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;

  @state() private isOpen: boolean = false;
  @state() private clipUrl: string = "";
  @state() private clipDurationSec: number = 0;
  @state() private trimStartSec: number = 0;
  @state() private trimEndSec: number = 0;
  @state() private isExporting: boolean = false;
  @state() private error: string = "";
  @state() private fileBaseName: string = "playable-preview";
  @state() private exportStatus: string = "";
  @state() private exportProgress: number = 0;

  private recordedClip: PreviewRecordingResult | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.close();
  }

  async show(clip: PreviewRecordingResult, fileBaseName: string): Promise<void> {
    this._disposeClipUrl();
    this.recordedClip = clip;
    this.fileBaseName = this._sanitizeFileBaseName(fileBaseName);
    this.clipUrl = URL.createObjectURL(clip.blob);
    this.clipDurationSec = Math.max(clip.durationMs / 1000, 0.1);
    this.trimStartSec = 0;
    this.trimEndSec = this.clipDurationSec;
    this.error = "";
    this.isExporting = false;
    this.exportStatus = "";
    this.exportProgress = 0;
    this.isOpen = true;
    this.requestUpdate();
    await this.updateComplete;
  }

  close() {
    this.isOpen = false;
    this.isExporting = false;
    this.error = "";
    this.clipDurationSec = 0;
    this.trimStartSec = 0;
    this.trimEndSec = 0;
    this.exportStatus = "";
    this.exportProgress = 0;
    this.recordedClip = null;
    this._disposeClipUrl();
  }

  private _disposeClipUrl() {
    if (this.clipUrl) {
      URL.revokeObjectURL(this.clipUrl);
      this.clipUrl = "";
    }
  }

  private _sanitizeFileBaseName(fileBaseName: string): string {
    return fileBaseName.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'playable-preview';
  }

  private _formatTime(seconds: number): string {
    const totalTenths = Math.max(0, Math.round(seconds * 10));
    const minutes = Math.floor(totalTenths / 600);
    const secs = Math.floor((totalTenths % 600) / 10);
    const tenths = totalTenths % 10;
    return `${minutes}:${secs.toString().padStart(2, '0')}.${tenths}`;
  }

  private _downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  private _handleBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private _handleMetadataLoaded(event: Event) {
    const video = event.currentTarget as HTMLVideoElement;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      this.clipDurationSec = video.duration;
      this.trimEndSec = video.duration;
      this.requestUpdate();
    }
  }

  private _handleTrimStartInput(event: Event) {
    const nextValue = Number((event.target as HTMLInputElement).value);
    const maxStart = Math.max(0, this.trimEndSec - 0.1);
    this.trimStartSec = Math.min(nextValue, maxStart);
    this.requestUpdate();
  }

  private _handleTrimEndInput(event: Event) {
    const nextValue = Number((event.target as HTMLInputElement).value);
    const minEnd = Math.min(this.clipDurationSec, this.trimStartSec + 0.1);
    this.trimEndSec = Math.max(nextValue, minEnd);
    this.requestUpdate();
  }

  private _handleExportStatus = (status: string) => {
    this.exportStatus = status;
    this.requestUpdate();
  };

  private _handleExportProgress = (progress: number) => {
    this.exportProgress = Math.min(Math.max(progress, 0), 1);
    this.requestUpdate();
  };

  private async _exportClip(startSec: number, endSec: number, fileName: string) {
    if (!this.recordedClip) return;

    this.isExporting = true;
    this.error = "";
    this.exportStatus = "Preparing MP4 export...";
    this.exportProgress = 0;
    this.requestUpdate();

    try {
      const exportedClip = await this.previewService.trimRecordedVideo(
        this.recordedClip.blob,
        startSec,
        endSec,
        {
          onStatus: this._handleExportStatus,
          onProgress: this._handleExportProgress,
        },
      );
      this._downloadBlob(exportedClip.blob, fileName);
      this.exportStatus = "MP4 saved.";
      this.exportProgress = 1;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.exportStatus = "";
    } finally {
      this.isExporting = false;
      this.requestUpdate();
    }
  }

  private _resetTrimRange() {
    this.trimStartSec = 0;
    this.trimEndSec = this.clipDurationSec;
    this.requestUpdate();
  }

  private async _exportTrimmedClip() {
    if (!this.recordedClip) return;

    const fullRangeSelected = this.trimStartSec <= 0.01
      && Math.abs(this.trimEndSec - this.clipDurationSec) <= 0.05;
    await this._exportClip(
      this.trimStartSec,
      this.trimEndSec,
      fullRangeSelected ? `${this.fileBaseName}.mp4` : `${this.fileBaseName}-trimmed.mp4`,
    );
  }

  render() {
    if (!this.isOpen || !this.recordedClip) {
      return null;
    }

    const selectedDurationSec = Math.max(0, this.trimEndSec - this.trimStartSec);
    const isFullRange = this.trimStartSec <= 0.01 && Math.abs(this.trimEndSec - this.clipDurationSec) <= 0.05;
    const clipSizeMb = (this.recordedClip.blob.size / (1024 * 1024)).toFixed(1);
    const exportPercent = Math.round(this.exportProgress * 100);

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click=${this._handleBackdropClick}>
        <div class="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <div class="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Recorded Gameplay</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                ${this.recordedClip.width}x${this.recordedClip.height} • ${this._formatTime(this.clipDurationSec)} • ${clipSizeMb} MB
              </p>
            </div>
            <button
              @click=${() => this.close()}
              class="w-10 h-10 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Close video tools"
            >
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6">
            <div class="space-y-4">
              <video
                src=${this.clipUrl}
                controls
                playsinline
                @loadedmetadata=${this._handleMetadataLoaded}
                class="w-full rounded-2xl bg-black shadow-inner border border-slate-200 dark:border-slate-800"
              ></video>

              <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-sm text-slate-600 dark:text-slate-300">
                <p>Use the sliders to trim the gameplay range you want to keep.</p>
                <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">All exports are encoded as MP4. First export initializes the encoder core in the browser.</p>
              </div>
            </div>

            <div class="space-y-5">
              <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-5">
                <div class="flex items-center justify-between gap-3 mb-4">
                  <h4 class="font-semibold text-slate-900 dark:text-white">Trim Range</h4>
                  <span class="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                    Selected: ${this._formatTime(selectedDurationSec)}
                  </span>
                </div>

                ${!isFullRange ? html`
                  <button
                    @click=${() => this._resetTrimRange()}
                    class="mb-4 text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    Reset to full clip
                  </button>
                ` : ''}

                <div class="space-y-4">
                  <label class="block">
                    <div class="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <span>Start</span>
                      <span>${this._formatTime(this.trimStartSec)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="${Math.max(this.clipDurationSec, 0.1)}"
                      step="0.1"
                      .value=${String(this.trimStartSec)}
                      @input=${this._handleTrimStartInput}
                      class="w-full"
                    />
                  </label>

                  <label class="block">
                    <div class="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <span>End</span>
                      <span>${this._formatTime(this.trimEndSec)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="${Math.max(this.clipDurationSec, 0.1)}"
                      step="0.1"
                      .value=${String(this.trimEndSec)}
                      @input=${this._handleTrimEndInput}
                      class="w-full"
                    />
                  </label>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-5">
                <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div class="flex items-center justify-between gap-3">
                    <span>Source capture</span>
                    <span class="font-medium text-slate-900 dark:text-white">${this._formatTime(this.clipDurationSec)}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Export mode</span>
                    <span class="font-medium text-slate-900 dark:text-white">${isFullRange ? 'Full recording' : 'Trimmed selection'}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Source format</span>
                    <span class="font-medium text-slate-900 dark:text-white">${this.recordedClip.fileExtension.toUpperCase()}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Export format</span>
                    <span class="font-medium text-slate-900 dark:text-white">MP4</span>
                  </div>
                </div>

                ${this.exportStatus ? html`
                  <div class="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3">
                    <div class="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span>${this.exportStatus}</span>
                      ${this.isExporting ? html`<span class="font-semibold">${exportPercent}%</span>` : ''}
                    </div>
                    ${this.isExporting ? html`
                      <div class="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full bg-primary transition-all duration-200" style="width: ${exportPercent}%;"></div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                ${this.error ? html`
                  <div class="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                    ${this.error}
                  </div>
                ` : ''}

                <div class="mt-5 flex flex-wrap gap-3">
                  <button
                    @click=${() => this._exportTrimmedClip()}
                    ?disabled=${this.isExporting}
                    class="px-4 py-2.5 rounded bg-primary text-white font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    ${this.isExporting ? html`<span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>` : html`<span class="material-icons-outlined" style="font-size:18px">movie</span>`}
                    ${isFullRange ? 'Export MP4' : 'Export Trimmed MP4'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}