import { html, customElement, ComponentBase, state } from "fw";
import { UrlUtils } from "../utils/url-utils";
import { VersionService } from "../services/VersionService";

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
      <a href="${UrlUtils.getBaseDir()}" class="flex items-center gap-4 text-decoration-none">
        <img
          src="${UrlUtils.buildFetchUrl("", "small-logo.jpg")}"
          alt="Logo"
          class="w-10 h-10 rounded-full"
        />
        <div>
          <h1 class="text-base font-semibold text-slate-900 dark:text-white m-0">Playable Ads Tools</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 m-0">v${this.currentVersion || 'dev'}</p>
        </div>
      </a>
    `;
  }
}
