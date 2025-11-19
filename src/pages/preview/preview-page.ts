import {
  ComponentBase,
  customElement,
  html,
  route,
  inject,
  fromQuery,
} from "fw";
import { PreviewService } from "../../services/PreviewService";

@customElement("preview-page")
@route("/preview", {
  title: "Playable Ad Preview | PlayableTools",
  description: "Preview and share playable ads from GitHub on different devices and orientations.",
})
export class PreviewPage extends ComponentBase {
  disconnectedCallback() {
    super.disconnectedCallback?.();
    // On page unload, reload recentUrls for next mount
    const stored = localStorage.getItem("preview-recent-urls");
    if (stored) {
      try {
        this.recentUrls = JSON.parse(stored);
      } catch {
        this.recentUrls = [];
      }
    }
    window.removeEventListener("popstate", this.handlePopState);
    // playable-screen-lock handled inside previewer
  }
  @inject(PreviewService) previewService!: PreviewService;

  urlInput: string = "";
  decodedUrl: string = "";
  recentUrls: string[] = [];
  @fromQuery("url") get encodedUrl(): string | undefined {
    return this._encodedUrlFromQuery;
  }
  private _encodedUrlFromQuery?: string;
  private _encodedUrlInternal?: string;
  isEncoded: boolean = false;
  linkCopied: boolean = false;
  copyTimeout?: number;
  uploadedFileName: string = "";
  uploadError: string = "";
  isUploading: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    // Try to get encoded url from query param (supports both hash and search)
    let encoded: string | null | undefined = undefined;
    // 1. Check hash-based query param
    const hash = window.location.hash;
    if (hash) {
      const queryIndex = hash.indexOf("?");
      if (queryIndex !== -1) {
        const query = hash.substring(queryIndex + 1);
        const params = new URLSearchParams(query);
        encoded = params.get("url");
      }
    }
    // 2. Fallback to normal query param if not found in hash
    if (!encoded) {
      const params = new URLSearchParams(window.location.search);
      encoded = params.get("url");
    }
    // 3. Fallback to fromQuery decorator if still not found
    if (!encoded && this._encodedUrlFromQuery) {
      encoded = this._encodedUrlFromQuery;
    }
    if (encoded) {
      const decoded = this.previewService.decodeUrl(encoded);
      this.decodedUrl = decoded;
      this._encodedUrlInternal = encoded;
      this.isEncoded = true;
      this.requestUpdate();
    } else {
      // Load recent URLs from localStorage
      const stored = localStorage.getItem("preview-recent-urls");
      if (stored) {
        try {
          this.recentUrls = JSON.parse(stored);
        } catch {
          this.recentUrls = [];
        }
      }
      // Clear preview state if no query param
      this.isEncoded = false;
      this.decodedUrl = "";
      this._encodedUrlInternal = undefined;
    }
    // Listen for browser navigation (back/forward)
    window.addEventListener("popstate", this.handlePopState);

