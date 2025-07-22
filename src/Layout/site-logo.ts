import { html, customElement, ComponentBase, state } from "fw";
import { UrlUtils } from "../utils/url-utils";
import { VersionService } from "../services/VersionService";
import "./site-logo.ts.css";

@customElement("site-logo")
export class SiteLogo extends ComponentBase {
  private versionService = new VersionService();

  @state()
  private currentVersion?: string;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadVersion();
  }

  private async loadVersion(): Promise<void> {
    try {
      await this.versionService.initialize();
      const version = this.versionService.getCurrentVersion();
      this.currentVersion = version?.version || '';
    } catch (error) {
      console.warn('Failed to load version in site logo:', error);
      this.currentVersion = '';
    }
  }

  render() {
    return html`
      <a href="${UrlUtils.getBaseDir()}" class="site-logo-link">
        <img
          src="${UrlUtils.buildFetchUrl("", "small-logo.jpg")}"
          alt="Logo"
          class="site-logo-img"
        />
        <span class="site-logo-title">
          <div class="site-logo-subheader">Gritsenko</div>
          Playable Ads Tools
          ${this.currentVersion ? html`<div class="site-logo-version">v${this.currentVersion}</div>` : ''}
        </span>
      </a>
    `;
  }
}
