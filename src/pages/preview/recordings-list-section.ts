import { ComponentBase, customElement, html, state, inject } from "fw";
import { VideoStorageService, type StoredVideo } from "../../services/VideoStorageService";
import { generateVideoThumbnail } from "../../utils/video-thumbnail";
import "./preview-video-modal";

/**
 * Inline list of previously recorded gameplay clips, shown at the bottom of the
 * preview page so saved recordings are reachable without first loading a
 * playable. Each clip is rendered as a card with a generated video thumbnail
 * and Play / Delete actions. Renders nothing when there are no recordings.
 */
@customElement("recordings-list-section")
export class RecordingsListSection extends ComponentBase {
  @inject(VideoStorageService) videoStorageService!: VideoStorageService;

  @state() private videos: StoredVideo[] = [];
  @state() private loading = true;
  @state() private thumbnails: Record<string, string | null> = {};

  connectedCallback() {
    super.connectedCallback();
    void this.refresh();
  }

  async refresh() {
    this.loading = true;
    this.videos = await this.videoStorageService.getVideos();
    this.loading = false;
    void this.generateThumbnails();
  }

  private async generateThumbnails() {
    // Generate sequentially to avoid spawning many concurrent video decoders.
    for (const video of this.videos) {
      if (video.id in this.thumbnails) continue;
      const { dataUrl } = await generateVideoThumbnail(video.blob);
      this.thumbnails = { ...this.thumbnails, [video.id]: dataUrl };
    }
  }

  private async deleteVideo(id: string) {
    if (!confirm("Delete this recording?")) return;
    await this.videoStorageService.deleteVideo(id);
    const next = { ...this.thumbnails };
    delete next[id];
    this.thumbnails = next;
    this.videos = await this.videoStorageService.getVideos();
  }

  private playVideo(video: StoredVideo) {
    const clip = {
      blob: video.blob,
      mimeType: video.blob.type || "video/webm",
      fileExtension: (video.blob.type || "").includes("mp4") ? "mp4" : "webm",
      durationMs: video.durationMs,
      width: 0,
      height: 0,
      startedAt: Date.now() - video.durationMs,
    };
    const modal = this.querySelector("preview-video-modal");
    if (modal) {
      (modal as any).show(clip, "Recovered Recording");
    }
  }

  render() {
    // Stay invisible until we know there is at least one recording to show.
    // The modal is always rendered (as a stable node) so playback works.
    const hasRecordings = !this.loading && this.videos.length > 0;
    return html`
      ${hasRecordings
        ? html`
            <div class="mt-8 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons-outlined">video_library</span>
                  Previous Recordings
                </h3>
                <span class="text-sm text-slate-500 dark:text-slate-400">${this.videos.length} clip${this.videos.length === 1 ? "" : "s"}</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                ${this.videos.map((v) => this.renderCard(v))}
              </div>
            </div>
          `
        : null}
      <preview-video-modal></preview-video-modal>
    `;
  }

  private renderCard(v: StoredVideo) {
    const thumb = this.thumbnails[v.id];
    const thumbReady = v.id in this.thumbnails;
    const durationSec = (v.durationMs / 1000).toFixed(1);
    const sizeMb = (v.blob.size / 1024 / 1024).toFixed(2);

    return html`
      <div class="group relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <button
          @click=${() => this.playVideo(v)}
          title="Play recording"
          class="relative block w-full h-40 bg-slate-900 overflow-hidden focus:outline-none"
        >
          ${thumb
            ? html`<img src=${thumb} alt="Recording preview" class="w-full h-full object-contain" />`
            : thumbReady
            ? html`
                <span class="absolute inset-0 flex items-center justify-center text-slate-500">
                  <span class="material-icons-outlined" style="font-size:40px">movie</span>
                </span>
              `
            : html`
                <span class="absolute inset-0 flex items-center justify-center">
                  <span class="animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent"></span>
                </span>
              `}
          <span class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <span class="material-icons-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity" style="font-size:48px">play_circle</span>
          </span>
          <span class="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">${durationSec}s</span>
        </button>

        <div class="p-3 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title=${new Date(v.timestamp).toLocaleString()}>
              ${new Date(v.timestamp).toLocaleString()}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${sizeMb} MB</div>
          </div>
          <button
            @click=${() => this.deleteVideo(v.id)}
            title="Delete recording"
            class="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <span class="material-icons-outlined" style="font-size:18px">delete</span>
          </button>
        </div>
      </div>
    `;
  }
}
