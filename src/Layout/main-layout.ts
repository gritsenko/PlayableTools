import type { HTMLTemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { customElement, html, LayoutComponentBase } from "fw";
import './main-layout.ts.css';

@customElement("main-layout")
export class MainLayout extends LayoutComponentBase {

    @property({ attribute: false, type: Object })
    body?: HTMLTemplateResult;

    render() {
        return html`
          <div class="layout">
          <header class="header">
            <span>Gritsenko Tools</span>
            <nav class="menu">
                    <nav-menu></nav-menu>
            </nav>
          </header>
          <main class="main">
                        ${this.body}
          </main>
        `;
    }
}