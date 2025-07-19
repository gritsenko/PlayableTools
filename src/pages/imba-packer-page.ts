import { ComponentBase, customElement, html, route, inject } from "fw";
import { ImbaPackerService } from "../services/ImbaPackerService";
import "./imba-packer-page.ts.css";

/**
 * Imba Packer is a tool designed to optimize and compress HTML files for playable ads and similar use cases.
 *
 * Principle of operation:
 * - The user uploads or drops an HTML file.
 * - The file is processed by the ImbaPackerService, which applies various packing and minification techniques to reduce file size.
 * - The packed HTML is generated and made available for download, along with statistics about the compression achieved.
 * - The tool is experimental and aims to maximize compression while preserving the original file's functionality.
 */

@customElement("imba-packer-page")
@route("/imba-packer")
export class ImbaPackerPage extends ComponentBase {
  @inject(ImbaPackerService) imbaPackerService!: ImbaPackerService;
  dragActive = false;
  loadedFile: File | null = null;
  packedFileName: string | null = null;
  packedHtml: string | null = null;
  packedSize: number | null = null;
  compressionInfo: { diff: number; percent: number } | null = null;

  render() {
    return html`
      <div class="imba-packer-page">
        <div style="margin-bottom:1.5rem">
          <strong>Imba Packer (Experimental)</strong><br />
          <div style="margin: 0.5em 0 1em 0; font-size: 0.97em; color: #555;">
            Imba Packer optimizes and compresses HTML files for playable ads and similar use cases.<br />
            <ul style="margin:0.5em 0 0.5em 1.2em; padding:0;">
              <li>Upload or drop an HTML file below.</li>
              <li>The file will be processed and minified to reduce its size.</li>
              <li>Download the packed HTML and view compression statistics.</li>
              <li>All original functionality is preserved as much as possible.</li>
            </ul>
            <span style="color:#a00">Experimental: results may vary depending on input file.</span>
          </div>
          <small>
            Drop your file below or select it manually.
          </small>
        </div>
        ${!this.loadedFile
          ? html`
              <div
                class="dropzone ${this.dragActive ? "dragover" : ""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your file here or</p>
                <label class="file-select-button">
                  Select file
                  <input
                    type="file"
                    @change=${this._onFileChange}
                  />
                </label>
              </div>
            `
          : html`
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size / 1024).toFixed(2)} KB)
                <button style="margin-left:1em" @click=${this._resetFile}>Cancel</button>
              </div>
              ${this.packedFileName && this.packedHtml && this.packedSize && this.compressionInfo ? html`
                <div class="packed-info" style="margin-top:1em;">
                  <div><strong>Packed file:</strong> ${this.packedFileName}</div>
                  <div><strong>Original size:</strong> ${(this.loadedFile.size / 1024).toFixed(2)} KB</div>
                  <div><strong>Packed size:</strong> ${(this.packedSize / 1024).toFixed(2)} KB</div>
                  <div><strong>Difference:</strong> ${(this.compressionInfo.diff / 1024).toFixed(2)} KB</div>
                  <div><strong>Compression rate:</strong> ${this.compressionInfo.percent.toFixed(1)}%</div>
                  <button style="margin-top:0.7em" @click=${this._downloadPacked}>Download packed file</button>
                </div>
              ` : html`<div style="margin-top:1em;">Packing...</div>`}
            `}
      </div>
    `;
  }

  _onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragActive = true;
    this.requestUpdate();
  }

  _onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
  }

  _onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this._processFile(files[0]);
    }
  }

  _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this._processFile(file);
    }
  }


  async _processFile(file: File) {
    if (!file.name.match(/\.html?$/i)) {
      alert('Please select a valid .html file.');
      return;
    }
    this.loadedFile = file;
    this.packedFileName = null;
    this.packedHtml = null;
    this.packedSize = null;
    this.compressionInfo = null;
    this.requestUpdate();
    // Call service to pack and generate output
    try {
      const { fileName, html } = await this.imbaPackerService.pack(file);
      this.packedFileName = fileName;
      this.packedHtml = html;
      this.packedSize = new Blob([html], { type: 'text/html' }).size;
      const diff = this.loadedFile.size - this.packedSize;
      const percent = (diff / this.loadedFile.size) * 100;
      this.compressionInfo = { diff, percent };
      this.requestUpdate();
    } catch (err) {
      alert('Packing failed: ' + (err instanceof Error ? err.message : err));
    }
    const event = new CustomEvent("file-selected", { detail: file });
    this.dispatchEvent(event);
  }
  _downloadPacked = () => {
    if (!this.packedHtml || !this.packedFileName) return;
    const blob = new Blob([this.packedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.packedFileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  _resetFile() {
    this.loadedFile = null;
    this.packedFileName = null;
    this.packedHtml = null;
    this.packedSize = null;
    this.compressionInfo = null;
    this.requestUpdate();
  }
}
