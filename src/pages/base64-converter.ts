import { ComponentBase, customElement, html, route, inject } from "fw";
import { Base64ConverterService } from "../services/Base64ConverterService";
import type { Base64FileModel } from "../services/Base64ConverterService";
import "./Base64-converter.ts.css";

@customElement("base64-page")
@route("/base64", {
  title: "Base64 Converter",
  description: "A simple tool to convert text to Base64 and vice versa.",
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
      <h1>Convert assets to base64 format</h1>
      <p>
        This app provides a simple tool to convert media files to Base64 to use
        in playable ads.
      </p>

      <div
        class="dropzone ${this.dragActive ? "dragover" : ""}"
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
      >
        <p>Drop your files here or</p>
        <label class="file-select-button">
          Select files
          <input type="file" multiple @change=${this._onFileChange} />
        </label>
      </div>

      ${this.processing
        ? html`
            <div class="progress-container">
              <div class="progress-bar-background">
                <div
                  class="progress-bar-fill"
                  style="width: ${this.progress}%;"
                ></div>
              </div>
              <div style="margin-top:0.5em; font-size:0.95em;">
                Processing... ${this.progress}%
              </div>
            </div>
          `
        : null}
      ${this.results.length > 0
        ? html`
            <div class="file-list">
              ${this.results.map(
                (r, idx) => html`
                  <div class="file-row">
                    <div class="file-name">
                      <span>${r.name}</span>
                      <div class="file-size">
                        ${(r.originalSize / 1024).toFixed(2)} KB →
                        ${(r.base64Size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    ${r.dataUrl.length > 2048
                      ? html`<span class="data-url long-content"
                          >content too long to display
                          <a
                            href="#"
                            @click=${(e: Event) =>
                              this._downloadDataUrl(e, r.dataUrl, r.name)}
                            >Open in new tab</a
                          ></span
                        >`
                      : html`<span
                          class="data-url"
                          tabindex="0"
                          @click=${(e: Event) => this._selectDataUrl(e)}
                          @focus=${(e: Event) => this._selectDataUrl(e)}
                          >${r.dataUrl}</span
                        >`}
                    <button
                      class="copy-btn${this.copiedIndex === idx
                        ? " copied"
                        : ""}"
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
    `;
  }
}
