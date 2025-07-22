import { ComponentBase, customElement, html, route, inject, fromQuery } from "fw";
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

  connectedCallback() {
    super.connectedCallback();
    // Try to get encoded url from query param (supports both hash and search)
    let encoded: string | null | undefined = undefined;
    // 1. Check hash-based query param
    const hash = window.location.hash;
    if (hash) {
      const queryIndex = hash.indexOf('?');
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
    window.history.replaceState({}, "", `${window.location.pathname}#preview?${params.toString()}`);
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="preview-container">
        <h2>Playable Ad Preview</h2>
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
            : html`
                <div>
                  <label>Shareable Link:</label>
                  <input type="text" readonly .value=${window.location.href} style="width: 400px;" />
                </div>
                <div>
                  <label>Decoded URL:</label>
                  <div style="word-break: break-all;">${this.decodedUrl}</div>
                </div>
              `}
        </div>
        <div class="preview-frame">
          ${this.isEncoded && this.decodedUrl
            ? html`<playable-previewer githubUrl="${this.decodedUrl}"></playable-previewer>`
            : null}
        </div>
      </div>
    `;
  }
}
