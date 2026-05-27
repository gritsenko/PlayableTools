import { ComponentBase, customElement, html, inject, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewRecordingResult } from "../../services/types";

type DragMode = "" | "start" | "end" | "playhead" | "range";

const MIN_TRIM_GAP_SEC = 0.1;

@customElement("preview-video-modal")
export class PreviewVideoModal extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;

  @state() private isOpen: boolean = false;
  @state() private clipUrl: string = "";
  @state() private clipDurationSec: number = 0;
  @state() private trimStartSec: number = 0;
  @state() private trimEndSec: number = 0;
  @state() private playheadSec: number = 0;
  @state() private isPlaying: boolean = false;
  @state() private isMuted: boolean = false;
  @state() private dragMode: DragMode = "";
  @state() private isExporting: boolean = false;
  @state() private error: string = "";
  @state() private fileBaseName: string = "playable-preview";
  @state() private exportStatus: string = "";
  @state() private exportProgress: number = 0;
  @state() private isPreparingExporter: boolean = false;

  private recordedClip: PreviewRecordingResult | null = null;
  private hasStartedExporterWarmup = false;
  private rangeDragOffsetPx = 0;

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
    this.playheadSec = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.dragMode = "";
    this.error = "";
    this.isExporting = false;
    this.exportStatus = "";
    this.exportProgress = 0;
    this.isPreparingExporter = false;
    this.isOpen = true;
    this.requestUpdate();
    await this.updateComplete;

    this._warmUpMp4Exporter();
  }

  close() {
    this._teardownDrag();
    const video = this._video;
    if (video) {
      try { video.pause(); } catch { /* ignore */ }
    }
    this.isOpen = false;
    this.isPlaying = false;
    this.dragMode = "";
    this.isExporting = false;
    this.error = "";
    this.clipDurationSec = 0;
    this.trimStartSec = 0;
    this.trimEndSec = 0;
    this.playheadSec = 0;
    this.exportStatus = "";
    this.exportProgress = 0;
    this.isPreparingExporter = false;
    this.recordedClip = null;
    this.hasStartedExporterWarmup = false;
    this._disposeClipUrl();
  }

  private get _video(): HTMLVideoElement | null {
    return this.querySelector("video");
  }

  private get _trackEl(): HTMLElement | null {
    return this.querySelector("[data-track]");
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

  /** Short timecode (m:ss.t) used for compact labels and chips. */
  private _formatTime(seconds: number): string {
    const totalTenths = Math.max(0, Math.round(seconds * 10));
    const minutes = Math.floor(totalTenths / 600);
    const secs = Math.floor((totalTenths % 600) / 10);
    const tenths = totalTenths % 10;
    return `${minutes}:${secs.toString().padStart(2, '0')}.${tenths}`;
  }

  /** Full timecode (mm:ss.SS) used for the centered counter and drag tooltips. */
  private _formatTimecode(seconds: number): string {
    const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const minutes = Math.floor(safe / 60);
    const secs = safe - minutes * 60;
    return `${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
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
    }

    if (this.recordedClip && video.videoWidth > 0 && video.videoHeight > 0) {
      this.recordedClip.width = video.videoWidth;
      this.recordedClip.height = video.videoHeight;
    }

    this.playheadSec = this.trimStartSec;
    this.isMuted = video.muted;
    this.requestUpdate();
  }

  // ---------------------------------------------------------------------------
  // Timeline: track geometry + playhead seeking
  // ---------------------------------------------------------------------------

  private _timeFromClientX(clientX: number): number {
    const track = this._trackEl;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (x / rect.width) * Math.max(this.clipDurationSec, 0.1);
  }

  private _seekTo(seconds: number) {
    const clamped = Math.max(0, Math.min(this.clipDurationSec, seconds));
    this.playheadSec = clamped;
    const video = this._video;
    if (video && Number.isFinite(clamped)) {
      try { video.currentTime = clamped; } catch { /* ignore */ }
    }
    this.requestUpdate();
  }

  // ---------------------------------------------------------------------------
  // Timeline: pointer drag handling (thumbs, range, playhead, rail click)
  // ---------------------------------------------------------------------------

  private _beginDrag(mode: DragMode) {
    // Pause playback so scrubbing/trimming shows clean frames instead of fighting playback.
    const video = this._video;
    if (video && !video.paused) {
      try { video.pause(); } catch { /* ignore */ }
    }
    this.dragMode = mode;
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    this.requestUpdate();
  }

  private _teardownDrag() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  private _onPointerMove = (event: PointerEvent) => {
    const t = this._timeFromClientX(event.clientX);
    switch (this.dragMode) {
      case 'start': {
        const next = Math.max(0, Math.min(t, this.trimEndSec - MIN_TRIM_GAP_SEC));
        this.trimStartSec = next;
        // Preview the frame sitting under the handle.
        this._seekTo(next);
        break;
      }
      case 'end': {
        const next = Math.min(this.clipDurationSec, Math.max(t, this.trimStartSec + MIN_TRIM_GAP_SEC));
        this.trimEndSec = next;
        // Preview the frame sitting under the handle.
        this._seekTo(next);
        break;
      }
      case 'playhead': {
        this._seekTo(Math.max(this.trimStartSec, Math.min(this.trimEndSec, t)));
        break;
      }
      case 'range': {
        const track = this._trackEl;
        if (!track) break;
        const rect = track.getBoundingClientRect();
        const len = this.trimEndSec - this.trimStartSec;
        let nextStart = ((event.clientX - rect.left - this.rangeDragOffsetPx) / rect.width) * Math.max(this.clipDurationSec, 0.1);
        nextStart = Math.max(0, Math.min(this.clipDurationSec - len, nextStart));
        this.trimStartSec = nextStart;
        this.trimEndSec = nextStart + len;
        this._seekTo(Math.max(nextStart, Math.min(nextStart + len, this.playheadSec)));
        break;
      }
      default:
        return;
    }
    this.requestUpdate();
  };

  private _onPointerUp = () => {
    this.dragMode = "";
    this._teardownDrag();
    this.requestUpdate();
  };

  private _handleThumbPointerDown(event: PointerEvent, which: 'start' | 'end') {
    event.preventDefault();
    event.stopPropagation();
    this._beginDrag(which);
  }

  private _handleRangePointerDown(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    const track = this._trackEl;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const startX = (this.trimStartSec / Math.max(this.clipDurationSec, 0.1)) * rect.width + rect.left;
    this.rangeDragOffsetPx = event.clientX - startX;
    this._beginDrag('range');
  }

  private _handlePlayheadPointerDown(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._beginDrag('playhead');
  }

  private _handleTrackPointerDown(event: PointerEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-thumb]') || target.closest('[data-range]') || target.closest('[data-playhead-dot]')) {
      return;
    }
    const t = this._timeFromClientX(event.clientX);
    this._seekTo(Math.max(this.trimStartSec, Math.min(this.trimEndSec, t)));
    this._beginDrag('playhead');
  }

  private _handleThumbKeydown(event: KeyboardEvent, which: 'start' | 'end') {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.shiftKey ? 1.0 : 0.1;
    const delta = event.key === 'ArrowLeft' ? -step : step;
    if (which === 'start') {
      this.trimStartSec = Math.max(0, Math.min(this.trimEndSec - MIN_TRIM_GAP_SEC, this.trimStartSec + delta));
    } else {
      this.trimEndSec = Math.min(this.clipDurationSec, Math.max(this.trimStartSec + MIN_TRIM_GAP_SEC, this.trimEndSec + delta));
    }
    // Keep the player on the frame under the handle being adjusted.
    this._seekTo(which === 'start' ? this.trimStartSec : this.trimEndSec);
  }

  // ---------------------------------------------------------------------------
  // Timeline: playback + mute, bound to the real <video> element
  // ---------------------------------------------------------------------------

  private _togglePlay() {
    const video = this._video;
    if (!video) return;
    if (video.paused) {
      if (this.playheadSec >= this.trimEndSec - 0.02 || video.currentTime < this.trimStartSec) {
        this._seekTo(this.trimStartSec);
      }
      void video.play().catch(() => { /* ignore autoplay rejection */ });
    } else {
      video.pause();
    }
  }

  private _handleVideoPlay() {
    this.isPlaying = true;
    this.requestUpdate();
  }

  private _handleVideoPause() {
    this.isPlaying = false;
    this.requestUpdate();
  }

  private _handleVideoEnded() {
    this.isPlaying = false;
    this._seekTo(this.trimEndSec);
  }

  private _handleVideoTimeUpdate(event: Event) {
    if (this.dragMode) return;
    const video = event.currentTarget as HTMLVideoElement;
    if (this.isPlaying && video.currentTime >= this.trimEndSec - 0.02) {
      video.pause();
      this._seekTo(this.trimEndSec);
      return;
    }
    this.playheadSec = Math.max(this.trimStartSec, Math.min(this.trimEndSec, video.currentTime));
    this.requestUpdate();
  }

  private _toggleMute() {
    const video = this._video;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted = video.muted;
    this.requestUpdate();
  }

  private _handleVolumeChange(event: Event) {
    this.isMuted = (event.currentTarget as HTMLVideoElement).muted;
    this.requestUpdate();
  }

  // ---------------------------------------------------------------------------
  // Export / download (unchanged integration with PreviewService)
  // ---------------------------------------------------------------------------

  private _handleExportStatus = (status: string) => {
    this.exportStatus = status;
    this.requestUpdate();
  };

  private _handleExportProgress = (progress: number) => {
    this.exportProgress = Math.min(Math.max(progress, 0), 1);
    this.requestUpdate();
  };

  private _downloadOriginalWebm() {
    if (!this.recordedClip) return;

    const extension = this.recordedClip.fileExtension || 'webm';
    this._downloadBlob(this.recordedClip.blob, `${this.fileBaseName}.${extension}`);
  }

  private _warmUpMp4Exporter() {
    if (this.hasStartedExporterWarmup || !this.isOpen) {
      return;
    }

    this.hasStartedExporterWarmup = true;
    this.isPreparingExporter = true;
    this.exportStatus = 'Preparing MP4 exporter...';
    this.exportProgress = 0;
    this.requestUpdate();

    void this.previewService.prepareMp4Exporter({
      onStatus: (status) => {
        if (!this.isOpen || this.isExporting) return;
        this.exportStatus = status;
        this.requestUpdate();
      },
      onProgress: (progress) => {
        if (!this.isOpen || this.isExporting) return;
        this.exportProgress = Math.min(Math.max(progress, 0), 1);
        this.requestUpdate();
      },
    }).catch((error) => {
      if (!this.isOpen || this.isExporting) return;
      this.error = error instanceof Error ? error.message : String(error);
      this.exportStatus = '';
      this.requestUpdate();
    }).finally(() => {
      if (!this.isOpen || this.isExporting) return;
      this.isPreparingExporter = false;
      if (!this.error) {
        this.exportStatus = 'MP4 exporter is ready.';
        this.exportProgress = 1;
      }
      this.requestUpdate();
    });
  }

  private async _exportClip(startSec: number, endSec: number, fileName: string) {
    if (!this.recordedClip) return;

    this.isExporting = true;
    this.isPreparingExporter = false;
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
    this._seekTo(0);
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  private _renderTimeline() {
    const dur = Math.max(this.clipDurationSec, 0.1);
    const startPct = (this.trimStartSec / dur) * 100;
    const endPct = (this.trimEndSec / dur) * 100;
    const playPct = (Math.max(this.trimStartSec, Math.min(this.trimEndSec, this.playheadSec)) / dur) * 100;

    return html`
      <div class="pvt-trim flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 px-3 py-2.5">
        <button
          class="pvt-icon-btn"
          @click=${() => this._togglePlay()}
          aria-label=${this.isPlaying ? 'Pause' : 'Play'}
          title=${this.isPlaying ? 'Pause' : 'Play'}
        >
          <span class="material-icons-outlined">${this.isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>

        <div class="pvt-track" data-track @pointerdown=${(e: PointerEvent) => this._handleTrackPointerDown(e)}>
          <div class="pvt-rail"></div>
          <div
            class="pvt-range"
            data-range
            style="left:${startPct}%; width:${Math.max(0, endPct - startPct)}%"
            @pointerdown=${(e: PointerEvent) => this._handleRangePointerDown(e)}
          ></div>
          <div
            class="pvt-thumb ${this.dragMode === 'start' ? 'is-dragging' : ''}"
            data-thumb="start"
            style="left:${startPct}%"
            tabindex="0"
            role="slider"
            aria-label="Trim start"
            aria-valuemin="0"
            aria-valuemax=${dur.toFixed(2)}
            aria-valuenow=${this.trimStartSec.toFixed(2)}
            @pointerdown=${(e: PointerEvent) => this._handleThumbPointerDown(e, 'start')}
            @keydown=${(e: KeyboardEvent) => this._handleThumbKeydown(e, 'start')}
          >
            <span class="pvt-tip">${this._formatTimecode(this.trimStartSec)}</span>
          </div>
          <div
            class="pvt-thumb ${this.dragMode === 'end' ? 'is-dragging' : ''}"
            data-thumb="end"
            style="left:${endPct}%"
            tabindex="0"
            role="slider"
            aria-label="Trim end"
            aria-valuemin="0"
            aria-valuemax=${dur.toFixed(2)}
            aria-valuenow=${this.trimEndSec.toFixed(2)}
            @pointerdown=${(e: PointerEvent) => this._handleThumbPointerDown(e, 'end')}
            @keydown=${(e: KeyboardEvent) => this._handleThumbKeydown(e, 'end')}
          >
            <span class="pvt-tip">${this._formatTimecode(this.trimEndSec)}</span>
          </div>
          <div class="pvt-playhead ${this.dragMode === 'playhead' ? 'is-dragging' : ''}" style="left:${playPct}%">
            <span
              class="pvt-playhead-dot"
              data-playhead-dot
              tabindex="0"
              role="slider"
              aria-label="Playhead"
              @pointerdown=${(e: PointerEvent) => this._handlePlayheadPointerDown(e)}
            ></span>
          </div>
        </div>

        <button
          class="pvt-icon-btn"
          @click=${() => this._toggleMute()}
          aria-label=${this.isMuted ? 'Unmute' : 'Mute'}
          aria-pressed=${this.isMuted}
          title=${this.isMuted ? 'Unmute' : 'Mute'}
        >
          <span class="material-icons-outlined">${this.isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
      </div>
    `;
  }

  render() {
    if (!this.isOpen || !this.recordedClip) {
      return null;
    }

    const selectedDurationSec = Math.max(0, this.trimEndSec - this.trimStartSec);
    const isFullRange = this.trimStartSec <= 0.01 && Math.abs(this.trimEndSec - this.clipDurationSec) <= 0.05;
    const clipSizeMb = (this.recordedClip.blob.size / (1024 * 1024)).toFixed(1);
    const exportPercent = Math.round(this.exportProgress * 100);
    // Only surface the status row while there is real work in flight — the idle
    // "exporter is ready" message is just noise.
    const showExportProgress = this.isExporting || this.isPreparingExporter;

    return html`
      <style>
        .pvt-track {
          position: relative;
          flex: 1 1 auto;
          height: 28px;
          touch-action: none;
          user-select: none;
        }
        .pvt-rail {
          position: absolute;
          left: 0; right: 0; top: 50%;
          transform: translateY(-50%);
          height: 4px;
          border-radius: 2px;
          background: #cbd5e1;
        }
        .dark .pvt-rail { background: #475569; }
        .pvt-range {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          height: 4px;
          border-radius: 2px;
          background: var(--pvt-accent, #2563eb);
          cursor: grab;
        }
        .pvt-range:active { cursor: grabbing; }
        .pvt-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px; height: 22px;
          background: var(--pvt-accent, #2563eb);
          border-radius: 4px;
          cursor: ew-resize;
          box-shadow: 0 0 0 2px #fff inset, 0 1px 2px rgba(0,0,0,.18);
          z-index: 3;
          touch-action: none;
        }
        .dark .pvt-thumb { box-shadow: 0 0 0 2px #0f172a inset, 0 1px 2px rgba(0,0,0,.4); }
        .pvt-thumb::before { content: ''; position: absolute; inset: -8px -10px; }
        .pvt-thumb:focus-visible { outline: 2px solid var(--pvt-accent, #2563eb); outline-offset: 3px; }
        .pvt-thumb.is-dragging { background: var(--pvt-accent-strong, #1d4ed8); }
        .pvt-tip {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 12px);
          transform: translateX(-50%) translateY(4px);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          background: #fff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 3px 8px;
          white-space: nowrap;
          box-shadow: 0 6px 14px rgba(16,24,40,.12);
          opacity: 0;
          pointer-events: none;
          transition: opacity .12s ease, transform .12s ease;
        }
        .dark .pvt-tip { background: #1e293b; color: #f1f5f9; border-color: #334155; }
        .pvt-tip::after {
          content: '';
          position: absolute;
          left: 50%; bottom: -4px;
          width: 8px; height: 8px;
          background: inherit;
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          transform: translateX(-50%) rotate(45deg);
        }
        .dark .pvt-tip::after { border-color: #334155; }
        .pvt-thumb.is-dragging .pvt-tip { opacity: 1; transform: translateX(-50%) translateY(0); }
        .pvt-playhead {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 2px;
          height: 28px;
          background: var(--pvt-accent, #2563eb);
          z-index: 2;
          pointer-events: none;
        }
        .pvt-playhead-dot {
          position: absolute;
          left: 50%; top: -10px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--pvt-accent, #2563eb);
          transform: translateX(-50%);
          box-shadow: 0 0 0 3px #fff, 0 1px 3px rgba(0,0,0,.2);
          pointer-events: auto;
          cursor: grab;
          touch-action: none;
        }
        .dark .pvt-playhead-dot { box-shadow: 0 0 0 3px #0f172a, 0 1px 3px rgba(0,0,0,.5); }
        .pvt-playhead-dot::before { content: ''; position: absolute; inset: -10px; border-radius: 50%; }
        .pvt-playhead-dot:focus-visible { outline: 2px solid var(--pvt-accent, #2563eb); outline-offset: 3px; }
        .pvt-playhead.is-dragging .pvt-playhead-dot { cursor: grabbing; background: var(--pvt-accent-strong, #1d4ed8); }
        .pvt-icon-btn {
          width: 36px; height: 36px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 0;
          background: transparent;
          color: inherit;
          border-radius: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .pvt-icon-btn:hover { background: rgba(100,116,139,.14); }
        .pvt-icon-btn:focus-visible { outline: 2px solid var(--pvt-accent, #2563eb); outline-offset: 2px; }
        .pvt-counter {
          display: flex; justify-content: center; align-items: baseline;
          gap: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 15px;
        }
      </style>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        style="--pvt-accent:#2563eb; --pvt-accent-strong:#1d4ed8;"
        @click=${this._handleBackdropClick}
      >
        <div class="w-full max-w-3xl mx-4 max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
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

          <div class="space-y-5 p-6">
            <video
              src=${this.clipUrl}
              playsinline
              @click=${() => this._togglePlay()}
              @loadedmetadata=${this._handleMetadataLoaded}
              @play=${() => this._handleVideoPlay()}
              @pause=${() => this._handleVideoPause()}
              @ended=${() => this._handleVideoEnded()}
              @timeupdate=${(e: Event) => this._handleVideoTimeUpdate(e)}
              @volumechange=${(e: Event) => this._handleVolumeChange(e)}
              class="w-full max-h-[46vh] rounded-2xl bg-black shadow-inner border border-slate-200 dark:border-slate-800 cursor-pointer"
            ></video>

            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="font-semibold text-slate-900 dark:text-white">Trim &amp; Preview</h4>
                <span class="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  Selected ${this._formatTime(selectedDurationSec)}
                </span>
              </div>

              <div class="pvt-counter text-slate-500 dark:text-slate-400">
                <span>${this._formatTimecode(this.playheadSec)}</span>
                <span class="text-slate-300 dark:text-slate-600">/</span>
                <span class="font-semibold text-slate-900 dark:text-white">${this._formatTimecode(this.clipDurationSec)}</span>
              </div>

              ${this._renderTimeline()}

              ${!isFullRange ? html`
                <div class="flex items-center justify-between gap-3 text-xs">
                  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace;" class="text-slate-400 dark:text-slate-500">
                    ${this._formatTime(this.trimStartSec)} – ${this._formatTime(this.trimEndSec)}
                  </span>
                  <button
                    @click=${() => this._resetTrimRange()}
                    class="text-primary hover:underline transition-colors"
                  >
                    Reset to full clip
                  </button>
                </div>
              ` : ''}
            </div>

            ${showExportProgress ? html`
              <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3">
                <div class="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span>${this.exportStatus}</span>
                  <span class="font-semibold">${exportPercent}%</span>
                </div>
                <div class="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full bg-primary transition-all duration-200" style="width: ${exportPercent}%;"></div>
                </div>
              </div>
            ` : ''}

            ${this.error ? html`
              <div class="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                ${this.error}
              </div>
            ` : ''}

            <div class="flex flex-wrap items-center gap-3">
              <button
                @click=${() => this._exportTrimmedClip()}
                ?disabled=${this.isExporting || this.isPreparingExporter}
                class="px-4 py-2.5 rounded bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                ${(this.isExporting || this.isPreparingExporter) ? html`<span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>` : html`<span class="material-icons-outlined" style="font-size:18px">movie</span>`}
                ${isFullRange ? 'Export MP4' : 'Export Trimmed MP4'}
              </button>
              <button
                @click=${() => this._downloadOriginalWebm()}
                ?disabled=${this.isExporting}
                class="px-4 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <span class="material-icons-outlined" style="font-size:18px">download</span>
                Original ${this.recordedClip.fileExtension.toUpperCase()}
              </button>
              ${(this.exportStatus === 'MP4 saved.' && !this.isExporting) ? html`
                <span class="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <span class="material-icons-outlined" style="font-size:18px">check_circle</span>
                  Saved
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
