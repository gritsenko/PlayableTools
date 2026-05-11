import { ComponentBase, customElement, html, inject, route, state } from "fw";
import { PngQuantizerService } from "../services/PngQuantizerService";

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: "read" | "readwrite";
    }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemHandle {
    readonly kind: "file" | "directory";
    readonly name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: "file";
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: "directory";
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    getDirectoryHandle(
      name: string,
      options?: { create?: boolean }
    ): Promise<FileSystemDirectoryHandle>;
    getFileHandle(
      name: string,
      options?: { create?: boolean }
    ): Promise<FileSystemFileHandle>;
  }

  interface FileSystemWritableFileStream {
    write(data: Blob | BufferSource | string): Promise<void>;
    close(): Promise<void>;
  }
}

type EntryStatus =
  | "idle"
  | "compressing"
  | "done"
  | "skipped"
  | "error"
  | "saved";

interface PngEntry {
  name: string;
  relPath: string;
  relDir: string;
  fileHandle: FileSystemFileHandle;
  originalBlob: Blob;
  originalSize: number;
  thumbUrl: string;
  compressedBlob?: Blob;
  compressedSize?: number;
  status: EntryStatus;
  error?: string;
  include: boolean;
}

const STORAGE_KEEP_ORIGINALS = "compress-assets:keepOriginals";
const STORAGE_MAX_COLORS = "compress-assets:maxColors";
const COLOR_OPTIONS = [16, 32, 64, 128, 256];

@customElement("compress-assets-page")
@route("/compress-assets", {
  title: "Compress PNG Assets",
  description:
    "Quantize and compress PNG images in a local folder directly in your browser.",
})
export class CompressAssetsPage extends ComponentBase {
  @inject(PngQuantizerService) private quantizer!: PngQuantizerService;

  @state() private isSupported =
    typeof window !== "undefined" && "showDirectoryPicker" in window;
  @state() private folderName = "";
  @state() private rootHandle: FileSystemDirectoryHandle | null = null;
  @state() private entries: PngEntry[] = [];
  @state() private totalFolderSize = 0;
  @state() private scanning = false;
  @state() private compressing = false;
  @state() private saving = false;
  @state() private errorMessage = "";
  @state() private progressCurrent = 0;
  @state() private progressTotal = 0;
  @state() private keepOriginals = true;
  @state() private maxColors = 256;
  @state() private savedCount = 0;
  @state() private savedAt: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    const stored = localStorage.getItem(STORAGE_KEEP_ORIGINALS);
    if (stored !== null) this.keepOriginals = stored === "true";
    const storedColors = localStorage.getItem(STORAGE_MAX_COLORS);
    if (storedColors !== null) {
      const n = parseInt(storedColors, 10);
      if (COLOR_OPTIONS.includes(n)) this.maxColors = n;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._revokeThumbnails();
  }

  private _revokeThumbnails() {
    for (const e of this.entries) {
      if (e.thumbUrl) URL.revokeObjectURL(e.thumbUrl);
    }
  }

  private _formatSize(bytes: number): string {
    if (!bytes) return "0 B";
    const k = 1024;
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
  }

  private _onSelectFolder = async () => {
    if (!this.isSupported) {
      this.errorMessage =
        "File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.";
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      this._revokeThumbnails();
      this.errorMessage = "";
      this.entries = [];
      this.totalFolderSize = 0;
      this.folderName = handle.name;
      this.rootHandle = handle;
      this.savedCount = 0;
      this.savedAt = null;
      await this._scan(handle);
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      this.errorMessage =
        err instanceof Error ? err.message : "Failed to read folder.";
    }
  };

  private async _scan(handle: FileSystemDirectoryHandle) {
    this.scanning = true;
    try {
      const acc = { totalBytes: 0, pngs: [] as PngEntry[] };
      await this._walk(handle, "", acc);
      acc.pngs.sort((a, b) => b.originalSize - a.originalSize);
      this.totalFolderSize = acc.totalBytes;
      this.entries = acc.pngs;
    } finally {
      this.scanning = false;
    }
  }

