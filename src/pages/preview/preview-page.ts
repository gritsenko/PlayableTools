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
  @inject(PreviewService) previewService!: PreviewService;

  urlInput: string = "";
  decodedUrl: string = "";
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
    }
  }

  handleInput(e: Event) {
    this.decodedUrl = (e.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  handleLoad() {
    if (!this.decodedUrl) return;
    this._encodedUrlInternal = this.previewService.encodeUrl(this.decodedUrl);
    this.isEncoded = true;
    // Update hash-based route with query param
    const params = new URLSearchParams();
    params.set("url", this._encodedUrlInternal);
    window.history.replaceState(
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
        <div class="preview-controls">
          ${!this.isEncoded
            ? html`
                <input
                  type="text"
                  placeholder="Paste GitHub playable URL..."
                  .value=${this.decodedUrl}
                  @input=${this.handleInput.bind(this)}
                  style="width: 400px;"
                />
                <button @click=${this.handleLoad.bind(this)}>Load</button>
              `
            : null}
        </div>
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
