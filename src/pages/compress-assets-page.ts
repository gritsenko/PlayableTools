import { ComponentBase, customElement, html, route } from "fw";
@customElement("compress-assets-page")
@route("/compress-assets", {
  title: "Compress Assets",
  description: "Download PngChpocker to compress PNG images locally.",
})
export class CompressAssetsPage extends ComponentBase {

  render() {
    return html`
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Compress Assets</h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-6">
          <strong>PngChpocker</strong> is a Windows desktop app that allows you
          to compress PNG images in a folder without needing to use online
          services like TinyPNG. Additionally, it can extract images from merged
          HTML files containing base64-encoded images.
        </p>
        
        <div class="mb-8">
          <image-popup src="PngChpocker.png" alt="PngChpocker app screenshot" thumbWidth="500px"></image-popup>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6 rounded-r text-slate-700 dark:text-slate-300">
          <strong class="block mb-1 text-blue-700 dark:text-blue-300">Usage tip:</strong>
          Just open the app, choose the maximum
          number of colors for the image (256 is usually fine, but you can
          experiment to keep acceptable quality). For images with gradients,
          it's better to use more colors. Then select and drag images from
          Explorer to the app window and see the result. It will create a subfolder with compressed images.
        </div>
        
        <div class="mb-6">
          <a href="files/PngChpocker.zip" download class="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
            <span class="material-icons-outlined mr-2">download</span>
            Download PngChpocker x64 for Windows
          </a>
        </div>
        
        <p class="text-sm text-slate-500 dark:text-slate-400 italic">
          Note: A new version of this tool will soon be integrated directly
          into the Playable Tools site.
        </p>
      </div>
    `;
  }
}
