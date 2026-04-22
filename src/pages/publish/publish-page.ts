import { ComponentBase, customElement, html, route as route } from "fw";
import "./playable-publisher";

@customElement("publish-page")
@route("/publish", {
  title: "Publish Playable Ads to Ad Networks | PlayableTools",
  description: "Prepare HTML5 playable ads for major ad networks with platform-specific wrappers, launch links, and export-ready packaging."
})
export class HomePage extends ComponentBase {
  render() {
    return html`
      <div class="max-w-6xl mx-auto">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r text-yellow-700 dark:text-yellow-300">
          <strong>Important:</strong> You must integrate the CTA SDK into your playable ad for successful publishing. See <a href="/cta-sdk" class="underline hover:text-yellow-800 dark:hover:text-yellow-200">CTA SDK documentation</a> for instructions.
        </div>
        <section class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Publish HTML5 playable ads for major ad networks</h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 mb-3">
            Upload a playable ad and generate network-ready packages for Facebook, Google, Unity, AppLovin, IronSource, TikTok, Vungle, and other common ad platforms.
          </p>
          <p class="text-slate-600 dark:text-slate-400">
            The publisher helps playable developers prepare launch links, inject platform-specific wrappers, and export build variants faster without manually rebuilding every package.
          </p>
        </section>
        <playable-publisher></playable-publisher>
      </div>
    `;
  }
}
