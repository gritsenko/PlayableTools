import { ComponentBase, customElement, html, route, inject } from "fw";
import { ImbaPackerService } from "../services/ImbaPackerService";

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
@route("/imba-packer", {
  title: "Imba Packer",
  description: "Optimize and compress HTML files for playable ads.",
})
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
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Imba Packer (Experimental)</h1>
          <div class="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Imba Packer optimizes and compresses HTML files for playable ads and similar use cases.
            <ul class="list-disc list-inside ml-4 mt-4 mb-4 space-y-2 text-base">
              <li>Upload or drop an HTML file below.</li>
              <li>The file will be processed and minified to reduce its size.</li>
              <li>Download the packed HTML and view compression statistics.</li>
              <li>All original functionality is preserved as much as possible.</li>
            </ul>
            <span class="text-red-600 dark:text-red-400 font-medium block mt-4 flex items-center gap-2">
              <span class="material-icons-outlined text-sm">warning</span>
              Experimental: results may vary depending on input file.
            </span>
          </div>
        </div>
        
        ${!this.loadedFile
          ? html`
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
                <p class="text-slate-600 dark:text-slate-400 mb-4">Drop your file here or</p>
                <label class="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
                  Select file
                  <input
                    type="file"
                    @change=${this._onFileChange}
                    class="hidden"
                  />
                </label>
              </div>
            `
          : html`
              <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div class="flex items-center gap-3">
                  <span class="material-icons-outlined text-slate-400">description</span>
                  <div>
                    <div class="font-medium text-slate-900 dark:text-white">${this.loadedFile.name}</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">${(this.loadedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                <button 
                  @click=${this._resetFile}
                  class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
              
              ${this.packedFileName && this.packedHtml && this.packedSize && this.compressionInfo ? html`
                <div class="mt-6 bg-green-50 dark:bg-green-900/10 p-6 rounded-lg border border-green-200 dark:border-green-900/30">
                  <h3 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                    <span class="material-icons-outlined">check_circle</span>
                    Compression Complete
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded border border-green-100 dark:border-green-900/30">
                      <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Original Size</div>
                      <div class="text-xl font-mono text-slate-900 dark:text-white">${(this.loadedFile.size / 1024).toFixed(2)} KB</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded border border-green-100 dark:border-green-900/30">
                      <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Packed Size</div>
                      <div class="text-xl font-mono text-green-600 dark:text-green-400 font-bold">${(this.packedSize / 1024).toFixed(2)} KB</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded border border-green-100 dark:border-green-900/30">
                      <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Size Reduction</div>
                      <div class="text-xl font-mono text-slate-900 dark:text-white">${(this.compressionInfo.diff / 1024).toFixed(2)} KB</div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded border border-green-100 dark:border-green-900/30">
                      <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">Compression Rate</div>
                      <div class="text-xl font-mono text-green-600 dark:text-green-400 font-bold">${this.compressionInfo.percent.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div class="flex justify-end">
                    <button 
                      @click=${this._downloadPacked}
                      class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-600/20"
                    >
                      <span class="material-icons-outlined mr-2">download</span>
                      Download Packed File
                    </button>
                  </div>
                </div>
              ` : html`
                <div class="mt-8 flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <div class="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4"></div>
                  <p>Processing and compressing file...</p>
                </div>
              `}
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
