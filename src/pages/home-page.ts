import { ComponentBase, customElement, html, route } from "fw";

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

      <h2>Core Features:</h2>
      <ul class="feature-list">
        <li>
          <strong>Publish to Ad Networks:</strong> Streamline the process of
          deploying your playable ads to various advertising networks.
        </li>
        <li>
          <strong>Assets Compression:</strong> Optimize your images, scripts,
          and other assets to reduce file size and improve loading times.
        </li>
        <li>
          <strong>Ad Network Requirements:</strong> Stay up-to-date with the
          specific requirements and specifications for different ad networks.
        </li>
        <li>
          <strong>Playable Ads Validator:</strong> Check your ads against common
          standards and network rules to ensure compatibility and performance.
        </li>
        <li>
          <strong>Playable Ads Sharing:</strong> Easily share your playable ad
          creations for testing and previews.
        </li>
      </ul>
    `;
  }
}
