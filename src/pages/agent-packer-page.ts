import { ComponentBase, customElement, html, route } from "fw";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { marked } from "marked";
// @ts-ignore
import markdownContent from "../assets/agent-packer.md?raw";

@customElement("agent-packer-page")
@route("/headless-packer", {
  title: "Headless Playable Packer & MCP Server for AI Agents | PlayableTools",
  description:
    "Pack HTML5 playable ads for ad networks headlessly via CLI (@gritsenko/cta-pack) or an MCP server (@gritsenko/cta-mcp). Copy a short prompt into your AI agent to set up and build a playable automatically.",
})
export class AgentPackerPage extends ComponentBase {
  markdownHtml: string = "";

  connectedCallback() {
    super.connectedCallback();

    const content = marked.parse(markdownContent);
    if (typeof content === "string") {
      this.markdownHtml = content;
    }

    this.requestUpdate();
  }

  updated() {
    this.attachCopyButtons();
  }

  // Adds a "Copy" button to every rendered code block. Each <pre> is wrapped in a
  // relatively-positioned container so the button stays put while wide code scrolls.
  private attachCopyButtons() {
    const blocks = this.querySelectorAll<HTMLPreElement>(".markdown-body pre");
    blocks.forEach((pre) => {
      if (pre.dataset.copyAttached) return;
      pre.dataset.copyAttached = "true";

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      Object.assign(button.style, {
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        font: "600 0.75rem/1 ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: "0.35rem 0.6rem",
        borderRadius: "0.375rem",
        border: "1px solid rgba(248, 250, 252, 0.25)",
        background: "rgba(248, 250, 252, 0.12)",
        color: "#f8fafc",
        cursor: "pointer",
      });

      const reset = () => {
        button.textContent = "Copy";
      };
      button.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        const text = (code?.textContent ?? pre.textContent ?? "").replace(/\n$/, "");
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "Copied!";
        } catch {
          button.textContent = "Copy failed";
        }
        setTimeout(reset, 1500);
      });

      wrapper.appendChild(button);
    });
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
