import { ComponentBase, customElement, html, route as route } from "fw";

@customElement("publish-page")
@route("/publish", {
  title: "Publish Playable Ads",
  description: "Publish your playable ads to multiple ad networks with ease. This tool streamlines the process of deploying your ads."
})
export class HomePage extends ComponentBase {
  render() {
    return html`
      <div class="warning-notice">
        <strong>Important:</strong> You must integrate the CTA SDK into your playable ad for successful publishing. See <a href="#cta-sdk" >cta-sdk</a> for instructions.
      </div>
      <playable-publisher></playable-publisher>

      <style>
        .warning-notice {
          background: var(--pico-mark-background-color);
          color: var(--pico-mark-color);
          border: 1px solid var(--pico-mark-background-color);
          padding: 1em;
          margin-bottom: 1em;
          border-radius: var(--pico-border-radius);
        }
      </style>
    `;
  }
}
