import { ComponentBase, customElement, html, route } from "fw";
@customElement("compress-assets-page")
@route("/compress-assets")
export class CompressAssetsPage extends ComponentBase {

  render() {
    return html`
      <div class="compress-assets-info">
        <h1>Compress Assets</h1>
        <p>
          <strong>PngChpocker</strong> is a Windows desktop app that allows you
          to compress PNG images in a folder without needing to use online
          services like TinyPNG. Additionally, it can extract images from merged
          HTML files containing base64-encoded images.
        </p>
        <image-popup src="PngChpocker.png" alt="PngChpocker app screenshot" thumbWidth="500px"></image-popup>
        <div
          class="usage-tip"
          style="background:#f8f8f8; border-left:4px solid #2196f3; padding:1em; margin:1em 0;"
        >
          <strong>Usage tip:</strong> Just open the app, choose the maximum
          number of colors for the image (256 is usually fine, but you can
          experiment to keep acceptable quality). For images with gradients,
          it's better to use more colors. Then select and drag images from
          Explorer to the app window and see the result. It will create a subfolder with compressed images.
        </div>
        <p>
          <a href="files/PngChpocker.zip" download>Download PngChpocker x64 for windows</a>
        </p>
        <p>
          <em
            >Note: A new version of this tool will soon be integrated directly
            into the Playable Tools site.</em
          >
        </p>
      </div>
    `;
  }
}
