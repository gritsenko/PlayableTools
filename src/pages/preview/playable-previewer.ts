import { ComponentBase, customElement, html, property, inject } from "fw";
import { PreviewService } from "../../services/PreviewService";
import "../../assets/pako_inflate.min.js";

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @property({ type: String }) githubUrl = "";
  @inject(PreviewService) previewService!: PreviewService;

  pageContent: string = "";
  loading: boolean = false;
  error: string = "";

  async updated(changedProps: Map<string, any>) {
    if (changedProps.has("githubUrl") && this.githubUrl) {
      this.loading = true;
      this.error = "";
      this.pageContent = "";
      const rawUrl = this.previewService.githubToRawUrl(this.githubUrl);
      if (!rawUrl) {
        this.error = "Invalid GitHub URL";
        this.loading = false;
        this.requestUpdate();
        return;
      }
      try {
        this.pageContent = await this.previewService.fetchRawContent(rawUrl);
      } catch (err: any) {
        this.error = err.message || String(err);
      }
      this.loading = false;
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div class="phone-simulator">
        <div class="phone-frame">
          ${this.loading
            ? html`<div>Loading...</div>`
            : this.error
            ? html`<div style="color: red;">${this.error}</div>`
            : html`<iframe
                srcdoc="${this.pageContent}"
                class="playable-iframe"
                frameborder="0"
                allowfullscreen
              ></iframe>`}
        </div>
      </div>
    `;
  }
}