  private async _walk(
    dir: FileSystemDirectoryHandle,
    relPath: string,
    acc: { totalBytes: number; pngs: PngEntry[] }
  ) {
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === "directory") {
        if (name.toLowerCase() === "originals") continue;
        await this._walk(
          entry as FileSystemDirectoryHandle,
          relPath ? `${relPath}/${name}` : name,
          acc
        );
        continue;
      }
      const fileHandle = entry as FileSystemFileHandle;
      let file: File;
      try {
        file = await fileHandle.getFile();
      } catch {
        continue;
      }
      acc.totalBytes += file.size;
      if (!name.toLowerCase().endsWith(".png")) continue;
      const thumbUrl = URL.createObjectURL(file);
      acc.pngs.push({
        name,
        relPath: relPath ? `${relPath}/${name}` : name,
        relDir: relPath,
        fileHandle,
        originalBlob: file,
        originalSize: file.size,
        thumbUrl,
        status: "idle",
        include: true,
      });
    }
  }

  private _onColorsChange = (e: Event) => {
    const value = parseInt((e.target as HTMLSelectElement).value, 10);
    if (!COLOR_OPTIONS.includes(value)) return;
    this.maxColors = value;
    localStorage.setItem(STORAGE_MAX_COLORS, String(value));
  };

  private _onKeepOriginalsChange = (e: Event) => {
    this.keepOriginals = (e.target as HTMLInputElement).checked;
    localStorage.setItem(STORAGE_KEEP_ORIGINALS, String(this.keepOriginals));
  };

  private _onToggleInclude = (entry: PngEntry, e: Event) => {
    entry.include = (e.target as HTMLInputElement).checked;
    this.entries = [...this.entries];
  };

  private _onCompressAll = async () => {
    if (this.compressing || !this.entries.length) return;
    this.compressing = true;
    this.errorMessage = "";
    this.progressCurrent = 0;
    this.progressTotal = this.entries.length;
    try {
      for (let i = 0; i < this.entries.length; i++) {
        const entry = this.entries[i];
        entry.status = "compressing";
        this.entries = [...this.entries];
        try {
          const { blob } = await this.quantizer.quantize(
            entry.originalBlob,
            this.maxColors
          );
          entry.compressedBlob = blob;
          entry.compressedSize = blob.size;
          if (blob.size >= entry.originalSize) {
            entry.status = "skipped";
            entry.include = false;
          } else {
            entry.status = "done";
            entry.include = true;
          }
        } catch (err) {
          entry.status = "error";
          entry.error =
            err instanceof Error ? err.message : "Compression failed";
          entry.include = false;
        }
        this.progressCurrent = i + 1;
        this.entries = [...this.entries];
      }
    } finally {
      this.compressing = false;
    }
  };

  private async _ensureDirectoryPath(
    root: FileSystemDirectoryHandle,
    relDir: string
  ): Promise<FileSystemDirectoryHandle> {
    if (!relDir) return root;
    let current = root;
    for (const segment of relDir.split("/")) {
      if (!segment) continue;
      current = await current.getDirectoryHandle(segment, { create: true });
    }
    return current;
  }

  private _onSave = async () => {
    if (!this.rootHandle || this.saving) return;
    const toSave = this.entries.filter(
      (e) => e.include && e.compressedBlob && e.status !== "saved"
    );
    if (!toSave.length) return;

    this.saving = true;
    this.errorMessage = "";
    this.progressCurrent = 0;
    this.progressTotal = toSave.length;
    let savedNow = 0;

    try {
      let originalsRoot: FileSystemDirectoryHandle | null = null;
      if (this.keepOriginals) {
        originalsRoot = await this.rootHandle.getDirectoryHandle("originals", {
          create: true,
        });
      }

      for (let i = 0; i < toSave.length; i++) {
        const entry = toSave[i];
        try {
          if (originalsRoot) {
            const backupDir = await this._ensureDirectoryPath(
              originalsRoot,
              entry.relDir
            );
            const backupHandle = await backupDir.getFileHandle(entry.name, {
              create: true,
            });
            const w1 = await backupHandle.createWritable();
            await w1.write(entry.originalBlob);
            await w1.close();
          }

          const w2 = await entry.fileHandle.createWritable();
          await w2.write(entry.compressedBlob!);
          await w2.close();

          entry.status = "saved";
          entry.originalSize = entry.compressedSize!;
          savedNow++;
        } catch (err) {
          entry.status = "error";
          entry.error =
            err instanceof Error ? err.message : "Failed to write file";
        }
        this.progressCurrent = i + 1;
        this.entries = [...this.entries];
      }

      this.savedCount = savedNow;
      this.savedAt = Date.now();
    } catch (err) {
      this.errorMessage =
        err instanceof Error ? err.message : "Failed to save files.";
    } finally {
      this.saving = false;
    }
  };

  private _onReset = () => {
    this._revokeThumbnails();
    this.entries = [];
    this.rootHandle = null;
    this.folderName = "";
    this.totalFolderSize = 0;
    this.savedCount = 0;
    this.savedAt = null;
    this.errorMessage = "";
  };

  private get _totalPngOriginalSize(): number {
    return this.entries.reduce((sum, e) => sum + e.originalSize, 0);
  }

  private get _totalCompressedSize(): number {
    return this.entries.reduce(
      (sum, e) => sum + (e.compressedSize ?? e.originalSize),
      0
    );
  }

  private get _anyCompressed(): boolean {
    return this.entries.some((e) => !!e.compressedBlob);
  }

  private get _anySelectedToSave(): number {
    return this.entries.filter(
      (e) => e.include && e.compressedBlob && e.status !== "saved"
    ).length;
  }

  render() {
    return html`
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Compress PNG Assets
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-6">
          Select a local folder, preview every PNG inside, then quantize and
          save the optimized files. Everything runs locally in your browser —
          no uploads.
        </p>

        ${!this.isSupported
          ? html`
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-6 rounded-r text-yellow-700 dark:text-yellow-300">
                <strong>Browser Compatibility:</strong> This tool requires a
                Chromium-based browser (Chrome, Edge, etc.) with File System
                Access API support.
              </div>
            `
          : ""}

        ${this._renderToolbar()}
        ${this.errorMessage
          ? html`<div class="mt-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r text-red-700 dark:text-red-300">${this.errorMessage}</div>`
          : ""}
        ${this._renderSummary()} ${this._renderGrid()} ${this._renderActions()}
      </div>
    `;
  }

  private _renderToolbar() {
    return html`
      <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 mb-6">
        <button
          class="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @click=${this._onSelectFolder}
          ?disabled=${!this.isSupported ||
          this.scanning ||
          this.compressing ||
          this.saving}
        >
          ${this.scanning ? "Scanning…" : "Select Folder"}
        </button>

        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span class="font-medium">Colors:</span>
          <select
            class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-base min-w-[96px]"
            @change=${this._onColorsChange}
            ?disabled=${this.compressing || this.saving}
          >
            ${COLOR_OPTIONS.map(
              (n) => html`<option value=${n} ?selected=${n === this.maxColors}>${n}</option>`
            )}
          </select>
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            class="rounded border-slate-300 dark:border-slate-700"
            .checked=${this.keepOriginals}
            @change=${this._onKeepOriginalsChange}
            ?disabled=${this.saving}
          />
          Keep originals in
          <code class="text-xs px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">originals/</code>
          subfolder
        </label>

        ${this.folderName
          ? html`
              <div class="ml-auto text-sm text-slate-600 dark:text-slate-400">
                Folder: <strong class="text-slate-900 dark:text-white">${this.folderName}</strong>
              </div>
            `
          : ""}
      </div>
    `;
  }

  private _renderSummary() {
    if (!this.entries.length || this.scanning) return "";
    const pngTotal = this._totalPngOriginalSize;
    const folderTotal = this.totalFolderSize;
    const sharePct = folderTotal ? (pngTotal / folderTotal) * 100 : 0;
    const compressed = this._totalCompressedSize;
    const savedBytes = pngTotal - compressed;
    const savedPct = pngTotal ? (savedBytes / pngTotal) * 100 : 0;

    return html`
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400">PNG files</div>
          <div class="text-xl font-mono text-slate-900 dark:text-white">${this.entries.length}</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400">PNG total size</div>
          <div class="text-xl font-mono text-slate-900 dark:text-white">${this._formatSize(pngTotal)}</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400">Folder size</div>
          <div class="text-xl font-mono text-slate-900 dark:text-white">${this._formatSize(folderTotal)}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG share: ${sharePct.toFixed(1)}%</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
          <div class="text-xs text-slate-500 dark:text-slate-400">After compression</div>
          <div class="text-xl font-mono ${this._anyCompressed ? "text-green-600 dark:text-green-400 font-bold" : "text-slate-400"}">
            ${this._anyCompressed ? this._formatSize(compressed) : "—"}
          </div>
          ${this._anyCompressed
            ? html`<div class="text-xs text-green-600 dark:text-green-400 mt-1">−${this._formatSize(savedBytes)} (${savedPct.toFixed(1)}%)</div>`
            : ""}
        </div>
      </div>
    `;
  }

  private _renderGrid() {
    if (this.scanning) {
      return html`
        <div class="mt-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <div class="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4"></div>
          Scanning folder…
        </div>
      `;
    }

    if (!this.entries.length) {
      if (!this.rootHandle) {
        return html`
          <div class="bg-white dark:bg-slate-900 p-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            Pick a folder to start. The tool will recursively list every PNG it
            finds (the <code class="text-xs px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">originals/</code> subfolder is skipped).
          </div>
        `;
      }
      return html`
        <div class="bg-white dark:bg-slate-900 p-8 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
          No PNG files found in this folder.
        </div>
      `;
    }

    const pngTotal = this._totalPngOriginalSize;
    const maxShare = pngTotal
      ? (Math.max(...this.entries.map((e) => e.originalSize)) / pngTotal) * 100
      : 0;

    return html`
      <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="grid grid-cols-12 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
          <div class="col-span-1"></div>
          <div class="col-span-1">Preview</div>
          <div class="col-span-3">File</div>
          <div class="col-span-2">Size</div>
          <div class="col-span-2">Share</div>
          <div class="col-span-3 text-right">Result</div>
        </div>
        ${this.entries.map((e) => this._renderRow(e, pngTotal, maxShare))}
      </div>
    `;
  }

  private _renderRow(entry: PngEntry, pngTotal: number, maxShare: number) {
    const sharePct = pngTotal ? (entry.originalSize / pngTotal) * 100 : 0;
    const barWidth = maxShare ? (sharePct / maxShare) * 100 : 0;
    const hasResult = !!entry.compressedBlob;
    const reductionPct = hasResult
      ? ((entry.originalSize - entry.compressedSize!) / entry.originalSize) *
        100
      : 0;

    return html`
      <div class="grid grid-cols-12 items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0 text-sm">
        <div class="col-span-1">
          <input
            type="checkbox"
            class="rounded border-slate-300 dark:border-slate-700"
            .checked=${entry.include}
            ?disabled=${!hasResult || entry.status === "saved" || this.saving || this.compressing}
            @change=${(ev: Event) => this._onToggleInclude(entry, ev)}
            title="Include in save"
          />
        </div>
        <div class="col-span-1">
          <img
            src=${entry.thumbUrl}
            alt=${entry.name}
            class="w-12 h-12 object-contain bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:8px_8px] rounded border border-slate-200 dark:border-slate-700"
            loading="lazy"
          />
        </div>
        <div class="col-span-3 min-w-0">
          <div class="font-medium text-slate-900 dark:text-white truncate" title=${entry.relPath}>${entry.name}</div>
          ${entry.relDir
            ? html`<div class="text-xs text-slate-500 dark:text-slate-400 truncate" title=${entry.relDir}>${entry.relDir}/</div>`
            : ""}
        </div>
        <div class="col-span-2 font-mono text-slate-700 dark:text-slate-300">${this._formatSize(entry.originalSize)}</div>
        <div class="col-span-2">
          <div class="relative h-5 w-full bg-slate-100 dark:bg-slate-800/60 rounded overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 bg-primary/30 dark:bg-primary/40"
              style="width: ${barWidth.toFixed(2)}%"
            ></div>
            <div class="relative z-10 h-full flex items-center justify-end pr-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              ${sharePct.toFixed(1)}%
            </div>
          </div>
        </div>
        <div class="col-span-3 text-right">
          ${this._renderRowStatus(entry, reductionPct)}
        </div>
      </div>
    `;
  }

  private _renderRowStatus(entry: PngEntry, reductionPct: number) {
    if (entry.status === "compressing") {
      return html`<span class="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span class="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></span>
        Compressing…
      </span>`;
    }
    if (entry.status === "error") {
      return html`<span class="text-red-600 dark:text-red-400" title=${entry.error ?? ""}>Error</span>`;
    }
    if (entry.status === "saved") {
      return html`<span class="text-green-600 dark:text-green-400 font-medium">Saved — ${this._formatSize(entry.compressedSize ?? entry.originalSize)}</span>`;
    }
    if (entry.status === "skipped") {
      return html`<span class="text-amber-600 dark:text-amber-400" title="Compressed file would be larger than original">Already optimal</span>`;
    }
    if (entry.status === "done" && entry.compressedSize !== undefined) {
      return html`
        <span class="font-mono text-green-600 dark:text-green-400 font-medium">
          ${this._formatSize(entry.compressedSize)}
        </span>
        <span class="text-xs text-green-600 dark:text-green-400 ml-1">−${reductionPct.toFixed(1)}%</span>
      `;
    }
    return html`<span class="text-slate-400">—</span>`;
  }

  private _renderActions() {
    if (!this.entries.length) return "";
    const compressDone = this._anyCompressed && !this.compressing;
    const savableCount = this._anySelectedToSave;

    return html`
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          class="inline-flex items-center px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @click=${this._onCompressAll}
          ?disabled=${this.compressing || this.saving}
        >
          <span class="material-icons-outlined mr-2 text-sm">compress</span>
          ${this.compressing
            ? `Compressing ${this.progressCurrent}/${this.progressTotal}…`
            : compressDone
            ? "Recompress"
            : "Compress"}
        </button>

        <button
          class="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @click=${this._onSave}
          ?disabled=${!savableCount || this.saving || this.compressing}
        >
          <span class="material-icons-outlined mr-2 text-sm">save</span>
          ${this.saving
            ? `Saving ${this.progressCurrent}/${this.progressTotal}…`
            : `Save${savableCount ? ` (${savableCount})` : ""}`}
        </button>

        <button
          class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors font-medium"
          @click=${this._onReset}
          ?disabled=${this.compressing || this.saving}
        >
          Cancel
        </button>

        ${this.savedAt
          ? html`
              <span class="text-sm text-green-700 dark:text-green-400 ml-auto">
                <span class="material-icons-outlined align-middle text-base mr-1">check_circle</span>
                Saved ${this.savedCount} file${this.savedCount === 1 ? "" : "s"}${this.keepOriginals ? " · originals backed up" : ""}
              </span>
            `
          : ""}
      </div>
    `;
  }
}
