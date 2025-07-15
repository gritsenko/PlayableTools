import { ComponentBase, customElement, html } from "fw";
import { ifDefined } from "lit/directives/if-defined.js";
import "./nav-menu.ts.css";

@customElement("nav-menu")
export class NavMenu extends ComponentBase {
  private menuItems = [
    { label: "Home", path: "/", disabled: false },
    { label: "Publish", path: "/publish", disabled: false },
    { label: "Validate", path: "/counter", disabled: true },
    { label: "Compress assets", path: "/weather", disabled: true },
    { label: "FAQ", path: "/faq", disabled: true },
  ];

  private get currentPath() {
    // Get current hash path, default to first menu item if not found
    let hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (!hash.startsWith('/')) hash = '/' + hash;
    return hash;
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for hash changes to update active state
    window.addEventListener('hashchange', this.handleHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  private handleHashChange = () => {
    this.requestUpdate();
  };

  render() {
    return html`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map((item) => {
            const isActive = this.currentPath === item.path;
            return html`
              <li>
                <a
                  href=${ifDefined(!item.disabled ? `#${item.path.substring(1)}` : undefined)}
                  class="${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}"
                  tabindex="${!item.disabled ? 0 : -1}"
                  aria-disabled="${item.disabled}"
                  title=${item.disabled ? 'Coming soon' : ''}
                  ...=${isActive ? { 'aria-current': 'page' } : {}}
                  @click=${item.disabled ? (e: Event) => e.preventDefault() : undefined}
                >
                  ${item.label}
                </a>
              </li>
            `;
          })}
        </ul>
      </nav>
    `;
  }
}
