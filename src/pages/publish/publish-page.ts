import { ComponentBase, customElement, html, route as route } from "fw";
import "./playable-publisher";

@customElement("publish-page")
@route("/publish", {
  title: "Publish Playable Ads",
  description: "Publish your playable ads to multiple ad networks with ease. This tool streamlines the process of deploying your ads."
})
export class HomePage extends ComponentBase {
  render() {
    return html`
      <div class="max-w-6xl mx-auto">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r text-yellow-700 dark:text-yellow-300">
          <strong>Important:</strong> You must integrate the CTA SDK into your playable ad for successful publishing. See <a href="#cta-sdk" class="underline hover:text-yellow-800 dark:hover:text-yellow-200">cta-sdk</a> for instructions.
        </div>
        <playable-publisher></playable-publisher>
      </div>
    `;
  }
}
