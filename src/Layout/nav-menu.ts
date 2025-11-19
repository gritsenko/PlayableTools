import { ComponentBase, customElement, html } from "fw";
import { ifDefined } from "lit/directives/if-defined.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import gamepadIconSvg from "./gamepad-icon.svg?raw";

@customElement("nav-menu")
export class NavMenu extends ComponentBase {
  private menuItems = [
    {
      category: "",
      items: [
        { label: "My playables", icon: "folder_special", path: "/portfolio", disabled: false },
      ]
    },
    {
      category: "Main tools",
      items: [
        { label: "Preview", icon: "visibility", path: "/preview", disabled: false },
        { label: "Publish", icon: "publish", path: "/publish", disabled: false },
      ]
    },
    {
      category: "Manuals",
      items: [
        { label: "CTA SDK", icon: "gamepad", path: "/cta-sdk", disabled: false },
        { label: "Guides", icon: "check_circle", path: "/validate", disabled: false },
      ]
    },
    {
      category: "Extra tools",
      items: [
        { label: "Compress assets", icon: "compress", path: "/compress-assets", disabled: false },
        { label: "Base64 Converter", icon: "code", path: "/base64", disabled: false },
        { label: "Imba Packer", icon: "inventory_2", path: "/imba-packer", disabled: false },
        { label: "Folder Size Map", icon: "folder", path: "/folder-size-visualizer", disabled: false },
        { label: "Video to Sprite", icon: "movie_filter", path: "/video2sprite", disabled: false },
        { label: "Spritesheet Maker", icon: "auto_awesome_motion", path: "/spritesheet-maker", disabled: false },
      ]
    }
  ];

  private get currentPath() {
    // Get current hash path, default to first menu item if not found
    let hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (!hash.startsWith('/')) hash = '/' + hash;
    // Handle root path
    if (hash === '/') return '/preview'; // Default to preview or home? The mockup shows Preview active.
    // Actually, let's just return the hash as is, but handle empty hash
    if (hash === '') return '/preview'; // Default
    
    // Remove query params
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
        return hash.substring(0, queryIndex);
    }
    
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
        ${this.menuItems.map((group, groupIndex) => {
          const baseClasses = "flex items-center gap-3 px-3 py-2 rounded font-medium transition-colors duration-200 no-underline";
          const activeClasses = "bg-primary text-white font-semibold";
          const inactiveClasses = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
          const disabledClasses = "opacity-50 cursor-not-allowed";
          
          return html`
            ${groupIndex > 0 ? html`<div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>` : ''}
            <ul class="space-y-1">
              <li class="px-3 py-1">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">${group.category}</p>
              </li>
              ${group.items.map((item) => {
                const isActive = this.currentPath === item.path;
                return html`
                  <li>
                    <a
                      href=${ifDefined(!item.disabled ? `#${item.path.substring(1)}` : undefined)}
                      class="${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${item.disabled ? disabledClasses : ''}"
                      tabindex="${!item.disabled ? 0 : -1}"
                      aria-disabled="${item.disabled}"
                      title=${item.disabled ? 'Coming soon' : ''}
                      ...=${isActive ? { 'aria-current': 'page' } : {}}
                      @click=${item.disabled ? (e: Event) => e.preventDefault() : undefined}
                    >
                      ${item.icon === "gamepad" 
                        ? unsafeHTML(gamepadIconSvg)
                        : html`<span class="material-icons-outlined">${item.icon}</span>`}
                      ${item.label}
                    </a>
                  </li>
                `;
              })}
            </ul>
          `;
        })}
      </nav>
    `;
  }
}
