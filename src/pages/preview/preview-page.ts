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
@route("/preview")
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
  }

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

  render() {
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
        </div>
        ${!this.isEncoded
          ? html`
              <div style="margin: 1em 0; color: #555;">
                <p>
                  This page lets you share playable ads from a public GitHub repository and preview them on different devices and orientations.<br />
                </p>
                <p>
                  Paste the URL of your playable ad hosted on GitHub below, then click <b>Load</b> to preview and share the link. Use the <b>Share</b> button to copy a direct preview link.
                </p>
                <details style="margin-top: 1em;">
                  <summary style="cursor: pointer; font-weight: bold; color: #1976d2;">Show sample playable URL</summary>
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
            `
          : null}
        <div class="preview-controls" style="margin-bottom: 1.5em;">
          ${!this.isEncoded
            ? html`
                <input
                  type="text"
                  placeholder="Paste GitHub playable URL..."
                  .value=${this.decodedUrl}
                  @input=${this.handleInput.bind(this)}
                  style="width: 400px;"
                />
                <button @click=${this.handleLoad.bind(this)} style="margin-left: 0.5em;">Load</button>
              `
            : null}
        </div>
        ${!this.isEncoded && this.recentUrls.length > 0
          ? html`
              <div style="margin-top: 0.5em;">
                <h3 style="margin-bottom: 0.5em; font-size: 1.1em; color: #1976d2;">Recent Playable URLs</h3>
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
        <div
          class="preview-frame"
          style="display: flex; justify-content: center; align-items: center; min-height: 60vh;"
        >
          ${this.isEncoded && this.decodedUrl
            ? html`<playable-previewer
                githubUrl="${this.decodedUrl}"
              ></playable-previewer>`
            : null}
        </div>
      </div>
    `;
  }
}