    // playable-screen-lock is handled inside the previewer component
  }

  // Lock UI moved into PlayablePreviewer component

  handlePopState = () => {
    // Re-run connectedCallback logic to update preview on navigation
    let encoded: string | null | undefined = undefined;
    const hash = window.location.hash;
    if (hash) {
      const queryIndex = hash.indexOf("?");
      if (queryIndex !== -1) {
        const query = hash.substring(queryIndex + 1);
        const params = new URLSearchParams(query);
        encoded = params.get("url");
      }
    }
    if (!encoded) {
      const params = new URLSearchParams(window.location.search);
      encoded = params.get("url");
    }
    if (!encoded && this._encodedUrlFromQuery) {
      encoded = this._encodedUrlFromQuery;
    }
    if (encoded) {
      const decoded = this.previewService.decodeUrl(encoded);
      this.decodedUrl = decoded;
      this._encodedUrlInternal = encoded;
      this.isEncoded = true;
    } else {
      this.isEncoded = false;
      this.decodedUrl = "";
      this._encodedUrlInternal = undefined;
    }
    this.requestUpdate();
  }

  handleInput(e: Event) {
    this.decodedUrl = (e.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  handleLoad() {
    if (!this.decodedUrl) return;
    this._encodedUrlInternal = this.previewService.encodeUrl(this.decodedUrl);
    this.isEncoded = true;
    // Save to localStorage
    let urls: string[] = [];
    const stored = localStorage.getItem("preview-recent-urls");
    if (stored) {
      try {
        urls = JSON.parse(stored);
      } catch {
        urls = [];
      }
    }
    // Add new url to front, remove duplicates, keep max 10
    urls = [this.decodedUrl, ...urls.filter(u => u !== this.decodedUrl)].slice(0, 10);
    localStorage.setItem("preview-recent-urls", JSON.stringify(urls));
    // Update hash-based route with query param (push to history)
    const params = new URLSearchParams();
    params.set("url", this._encodedUrlInternal);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}#preview?${params.toString()}`
    );
    this.requestUpdate();
  }

  async handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.linkCopied = true;
      this.requestUpdate();
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = window.setTimeout(() => {
        this.linkCopied = false;
        this.requestUpdate();
      }, 3000);
    } catch (e) {
      // fallback: do nothing
    }
  }

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.isUploading = true;
    this.uploadError = "";
    this.uploadedFileName = "";
    
    // Clear any existing GitHub URL state when uploading
    this.isEncoded = false;
    this.decodedUrl = "";
    this._encodedUrlInternal = undefined;
    
    // Clear URL from browser history
    window.history.pushState({}, "", window.location.pathname + "#preview");
    
    this.requestUpdate();

    try {
      // Route by extension: ZIP archives are handled by handleZipUpload
      if (file.name.toLowerCase().endsWith('.zip')) {
        await this.previewService.handleZipUpload(file);
      } else {
        await this.previewService.handleFileUpload(file);
      }
      this.uploadedFileName = file.name;
    } catch (err: any) {
      this.uploadError = err.message || String(err);
    }

    this.isUploading = false;
    this.requestUpdate();
    
    // Clear the input so the same file can be selected again
    input.value = '';
  }

  clearUploadedContent() {
    this.previewService.clearUploadedContent();
    this.uploadedFileName = "";
    this.uploadError = "";
    this.requestUpdate();
  }

  // UI handler: toggle lock state and inform PreviewService
  toggleScreenLock() {
  // Lock UI moved into PlayablePreviewer component
  }

  render() {
    const hasUploadedContent = this.previewService.getUploadedFileInfo().hasContent;
    const hasContent = this.isEncoded || hasUploadedContent || this.uploadedFileName;
    const showInputSections = !hasContent;

    return html`
      <div class="max-w-7xl mx-auto">
        <header class="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Playable Ad Preview</h1>
          
          <div class="flex items-center gap-4">
            ${this.isEncoded && this.decodedUrl
              ? html`
                  <button
                    @click=${this.handleShare.bind(this)}
                    class="text-primary hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <span class="material-icons-outlined">share</span>
                    ${this.linkCopied ? "Link copied" : "Share"}
                  </button>
                `
              : null}
            
            ${hasContent
              ? html`
                  <button
                    @click=${() => {
                      // Clear all content and return to input mode
                      this.previewService.clearUploadedContent();
                      this.uploadedFileName = "";
                      this.uploadError = "";
                      this.isEncoded = false;
                      this.decodedUrl = "";
                      this._encodedUrlInternal = undefined;
                      window.history.pushState({}, "", window.location.pathname + "#preview");
                      this.requestUpdate();
                    }}
                    class="px-6 py-2.5 rounded bg-red-500 text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                  >
                    Load New Content
                  </button>
                `
              : null}
          </div>
        </header>
        
        ${showInputSections
          ? html`
              <div class="space-y-8">
                <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p class="text-slate-600 dark:text-slate-400 mb-4">
                    This page lets you preview playable ads from either a public GitHub repository or by uploading an HTML file directly.
                  </p>
                  
                  <details class="group">
                    <summary class="cursor-pointer font-medium text-primary hover:text-blue-700 list-none flex items-center gap-2">
                      <span class="material-icons-outlined group-open:rotate-90 transition-transform">chevron_right</span>
                      Show sample GitHub URL
                    </summary>
                    <div class="mt-4 ml-6 flex items-center gap-4">
                      <code class="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-sm font-mono text-slate-700 dark:text-slate-300">https://github.com/gritsenko/playables/blob/main/Customize3d/index.html</code>
                      <button
                        class="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                        @click=${() => {
                          this.decodedUrl = "https://github.com/gritsenko/playables/blob/main/Customize3d/index.html";
                          this.handleLoad();
                        }}
                      >
                        Try
                      </button>
                    </div>
                  </details>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- File Upload Section -->
                  <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span class="material-icons-outlined">upload_file</span>
                      Upload HTML File
                    </h3>
                    
                    <div class="mb-4">
                      <label class="block w-full cursor-pointer">
                        <input 
                          type="file" 
                          accept=".html,.htm,.zip" 
                          @change="${this.handleFileUpload}"
                          class="block w-full text-sm text-slate-500 dark:text-slate-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary file:text-white
                            hover:file:bg-blue-600
                            cursor-pointer"
                          ?disabled="${this.isUploading}"
                        />
                      </label>
                      
                      ${this.isUploading ? html`
                        <div class="mt-2 flex items-center gap-2 text-primary">
                          <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                          <span class="text-sm">Uploading...</span>
                        </div>
                      ` : ''}
                    </div>
                    
                    ${this.uploadError ? html`
                      <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
                        ${this.uploadError}
                      </div>
                    ` : ''}
                    
                    <div class="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p>• Supported formats: .html, .htm, .zip</p>
                      <p>• Maximum file size: 10MB</p>
                      <p>• Files are processed locally</p>
                    </div>
                  </div>

                  <!-- GitHub URL Section -->
                  <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span class="material-icons-outlined">link</span>
                      Load from GitHub
                    </h3>
                    
                    <div class="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste GitHub playable URL..."
                        .value=${this.decodedUrl}
                        @input=${this.handleInput.bind(this)}
                        class="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button 
                        @click=${this.handleLoad.bind(this)} 
                        class="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-blue-600 transition-colors"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                </div>

                ${this.recentUrls.length > 0
                  ? html`
                      <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent GitHub URLs</h3>
                        <div class="space-y-2">
                          ${this.recentUrls.map(
                            url => html`
                              <button
                                class="w-full flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group"
                                @click=${() => {
                                  this.decodedUrl = url;
                                  this.handleLoad();
                                }}
                              >
                                <span class="text-sm text-slate-600 dark:text-slate-300 truncate flex-1 mr-4">${url}</span>
                                <span class="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Preview</span>
                              </button>
                            `
                          )}
                        </div>
                      </div>
                    `
                  : null}
              </div>
            `
          : null}
          
        <div class="mt-6">
          ${this.isEncoded && this.decodedUrl
            ? html`<playable-previewer
                githubUrl="${this.decodedUrl}"
              ></playable-previewer>`
            : hasUploadedContent || this.uploadedFileName
            ? html`<playable-previewer></playable-previewer>`
            : null}
        </div>
      </div>
    `;
  }
}
