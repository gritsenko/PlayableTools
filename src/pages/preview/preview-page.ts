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
      <div class="preview-container">
        <div style="display: flex; align-items: center; gap: 1em;">
          <h2 style="margin: 0;">Playable Ad Preview</h2>
          ${this.isEncoded && this.decodedUrl
            ? html`
                <button
                  @click=${this.handleShare.bind(this)}
                  style="background: none; border: none; color: #1976d2; cursor: pointer; padding: 0; font: inherit; display: flex; align-items: center; gap: 0.5em; text-decoration: underline;"
                >
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
                  style="background: #ff6b6b; color: white; border: none; padding: 0.5em 1em; border-radius: 4px; cursor: pointer;"
                >
                  Load New Content
                </button>
              `
            : null}
        </div>
        
        ${showInputSections
          ? html`
              <div style="margin: 1em 0; color: #555;">
                <p>
                  This page lets you preview playable ads from either a public GitHub repository or by uploading an HTML file directly.<br />
                </p>
                <p>
                  <b>Option 1:</b> Paste a GitHub URL below to preview and create shareable links.<br />
                  <b>Option 2:</b> Upload an HTML file from your computer for immediate preview.
                </p>
                <details style="margin-top: 1em;">
                  <summary style="cursor: pointer; font-weight: bold; color: #1976d2;">Show sample GitHub URL</summary>
                  <div style="margin: 0.5em 0 0 1em;">
                    <div style="display: flex; align-items: center; gap: 0.5em;">
                      <code style="background: #f5f5f5; padding: 0.2em 0.5em; border-radius: 4px; font-size: 0.95em;">https://github.com/gritsenko/playables/blob/main/Customize3d/index.html</code>
                      <button
                        style="background: #1976d2; color: #fff; border: none; border-radius: 4px; padding: 0.2em 0.8em; cursor: pointer; font-size: 0.95em;"
                        @click=${() => {
                          this.decodedUrl = "https://github.com/gritsenko/playables/blob/main/Customize3d/index.html";
                          this.handleLoad();
                        }}
                      >
                        Try
                      </button>
                    </div>
                  </div>
                </details>
              </div>

              <!-- File Upload Section -->
              <div class="upload-section" style="margin-bottom: 1.5em; padding: 1em; border: 2px dashed #ddd; border-radius: 8px; background: #f9f9f9;">
                <h3 style="margin-top: 0; margin-bottom: 1em; color: #1976d2;">
                  📁 Upload HTML File
                </h3>
                
                <div style="display: flex; align-items: center; gap: 1em; margin-bottom: 1em;">
                  <input 
                    type="file" 
                    accept=".html,.htm,.zip" 
                    @change="${this.handleFileUpload}"
                    style="padding: 0.5em;"
                    ?disabled="${this.isUploading}"
                  />
                  
                  ${this.isUploading ? html`
                    <div style="display: flex; align-items: center; gap: 0.5em; color: #1976d2;">
                      <div style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid #1976d2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      <span>Uploading...</span>
                    </div>
                  ` : ''}
                </div>
                
                ${this.uploadError ? html`
                  <div style="color: red; margin-bottom: 1em; padding: 0.5em; background: #ffe6e6; border-radius: 4px;">
                    ${this.uploadError}
                  </div>
                ` : ''}
                
                <div style="font-size: 0.9em; color: #666;">
                  <p style="margin: 0;">
                    • Supported formats: .html, .htm, .zip (ZIP archives containing playable assets)<br />
                    • Maximum file size: 10MB<br />
                    • Files are processed locally and not stored on our servers
                  </p>
                </div>
              </div>

              <!-- GitHub URL Section -->
              <div class="github-section" style="margin-bottom: 1.5em; padding: 1em; border: 2px dashed #ddd; border-radius: 8px; background: #f0f8ff;">
                <h3 style="margin-top: 0; margin-bottom: 1em; color: #1976d2;">
                  🔗 Load from GitHub
                </h3>
                
                <div class="preview-controls">
                  <input
                    type="text"
                    placeholder="Paste GitHub playable URL..."
                    .value=${this.decodedUrl}
                    @input=${this.handleInput.bind(this)}
                    style="width: 400px; padding: 0.5em;"
                  />
                  <button @click=${this.handleLoad.bind(this)} style="margin-left: 0.5em; padding: 0.5em 1em;">Load</button>
                </div>
              </div>

              ${this.recentUrls.length > 0
                ? html`
                    <div style="margin-bottom: 1.5em;">
                      <h3 style="margin-bottom: 0.5em; font-size: 1.1em; color: #1976d2;">Recent GitHub URLs</h3>
                      <div>
                        ${this.recentUrls.map(
                          url => html`
                            <div style="margin-bottom: 0.5em;">
                              <button
                                style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; color: #222; border: none; border-radius: 4px; padding: 0.4em 0.8em; font-size: 0.95em; cursor: pointer; text-align: left;"
                                @click=${() => {
                                  this.decodedUrl = url;
                                  this.handleLoad();
                                }}
                              >
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${url}</span>
                                <span style="margin-left: 1em; color: #1976d2; font-weight: bold;">Preview</span>
                              </button>
                            </div>
                          `
                        )}
                      </div>
                    </div>
                  `
                : null}
            `
          : null}
          
        <div
          class="preview-frame"
          style="position: relative; display: flex; justify-content: center; align-items: center; min-height: 60vh;"
        >
          ${this.isEncoded && this.decodedUrl
            ? html`<playable-previewer
                githubUrl="${this.decodedUrl}"
              ></playable-previewer>`
            : hasUploadedContent || this.uploadedFileName
            ? html`<playable-previewer></playable-previewer>`
            : null}

          
        </div>

        
        <!-- CSS Animation for spinner -->
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }
}
