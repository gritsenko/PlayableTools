import type { HTMLTemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { customElement, html, LayoutComponentBase } from "fw";

@customElement("main-layout")
export class MainLayout extends LayoutComponentBase {
  @property({ attribute: false, type: Object })
  body?: HTMLTemplateResult;

  render() {
    return html`
      <div class="layout">
        <header class="header">
          <a href="/" class="header-link">
            <span>
              <div class="subheader">Gritsenko</div>
              Playable Ad Tools
            </span>
          </a>
          <nav class="menu">
            <nav-menu></nav-menu>
          </nav>
        </header>
        <main class="main">${this.body}</main>
      </div>
    `;
  }
}
