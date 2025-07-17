import "reflect-metadata";

import "@picocss/pico/css/pico.min.css";
import "./app-root.css";

import { ComponentBase, customElement, html } from "./fw";
import "./Layout/nav-menu";
import { MainLayout } from "./Layout/main-layout";

// Eagerly import all files in pages directory
// this will resolve all page components
import.meta.glob("./pages/**/*.ts", { eager: true });

@customElement("app-root")
export class AppRoot extends ComponentBase {
  render() {
    return html`
      <router-outlet .defaultLayout="${MainLayout}"></router-outlet>
    `;
  }
}