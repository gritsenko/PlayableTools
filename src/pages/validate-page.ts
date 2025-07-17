import { ComponentBase, customElement, html, route } from "fw";

@customElement("validate-page")
@route("/validate", {
  title: "Ad Network Technical Requirements",
  description:
    "A comprehensive guide to the technical requirements for major ad networks, including file size limits and validation tools.",
})
export class ValidatePage extends ComponentBase {
  render() {
    return html`
      <section class="validate-page">
        <h1>Technical Requirements of Ad Networks</h1>
        <p>
          Playable ads must comply with the technical specifications set by
          various ad networks to ensure compatibility and optimal performance.
          Below are requirements and validation tools for major networks:
        </p>
        <ul class="ad-network-list">
          <li>
            <strong>Facebook Ads</strong> — <em>2MB (HTML), 5MB (ZIP)</em><br />
            <span>
              <a
                href="https://developers.facebook.com/tools/playable-preview/"
                target="_blank"
                >Playable Preview</a
              >
              <small
                >(public tool does not test ZIPs; use Ads Manager for full
                validation)</small
              ></span
            >
            <br />
            <small>
              <strong>Testing:</strong> Use the Facebook Playable Preview tool. Drag your file in and check for errors. All specification items must be green before uploading to Ads Manager.
            </small>
          </li>
          <li>
            <strong>Google Adwords</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://h5validator.appspot.com/dcm/asset"
                target="_blank"
                >H5 Validator</a
              ></span
            >
            <br />
            <small>
              <strong>Note:</strong> Zip file name length errors can be ignored. Use the correct compressed package and check for format issues.
            </small>
          </li>
          <li>
            <strong>Unity</strong> — <em>5MB (HTML)</em><br />
            <span>
              <a
                href="https://apps.apple.com/us/app/ad-testing/id1463016906"
                target="_blank"
                >iOS Validator</a
              >,
              <a
                href="https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp&hl=en_US"
                target="_blank"
                >Android Validator</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> Use the Unity test app, paste your playable ad URL, and check for issues in the Creative report. App store links must use the <code>apps.apple.com/</code> domain for iOS.
            </small>
          </li>
          <li>
            <strong>AppLovin</strong> — <em>5MB (HTML)</em><br />
            <span>
              <a
                href="https://p.applov.in/playablePreview?create=1&qr=1"
                target="_blank"
                >Web Validator</a
              >,
              <a
                href="https://apps.apple.com/us/app/playable-preview/id6468529760"
                target="_blank"
                >iOS App</a
              >,
              <a
                href="https://install.appcenter.ms/orgs/iosdeveloper-dbmy/apps/android-playable-preview/distribution_groups/all-users-of-android-playable-preview"
                target="_blank"
                >Android App</a
              ></span
            >
            <br />
            <small>
              <strong>Testing:</strong> Use the Applovin preview tool. Contact Applovin for permission if using external requests (analytics), or your playable may be rejected.
            </small>
          </li>
          <li>
            <strong>IronSource</strong> — <em>5MB (HTML)</em><br />
            <span>Validation: Only in Ads Manager</span><br />
            <small>
              <strong>Testing:</strong> The ironSource test tool is deprecated. Submit your build for review in the ironSource dashboard. See the <a href="https://developers.is.com/ironsource-mobile/general/html-upload/" target="_blank">official guide</a>.
            </small>
            <br />
            <small>From 2025, accepts Unity builds in MRAID (not DAPI).</small>
          </li>
          <li>
            <strong>Moloco</strong> — <em>5MB (HTML)</em><br />
            <span>No validation tool available</span><br />
            <small>
              Uses Facebook's format and API. Code must NOT contain <code>XMLHttpRequest</code> (remove from PixiJS/Howler if present).
            </small>
          </li>
          <li>
            <strong>TikTok</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://ads.tiktok.com/help/article/playable-ads"
                target="_blank"
                >Playable Ads Help</a
              >,
              <a
                href="https://bytedance.feishu.cn/docs/doccnSSJ2uAY8EYPCAtTuoX3u9"
                target="_blank"
                >Feishu Doc 1</a
              >,
              <a
                href="https://bytedance.us.feishu.cn/docs/doccnmdeT1KStyS0QdVExnVAy8v"
                target="_blank"
                >Feishu Doc 2</a
              ></span
            ><br />
            <small>
              <strong>Note:</strong> No official testing tool. <code>config.json</code> must be present in the root directory and include orientation (0-responsive, 1-portrait, 2-landscape) and language codes in <code>playable_languages</code> array.
            </small>
          </li>
          <li>
            <strong>Mintegral</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://www.mindworks-creative.com/review/"
                target="_blank"
                >Mindworks Review</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> Use the Mindworks Review tool. Drag in your zip archive and check for errors. Archive name must match the main folder/file inside.
            </small>
          </li>
          <li>
            <strong>Vungle</strong> — <em>5MB (ZIP)</em><br />
            <span>
              <a
                href="https://support.vungle.com/hc/en-us/articles/4908908675355-Test-Your-Playable-Asset-With-Our-Creative-Verifier"
                target="_blank"
                >Creative Verifier</a
              ></span
            ><br />
            <small>
              <strong>Testing:</strong> See Vungle's official guide for step-by-step testing instructions.
            </small>
          </li>
          <li>
            <strong>WeChat MiniGame</strong> — <em>Special requirements</em><br />
            <span>No public validator tool</span><br />
            <small>
              <strong>Notes:</strong> No CTA button or app store redirect needed; after trial ends, user is sent to End Card. "Rigid Body" and "Video" assets are not supported. Only some templates support WeChat MiniGame export (look for WeChat logo). See <a href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks" target="_blank">Playturbo docs</a> for details.
            </small>
          </li>
        </ul>
        <h2>General Requirements</h2>
        <ul class="general-reqs">
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
          <li>
            <strong>Best Practices:</strong> 
            <ul>
              <li>Unzip downloaded archives and use the inner zip for upload.</li>
              <li>Main HTML file should be named <code>index</code> and placed in the root directory.</li>
              <li>Check for channel-specific restrictions (e.g., WeChat MiniGame does not support video or rigid body assets).</li>
              <li>For TikTok, ensure <code>config.json</code> is present and correctly formatted.</li>
              <li>Always test your playable in the official validator or preview tool before submitting.</li>
            </ul>
          </li>
        </ul>
        <h2>References & Further Reading</h2>
        <ul>
          <li>
            <a href="https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks" target="_blank">
              Playturbo: Playable Upload Specifications for Networks
            </a>
          </li>
        </ul>
        <h2>Other Ad Networks</h2>
        <ul class="other-networks">
          <li>
            <strong>AdColony</strong>: 2MB, Single HTML file, <a href="https://www.adcolony.com/" target="_blank">AdColony</a> (iOS, Android)
          </li>
          <li>
            <strong>Liftoff</strong>: 5MB, Zip file with resources, <a href="https://liftoff.io/" target="_blank">Liftoff</a>
          </li>
          <li>
            <strong>Inmobi</strong>: 5MB, Offline script must be deployed to CDN and HTML paths updated, <a href="https://www.inmobi.com/" target="_blank">Inmobi</a>
          </li>
          <li>
            <strong>Tapjoy</strong>: 1.9MB, <a href="https://www.tapjoy.com/" target="_blank">Tapjoy</a>
          </li>
          <li>
            <strong>Pangle</strong>: 5MB, <a href="https://www.pangleglobal.com/" target="_blank">Pangle</a>
          </li>
          <li>
            <strong>myTarget</strong>: 2MB, <a href="https://target.my.com/" target="_blank">myTarget</a>
          </li>
          <li>
            <strong>Kwai</strong>: 5MB, <a href="https://www.kwai.com/" target="_blank">Kwai</a>
          </li>
          <li>
            <strong>i-mobile</strong>: 6MB, <a href="https://www.i-mobile.co.jp/" target="_blank">i-mobile</a>
          </li>
          <li>
            <strong>Snapchat</strong>: 5MB, <a href="https://forbusiness.snapchat.com/" target="_blank">Snapchat</a>
          </li>
          <li>
            <strong>Smadex</strong>: 5MB, <a href="https://www.smadex.com/" target="_blank">Smadex</a>
          </li>
          <li>
            <strong>Chartboost</strong>: 3MB, <a href="https://www.chartboost.com/" target="_blank">Chartboost</a>
          </li>
          <li>
            <strong>Bigo</strong>: 5MB, <a href="https://www.bigo.sg/" target="_blank">Bigo</a>
          </li>
          <li>
            <strong>巨量引擎</strong>: 3MB, <a href="https://www.oceanengine.com/" target="_blank">Ocean Engine</a>
          </li>
          <li>
            <strong>快手</strong>: 3MB, <a href="https://www.kuaishou.com/" target="_blank">Kuaishou</a>
          </li>
          <li>
            <strong>Tencent AMS</strong>: 3MB, <a href="https://e.qq.com/" target="_blank">Tencent AMS</a>
          </li>
          <li>
            <strong>Tencent Ads</strong>: 3MB, Zip file with resources, <a href="https://ad.qq.com/" target="_blank">Tencent Ads</a>
          </li>
          <li>
            <strong>WeChat MiniGame</strong>: 15MB, Zip with resources, <a href="https://developers.weixin.qq.com/minigame/" target="_blank">WeChat MiniGame Docs</a>
          </li>
        </ul>
      </section>
    `;
  }
}
