import { ComponentBase, customElement, html, route, css } from "fw";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { marked } from "marked";
// @ts-ignore
import markdownContent from "../assets/cta-sdk.md?raw";

@customElement("cta-sdk-page")
@route("/cta-sdk", {
  title: "CTA SDK Documentation",
  description: "Documentation for the CTA SDK, providing guidance on how to integrate and use the SDK in your playable ads.",
})
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
      <div class="max-w-4xl mx-auto">
        <div class="markdown-body bg-white dark:bg-slate-900 p-4 md:p-8 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          ${unsafeHTML(this.markdownHtml)}
        </div>
      </div>
    `;
  }
}
