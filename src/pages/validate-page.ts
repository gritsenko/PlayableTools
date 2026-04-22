import { ComponentBase, customElement, html, route } from "fw";

@customElement("validate-page")
@route("/validate", {
  title: "Ad Network Technical Requirements | PlayableTools",
  description:
    "Technical requirements and validation references for major ad networks, including file size limits, platform rules, and testing links for playable ads.",
})
export class ValidatePage extends ComponentBase {
  render() {
    return html`
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Technical Requirements of Ad Networks
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400">
            Playable ads must comply with the technical specifications set by
            various ad networks to ensure compatibility and optimal performance.
            Below are requirements and validation tools for major networks:
          </p>
        </div>

        <div class="space-y-6">
          ${this.renderNetworkCard(
            "Facebook Ads",
            "2MB (HTML), 5MB (ZIP)",
            html`
              <a
                href="https://developers.facebook.com/tools/playable-preview/"
                target="_blank"
                class="text-primary hover:underline"
                >Playable Preview</a
              >
              <span class="text-sm text-slate-500 dark:text-slate-400 ml-2"
                >(public tool does not test ZIPs; use Ads Manager for full
                validation)</span
              >
            `,
            "Use the Facebook Playable Preview tool. Drag your file in and check for errors. All specification items must be green before uploading to Ads Manager."
          )}

          ${this.renderNetworkCard(
            "Google Adwords",
            "5MB (ZIP)",
            html`
              <a
                href="https://h5validator.appspot.com/dcm/asset"
                target="_blank"
                class="text-primary hover:underline"
                >H5 Validator</a
              >
            `,
            "Zip file name length errors can be ignored. Use the correct compressed package and check for format issues."
          )}

          ${this.renderNetworkCard(
            "Unity",
            "5MB (HTML)",
            html`
              <a
                href="https://apps.apple.com/us/app/ad-testing/id1463016906"
                target="_blank"
                class="text-primary hover:underline"
                >iOS Validator</a
              >,
              <a
                href="https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp&hl=en_US"
                target="_blank"
                class="text-primary hover:underline ml-1"
                >Android Validator</a
              >
            `,
            html`Use the Unity test app, paste your playable ad URL, and check for issues in the Creative report. App store links must use the <code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">apps.apple.com/</code> domain for iOS.`
          )}

          ${this.renderNetworkCard(
            "AppLovin",
            "5MB (HTML)",
            html`
              <a
                href="https://p.applov.in/playablePreview?create=1&qr=1"
                target="_blank"
                class="text-primary hover:underline"
                >Web Validator</a
              >,
              <a
                href="https://apps.apple.com/us/app/playable-preview/id6468529760"
                target="_blank"
                class="text-primary hover:underline ml-1"
                >iOS App</a
              >,
              <a
                href="https://install.appcenter.ms/orgs/iosdeveloper-dbmy/apps/android-playable-preview/distribution_groups/all-users-of-android-playable-preview"
                target="_blank"
                class="text-primary hover:underline ml-1"
                >Android App</a
              >
            `,
            "Use the Applovin preview tool. Contact Applovin for permission if using external requests (analytics), or your playable may be rejected."
          )}

          ${this.renderNetworkCard(
            "IronSource",
            "5MB (HTML)",
            html`Validation: Only in Ads Manager`,
            html`The ironSource test tool is deprecated. Submit your build for review in the ironSource dashboard. See the <a href="https://developers.is.com/ironsource-mobile/general/html-upload/" target="_blank" class="text-primary hover:underline">official guide</a>.
            <br />
            <small>From 2025, accepts Unity builds in MRAID (not DAPI).</small>`
          )}

          ${this.renderNetworkCard(
            "Moloco",
            "5MB (HTML)",
            "No validation tool available",
            "Uses Facebook's format and API. Code must NOT contain <code>XMLHttpRequest</code> (remove from PixiJS/Howler if present)."
          )}

          ${this.renderNetworkCard(
            "TikTok",
            "5MB (ZIP)",
            html`
              <a
                href="https://ads.tiktok.com/help/article/playable-ads"
                target="_blank"
                class="text-primary hover:underline"
                >Playable Ads Help</a
              >,
              <a
                href="https://bytedance.feishu.cn/docs/doccnSSJ2uAY8EYPCAtTuoX3u9"
                target="_blank"
                class="text-primary hover:underline"
                >Feishu Doc 1</a
              >,
              <a
                href="https://bytedance.us.feishu.cn/docs/doccnmdeT1KStyS0QdVExnVAy8v"
                target="_blank"
                class="text-primary hover:underline"
                >Feishu Doc 2</a
              >
            `,
            html`
              <strong>Note:</strong> No official testing tool. <code>config.json</code> must be present in the root directory and include orientation (0-responsive, 1-portrait, 2-landscape) and language codes in <code>playable_languages</code> array.
            `
          )}

          ${this.renderNetworkCard(
            "Yandex Games",
            "100MB (unzipped archive)",
            html`
              <a
                href="https://yandex.ru/dev/games/doc/ru/sdk"
                target="_blank"
                class="text-primary hover:underline"
                >SDK Docs</a
              >,
              <a
                href="https://yandex.ru/dev/games/doc/ru/concepts/requirements"
                target="_blank"
                class="text-primary hover:underline ml-1"
                >Requirements</a
              >
            `,
            html`
              <strong>Validation focus:</strong> initialize <code>YaGames</code> correctly, call <code>LoadingAPI.ready()</code> when the game is playable, pause gameplay and audio on <code>game_api_pause</code> / fullscreen ads, use only Yandex SDK for ads and purchases, and recover unprocessed purchases via <code>payments.getPurchases()</code>.
            `
          )}

          ${this.renderNetworkCard(
            "Mintegral",
            "5MB (ZIP)",
            html`
              <a
                href="https://www.mindworks-creative.com/review/"
                target="_blank"
                class="text-primary hover:underline"
                >Mindworks Review</a
              >
            `,
            html`
              <strong>Testing:</strong> Use the Mindworks Review tool. Drag in your zip archive and check for errors. Archive name must match the main folder/file inside.
            `
          )}

          ${this.renderNetworkCard(
            "Vungle",
            "5MB (ZIP)",
            html`
              <a
                href="https://support.vungle.com/hc/en-us/articles/4908908675355-Test-Your-Playable-Asset-With-Our-Creative-Verifier"
                target="_blank"
                class="text-primary hover:underline"
                >Creative Verifier</a
              >
            `,
            html`
              <strong>Testing:</strong> See Vungle's official guide for step-by-step testing instructions.
            `
          )}

          ${this.renderNetworkCard(
            "WeChat MiniGame",
            "Special requirements",
            "No public validator tool",
            html`
              Notes:
              <ul class="list-disc list-inside ml-4">
                <li>No CTA button or app store redirect needed; after trial ends, user is sent to End Card.</li>
                <li>"Rigid Body" and "Video" assets are not supported.</li>
                <li>Only some templates support WeChat MiniGame export (look for WeChat logo).</li>
              </ul>
              See <a href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks" target="_blank" class="text-primary hover:underline">Playturbo docs</a> for details.
            `
          )}
        </div>

        <div class="mt-12">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            General Requirements
          </h2>
          <ul class="list-disc list-inside mb-6">
            <li>
              <strong>File Size Limits:</strong> Most networks enforce a maximum
              file size (e.g., 2MB or 5MB) for fast loading.
            </li>
            <li>
              <strong>Supported Formats:</strong> HTML5 is the standard, but some
              networks may have additional format preferences.
            </li>
            <li>
              <strong>Loading Time:</strong> Ads should load quickly, typically
              within 1–3 seconds.
            </li>
            <li>
              <strong>Responsive Design:</strong> Playable ads should adapt to
              different screen sizes and orientations.
            </li>
            <li>
              <strong>API Integrations:</strong> Some networks require integration
              with their SDKs or specific event tracking APIs.
            </li>
            <li>
              <strong>Asset Optimization:</strong> Use compressed images, minified
              scripts, and efficient code to reduce load times.
            </li>
          </ul>

          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Best Practices
          </h2>
          <ul class="list-disc list-inside mb-6">
            <li>Unzip downloaded archives and use the inner zip for upload.</li>
            <li>Main HTML file should be named <code>index</code> and placed in the root directory.</li>
            <li>Check for channel-specific restrictions (e.g., WeChat MiniGame does not support video or rigid body assets).</li>
            <li>For TikTok, ensure <code>config.json</code> is present and correctly formatted.</li>
            <li>Always test your playable in the official validator or preview tool before submitting.</li>
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            References & Further Reading
          </h2>
          <ul class="list-disc list-inside mb-6">
            <li>
              <a
                href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks"
                target="_blank"
                class="text-primary hover:underline"
              >
                Playturbo: Playable Upload Specifications for Networks
              </a>
            </li>
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Other Ad Networks
          </h2>
          <ul class="list-disc list-inside">
            <li>
              <strong>AdColony</strong>: 2MB, Single HTML file,{" "}
              <a
                href="https://www.adcolony.com/"
                target="_blank"
                class="text-primary hover:underline"
                >AdColony</a
              >
              (iOS, Android)
            </li>
            <li>
              <strong>Liftoff</strong>: 5MB, Zip file with resources,{" "}
              <a
                href="https://liftoff.io/"
                target="_blank"
                class="text-primary hover:underline"
                >Liftoff</a
              >
            </li>
            <li>
              <strong>Inmobi</strong>: 5MB, Offline script must be deployed to CDN and HTML paths updated,{" "}
              <a
                href="https://www.inmobi.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Inmobi</a
              >
            </li>
            <li>
              <strong>Tapjoy</strong>: 1.9MB,{" "}
              <a
                href="https://www.tapjoy.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Tapjoy</a
              >
            </li>
            <li>
              <strong>Pangle</strong>: 5MB,{" "}
              <a
                href="https://www.pangleglobal.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Pangle</a
              >
            </li>
            <li>
              <strong>myTarget</strong>: 2MB,{" "}
              <a
                href="https://target.my.com/"
                target="_blank"
                class="text-primary hover:underline"
                >myTarget</a
              >
            </li>
            <li>
              <strong>Kwai</strong>: 5MB,{" "}
              <a
                href="https://www.kwai.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Kwai</a
              >
            </li>
            <li>
              <strong>i-mobile</strong>: 6MB,{" "}
              <a
                href="https://www.i-mobile.co.jp/"
                target="_blank"
                class="text-primary hover:underline"
                >i-mobile</a
              >
            </li>
            <li>
              <strong>Snapchat</strong>: 5MB,{" "}
              <a
                href="https://forbusiness.snapchat.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Snapchat</a
              >
            </li>
            <li>
              <strong>Smadex</strong>: 5MB,{" "}
              <a
                href="https://www.smadex.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Smadex</a
              >
            </li>
            <li>
              <strong>Chartboost</strong>: 3MB,{" "}
              <a
                href="https://www.chartboost.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Chartboost</a
              >
            </li>
            <li>
              <strong>Bigo</strong>: 5MB,{" "}
              <a
                href="https://www.bigo.sg/"
                target="_blank"
                class="text-primary hover:underline"
                >Bigo</a
              >
            </li>
            <li>
              <strong>巨量引擎</strong>: 3MB,{" "}
              <a
                href="https://www.oceanengine.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Ocean Engine</a
              >
            </li>
            <li>
              <strong>快手</strong>: 3MB,{" "}
              <a
                href="https://www.kuaishou.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Kuaishou</a
              >
            </li>
            <li>
              <strong>Tencent AMS</strong>: 3MB,{" "}
              <a
                href="https://e.qq.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Tencent AMS</a
              >
            </li>
            <li>
              <strong>Tencent Ads</strong>: 3MB, Zip file with resources,{" "}
              <a
                href="https://ad.qq.com/"
                target="_blank"
                class="text-primary hover:underline"
                >Tencent Ads</a
              >
            </li>
            <li>
              <strong>WeChat MiniGame</strong>: 15MB, Zip with resources,{" "}
              <a
                href="https://developers.weixin.qq.com/minigame/"
                target="_blank"
                class="text-primary hover:underline"
                >WeChat MiniGame Docs</a
              >
            </li>
          </ul>
        </div>
      </div>
    `;
  }

  private renderNetworkCard(title: string, limits: string, tools: any, testing: any) {
    return html`
      <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
            ${title}
          </h3>
          <span class="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm font-medium">
            ${limits}
          </span>
        </div>

        <div class="mb-4">
          <span class="font-medium text-slate-700 dark:text-slate-300">Tools:</span>
          <span class="ml-2">${tools}</span>
        </div>

        <div class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded">
          <strong class="block mb-1 text-slate-700 dark:text-slate-300">Testing:</strong>
          ${testing}
        </div>
      </div>
    `;
  }
}
