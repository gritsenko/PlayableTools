import { ComponentBase, customElement, html, route } from "fw";

@customElement("home-page")
@route("/", {
  title: "Playable Tools for HTML5 Ads | PlayableTools",
  description:
    "Open-source tools for HTML5 playable ads developers, including publishing workflows, CTA SDK docs, technical validation, Base64 conversion, and video-to-sprite conversion.",
})
export class HomePage extends ComponentBase {
  render() {
    return html`
      <div class="max-w-7xl mx-auto">
        <div class="mb-12 text-center">
          <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Playable Ads Tools</h1>
          <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            This app provides a collection of open-source, useful tools for HTML5
            playable ads developers.
          </p>
        </div>

        <h2 class="text-2xl font-semibold text-slate-900 dark:text-white mb-8">Main tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          ${this.renderCard(
            "📂 Portfolio Management",
            "GitHub integration - Manage and view your portfolio of playable ads from GitHub repositories. Organize and showcase your work.",
            "/portfolio",
            "Manage Portfolio"
          )}

          ${this.renderCard(
            "📱 Playable Preview",
            "Multi-device testing - Preview and share your playable ad creations from GitHub on different devices and orientations.",
            "/preview",
            "Preview Ads"
          )}

          ${this.renderCard(
            "📤 Publish to Ad Networks",
            "Publishing workflow automation - Streamline the process of deploying your playable ads to various advertising networks.",
            "/publish",
            "Start Publishing"
          )}

          ${this.renderCard(
            "📖 CTA SDK Documentation",
            "Integration guides - Complete guide for integrating the Call-to-Action SDK in your playable ads. Essential for successful publishing.",
            "/cta-sdk",
            "View Documentation"
          )}

        </div>

        <h2 class="text-2xl font-semibold text-slate-900 dark:text-white mb-8">Extra tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.renderCard(
            "🔄 Base64 Converter",
            "File to Base64 encoding - Convert files and images to Base64 encoding for embedding in your HTML5 playable ads.",
            "/base64",
            "Convert Files"
          )}

          ${this.renderCard(
            "🎬 Video to Sprite",
            "MP4 to PNG sprite sequences - Transform MP4 videos into PNG sprite sequences for game development and animations.",
            "/video2sprite",
            "Convert Videos"
          )}

          ${this.renderCard(
            "📊 Folder Size Map",
            "Interactive folder analysis - Analyze and visualize the size structure of local folders using sunburst charts, treemaps, and tree views.",
            "/folder-size-visualizer",
            "Visualize Folders"
          )}

          ${this.renderCard(
            "🗜️ Imba Packer",
            "Experimental HTML compression - Maximizing file size reduction while preserving functionality. Great for size-constrained ads.",
            "/imba-packer",
            "Compress HTML"
          )}

          ${this.renderCard(
            "🖼️ Assets Compression",
            "PNG quantization in the browser - Pick a folder, preview every PNG with size share, then quantize and save the optimized files locally.",
            "/compress-assets",
            "Compress Assets"
          )}

          ${this.renderCard(
            "✅ Ad Network Requirements",
            "Technical specifications - Stay up-to-date with the specific technical requirements and specifications for different advertising networks.",
            "/validate",
            "Check Requirements"
          )}
        </div>
      </div>
    `;
  }

  private renderCard(title: string, description: string, link: string, linkText: string) {
    return html`
      <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow flex flex-col h-full">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">${title}</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6 flex-grow">${description}</p>
        <a 
          href="${link}" 
          class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary font-medium rounded hover:bg-primary hover:text-white transition-colors mt-auto"
        >
          ${linkText}
        </a>
      </div>
    `;
  }
}
