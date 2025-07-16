import { ComponentBase, customElement, html, route as route } from "fw";

@customElement("publish-page")
@route("/publish")
export class HomePage extends ComponentBase {
  render() {
    return html`
      <div style="background: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 1em; margin-bottom: 1em; border-radius: 4px;">
        <strong>Important:</strong> You must integrate the CTA SDK into your playable ad for successful publishing. See <a href="#cta-sdk" >cta-sdk</a> for instructions.
      </div>
      <playable-publisher></playable-publisher>
    `;
  }
}
