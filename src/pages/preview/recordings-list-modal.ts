import { ComponentBase, customElement, html, state, inject } from "fw"; // BOM fix
import { VideoStorageService, type StoredVideo } from "../../services/VideoStorageService";

@customElement("recordings-list-modal")
export class RecordingsListModal extends ComponentBase {
  @inject(VideoStorageService) videoStorageService!: VideoStorageService;

  @state() private open = false;
  @state() private videos: StoredVideo[] = [];

  async show() {
    this.videos = await this.videoStorageService.getVideos();
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  async deleteVideo(id: string) {
    if (confirm("Delete this recording?")) {
      await this.videoStorageService.deleteVideo(id);
      this.videos = await this.videoStorageService.getVideos();
    }
  }

  playVideo(video: StoredVideo) {
    this.hide();
    const clip = {
      blob: video.blob,
      mimeType: video.blob.type || 'video/webm',
      fileExtension: (video.blob.type || '').includes('mp4') ? 'mp4' : 'webm',
      durationMs: video.durationMs,
      width: 0,
      height: 0,
      startedAt: Date.now() - video.durationMs
    };
    const modal = document.querySelector('preview-video-modal');
    if (modal) {
      (modal as any).show(clip, "Recovered Recording");
    }
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-xl font-bold">Previous Recordings</h2>
            <button @click=${() => this.hide()} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            ${this.videos.length === 0 ? html`<p class="text-slate-500 text-center py-8">No recordings found.</p>` : this.videos.map(v => html`
              <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <div class="font-medium text-slate-800 dark:text-slate-200">Recording from ${new Date(v.timestamp).toLocaleString()}</div>
                  <div class="text-sm text-slate-500">${(v.durationMs / 1000).toFixed(1)}s &bull; ${(v.blob.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <div class="flex gap-2">
                  <button @click=${() => this.playVideo(v)} class="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors shadow-sm">Play</button>
                  <button @click=${() => this.deleteVideo(v.id)} class="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/20 font-medium text-sm transition-colors shadow-sm">Delete</button>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}
