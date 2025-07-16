import { ComponentBase, customElement, html, route } from "fw";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { marked } from "marked";
// @ts-ignore
import markdownContent from "../assets/cta-sdk.md?raw";

@customElement("cta-sdk-page")
@route("/cta-sdk")
export class CtaSdkPage extends ComponentBase {
  markdownHtml: string = "";

  connectedCallback() {
    super.connectedCallback();

    const content = marked.parse(markdownContent);
    if (typeof content === "string") {
      this.markdownHtml = content;
    }

    this.requestUpdate();
  }

  render() {
    return html`
      <div class="cta-sdk-info">
        <div>${unsafeHTML(this.markdownHtml)}</div>
      </div>
    `;
  }
}
