import { ComponentBase, customElement, html, route } from "fw";
import "./home-page.ts.css";

@customElement("home-page")
@route("/", {
  title: "Playable Tools for HTML5 Ads",
  description:
    "A collection of open-source tools for HTML5 playable ads developers, including publishing, asset compression, and validation.",
})
export class HomePage extends ComponentBase {
  render() {
    return html`
      <h1>Gritsenko Playable Ads Tools</h1>

      <p>
        This app provides a collection of open-source, useful tools for HTML5
        playable ads developers.
      </p>

      <h2>Available Tools:</h2>
      <div class="feature-cards">
        <div class="feature-card">
          <h3>📤 Publish to Ad Networks</h3>
          <p>Publishing workflow automation - Streamline the process of deploying your playable ads to various advertising networks.</p>
          <a href="#publish" class="feature-card-link">Start Publishing</a>
        </div>

        <div class="feature-card">
          <h3>🔄 Base64 Converter</h3>
          <p>File to Base64 encoding - Convert files and images to Base64 encoding for embedding in your HTML5 playable ads.</p>
          <a href="#base64" class="feature-card-link">Convert Files</a>
        </div>

        <div class="feature-card">
          <h3>🎬 Video to Sprite</h3>
          <p>MP4 to PNG sprite sequences - Transform MP4 videos into PNG sprite sequences for game development and animations.</p>
          <a href="#video2sprite" class="feature-card-link">Convert Videos</a>
        </div>

        <div class="feature-card">
          <h3>📊 Folder Size Map</h3>
          <p>Interactive folder analysis - Analyze and visualize the size structure of local folders using sunburst charts, treemaps, and tree views.</p>
          <a href="#folder-size-visualizer" class="feature-card-link">Visualize Folders</a>
        </div>

        <div class="feature-card">
          <h3>🗜️ Imba Packer</h3>
          <p>Experimental HTML compression - Maximizing file size reduction while preserving functionality. Great for size-constrained ads.</p>
          <a href="#imba-packer" class="feature-card-link">Compress HTML</a>
        </div>

        <div class="feature-card">
          <h3>🖼️ Assets Compression</h3>
          <p>PNG optimization tools - Optimize your PNG images and other assets to reduce file size and improve loading times using PngChpocker.</p>
          <a href="#compress-assets" class="feature-card-link">Compress Assets</a>
        </div>

        <div class="feature-card">
          <h3>📖 CTA SDK Documentation</h3>
          <p>Integration guides - Complete guide for integrating the Call-to-Action SDK in your playable ads. Essential for successful publishing.</p>
          <a href="#cta-sdk" class="feature-card-link">View Documentation</a>
        </div>

        <div class="feature-card">
          <h3>✅ Ad Network Requirements</h3>
          <p>Technical specifications - Stay up-to-date with the specific technical requirements and specifications for different advertising networks.</p>
          <a href="#validate" class="feature-card-link">Check Requirements</a>
        </div>

        <div class="feature-card">
          <h3>📱 Playable Preview</h3>
          <p>Multi-device testing - Preview and share your playable ad creations from GitHub on different devices and orientations.</p>
          <a href="#preview" class="feature-card-link">Preview Ads</a>
        </div>

        <div class="feature-card">
          <h3>📂 Portfolio Management</h3>
          <p>GitHub integration - Manage and view your portfolio of playable ads from GitHub repositories. Organize and showcase your work.</p>
          <a href="#portfolio" class="feature-card-link">Manage Portfolio</a>
        </div>
      </div>
    `;
  }
}
