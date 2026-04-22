import { html, customElement, ComponentBase, state } from "fw";
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
      <a href="/" class="flex items-center gap-4 text-decoration-none">
        <svg width="40" height="40" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer circle -->
          <circle cx="256" cy="256" r="230" fill="none" stroke="#3B82F6" stroke-width="42"/>
          
          <!-- Gamepad icon rotated -15 degrees and scaled inside circle -->
          <g transform="translate(256, 256) rotate(-15) scale(0.6) translate(-256, -286)">
            <path d="M447.303,128.681c-0.427-1.259-0.875-3.264-1.408-5.525c-3.52-14.315-6.827-27.84-19.904-32.832l-62.08-23.616
              c-12.032-4.565-25.515-2.923-36.139,4.48l-3.84,3.435c-3.115,3.563-7.339,8.021-10.347,10.88H199.197
              c-2.539-2.667-5.931-6.592-8.768-10.112l-4.437-4.16c-10.624-7.424-24.149-9.131-36.117-4.523L87.73,90.324
              c-13.013,4.949-16.277,18.325-19.755,32.512c-0.533,2.155-0.981,4.117-0.811,4.117c0,0,0.021,0,0.043-0.021
              C46.045,168.66-54.606,379.902,39.623,442.26c13.483,8.917,31.424,7.509,43.691-3.456l73.856-66.219
              c6.507-5.845,14.784-9.067,23.275-9.067h152.853c8.491,0,16.747,3.221,23.275,9.067l73.856,66.219
              c6.955,6.229,15.616,9.408,24.277,9.408c6.955,0,13.888-2.069,19.883-6.293C557.746,383.572,482.823,202.494,447.303,128.681z
              M341.469,149.502c11.776,0,21.333,9.557,21.333,21.333c0,11.776-9.557,21.333-21.333,21.333s-21.333-9.557-21.333-21.333
              S329.693,149.502,341.469,149.502z M213.469,256.169h-21.333v21.333c0,11.776-9.536,21.333-21.333,21.333
              s-21.333-9.557-21.333-21.333v-21.333h-21.333c-11.797,0-21.333-9.557-21.333-21.333s9.536-21.333,21.333-21.333h21.333V192.17
              c0-11.776,9.536-21.333,21.333-21.333s21.333,9.557,21.333,21.333v21.333h21.333c11.797,0,21.333,9.557,21.333,21.333
              S225.266,256.169,213.469,256.169z M298.802,234.836c-11.776,0-21.333-9.557-21.333-21.333s9.557-21.333,21.333-21.333
              s21.333,9.557,21.333,21.333S310.578,234.836,298.802,234.836z M341.469,277.502c-11.776,0-21.333-9.557-21.333-21.333
              s9.557-21.333,21.333-21.333s21.333,9.557,21.333,21.333S353.245,277.502,341.469,277.502z M384.135,234.836
              c-11.776,0-21.333-9.557-21.333-21.333s9.557-21.333,21.333-21.333s21.333,9.557,21.333,21.333S395.911,234.836,384.135,234.836z"
              fill="#3B82F6"/>
          </g>
        </svg>
        <div>
          <p class="text-base font-semibold text-slate-900 dark:text-white m-0">Playable Ads Tools</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 m-0">v${this.currentVersion || 'dev'}</p>
        </div>
      </a>
    `;
  }
}
