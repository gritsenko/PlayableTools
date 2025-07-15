import { ComponentBase, customElement, html } from "fw";
import "./nav-menu.ts.css";

@customElement("nav-menu")
export class NavMenu extends ComponentBase {
  private menuItems = [
    { label: "Publish", path: "/publish" },
    { label: "Validate", path: "/counter" },
    { label: "Compress assets", path: "/weather" },
    { label: "FAQ", path: "/faq" },
  ];

  private get currentPath() {
    // Get current hash path, default to first menu item if not found
    let hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (!hash.startsWith('/')) hash = '/' + hash;
    return hash;
  }

  render() {
    return html`
      <nav aria-label="Main menu">
        <ul>
          ${this.menuItems.map(
            (item) => {
              const isActive = this.currentPath === item.path;
              return html`
                <li>
                  <a
                    href="#${item.path.substring(1)}"
                    class=${isActive ? 'active' : ''}
                    ...=${isActive ? { 'aria-current': 'page' } : {}}
                  >
                    ${item.label}
                  </a>
                </li>
              `;
            }
          )}
        </ul>
      </nav>
    `;
  }
}
