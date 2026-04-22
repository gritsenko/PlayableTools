import { ComponentBase, customElement, html, route, inject } from "fw";
import { Base64ConverterService } from "../services/Base64ConverterService";
import type { Base64FileModel } from "../services/Base64ConverterService";

@customElement("base64-page")
@route("/base64", {
  title: "Base64 Converter for Playable Ads | PlayableTools",
  description: "Convert creative assets to Base64 strings for HTML5 playable ads, inline demos, and embedded media workflows.",
})
export class HomePage extends ComponentBase {
  _downloadDataUrl(e: Event, dataUrl: string, name: string) {
    e.preventDefault();
    const win = window.open();
    if (win) {
      win.document.write("<pre>" + this._escapeHtml(dataUrl) + "</pre>");
      win.document.title = name + " (Base64)";
    }
  }

  _escapeHtml(str: string) {
    return str.replace(/[&<>"']/g, function (c) {
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        } as any
      )[c];
    });
  }
  @inject(Base64ConverterService) base64Service!: Base64ConverterService;

  dragActive = false;
  files: File[] = [];
  progress = 0;
  results: Base64FileModel[] = [];
  processing = false;
  copiedIndex: number | null = null;

  _onDragOver = (e: DragEvent) => {
    e.preventDefault();
    this.dragActive = true;
    this.requestUpdate();
  };

  _onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
  };

  _onDrop = (e: DragEvent) => {
    e.preventDefault();
    this.dragActive = false;
    if (e.dataTransfer?.files?.length) {
      this._handleFiles(e.dataTransfer.files);
    }
  };

  _onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this._handleFiles(input.files);
    }
  };

  async _handleFiles(fileList: FileList) {
    this.files = Array.from(fileList);
    this.progress = 0;
    this.processing = true;
    this.results = [];
    this.requestUpdate();
    this.results = await this.base64Service.convertFilesToBase64(
      this.files,
      (p) => {
        this.progress = p;
        this.requestUpdate();
      }
    );
    this.processing = false;
    this.requestUpdate();
  }

  async _copyToClipboard(data: string, idx: number) {
    try {
      await navigator.clipboard.writeText(data);
      this.copiedIndex = idx;
      this.requestUpdate();
      setTimeout(() => {
        this.copiedIndex = null;
        this.requestUpdate();
      }, 3000);
    } catch {}
  }

  _selectDataUrl(e: Event) {
    const el = e.currentTarget as HTMLElement;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  render() {
    return html`
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Convert assets to base64 format</h1>
          <p class="text-lg text-slate-600 dark:text-slate-400">
            Convert images, audio files, and other creative assets into Base64 strings for HTML5 playable ads, single-file demos, and embedded creative prototypes.
          </p>
          <p class="text-slate-600 dark:text-slate-400 mt-3">
            This encoder is useful when you want to inline small assets directly into markup or scripts to simplify packaging and reduce external file dependencies during playable ad production.
          </p>
        </div>

        <div
          class="border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            this.dragActive
              ? "border-primary bg-primary/5"
              : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }"
          @dragover=${this._onDragOver}
          @dragleave=${this._onDragLeave}
          @drop=${this._onDrop}
        >
          <p class="text-slate-600 dark:text-slate-400 mb-4">Drop your files here or</p>
          <label class="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors font-medium">
            Select files
            <input type="file" multiple @change=${this._onFileChange} class="hidden" />
          </label>
        </div>

        ${this.processing
          ? html`
              <div class="mt-8">
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style="width: ${this.progress}%;"
                  ></div>
                </div>
                <div class="mt-2 text-sm text-slate-600 dark:text-slate-400 text-center">
                  Processing... ${this.progress}%
                </div>
              </div>
            `
          : null}
        ${this.results.length > 0
          ? html`
              <div class="mt-8 space-y-4">
                ${this.results.map(
                  (r, idx) => html`
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div class="flex-1 min-w-0">
                        <span class="font-medium text-slate-900 dark:text-white truncate block" title="${r.name}">${r.name}</span>
                        <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          ${(r.originalSize / 1024).toFixed(2)} KB →
                          ${(r.base64Size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      ${r.dataUrl.length > 2048
                        ? html`<span class="font-mono text-xs text-slate-500 dark:text-slate-400 italic"
                            >content too long to display
                            <a
                              href="#"
                              @click=${(e: Event) =>
                                this._downloadDataUrl(e, r.dataUrl, r.name)}
                              class="text-primary hover:underline ml-1"
                              >Open in new tab</a
                            ></span
                          >`
                        : html`<span
                            class="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                            tabindex="0"
                            @click=${(e: Event) => this._selectDataUrl(e)}
                            @focus=${(e: Event) => this._selectDataUrl(e)}
                            >${r.dataUrl}</span
                          >`}
                      <button
                        class="px-4 py-2 rounded text-sm font-medium transition-colors min-w-[80px] ${
                          this.copiedIndex === idx
                            ? "text-green-600 border border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }"
                        @click=${() => this._copyToClipboard(r.dataUrl, idx)}
                      >
                        ${this.copiedIndex === idx ? "Copied" : "Copy"}
                      </button>
                    </div>
                  `
                )}
              </div>
            `
          : null}
      </div>
    `;
  }
}
