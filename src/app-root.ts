import "reflect-metadata";

import './index.css';
import '@picocss/pico/css/pico.min.css';
import './Layout/nav-menu';

import { ComponentBase, customElement, html } from './fw';
// Eagerly import all files in pages directory
// this will resolve all page components
import.meta.glob('./pages/**/*.ts', { eager: true });

import { MainLayout } from './Layout/main-layout';

@customElement('app-root')
export class AppRoot extends ComponentBase {
  render() {
    return html`
      <router-outlet .defaultLayout="${MainLayout}"></router-outlet>
    `;
  }
}