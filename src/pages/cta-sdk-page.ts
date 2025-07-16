import { ComponentBase, customElement, html, route } from "fw";
import { marked } from "marked";

@customElement("cta-sdk-page")
@route("/cta-sdk")
export class CtaSdkPage extends ComponentBase {
  markdownHtml: string = "";

  async connectedCallback() {
    super.connectedCallback();
    // Fetch markdown file and convert to HTML using 'marked'
    const response = await fetch("/cta-sdk.md");
    const markdown = await response.text();
    const html = await marked.parse(markdown);
    this.markdownHtml = html;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="cta-sdk-info" style="text-align: left;">
        <div .innerHTML=${this.markdownHtml}></div>
      </div>
    `;
  }
}
