import { html, customElement, ComponentBase } from "fw";
import { UrlUtils } from "../utils/url-utils";
import "./site-logo.ts.css";

@customElement("site-logo")
export class SiteLogo extends ComponentBase {
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
        </span>
      </a>
    `;
  }
}
