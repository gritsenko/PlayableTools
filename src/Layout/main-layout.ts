import type { HTMLTemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { customElement, html, LayoutComponentBase } from "fw";
import "./site-logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

@customElement("main-layout")
export class MainLayout extends LayoutComponentBase {
  @property({ attribute: false, type: Object })
  body?: HTMLTemplateResult;

  @property({ type: Boolean })
  sidebarOpen = false;

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private closeSidebar() {
    this.sidebarOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('beforeinstallprompt', (event) => {
      const beforeInstallEvent = event as BeforeInstallPromptEvent; // Explicitly cast the event
      beforeInstallEvent.preventDefault(); // Prevent the default browser prompt
      this.deferredPrompt = beforeInstallEvent; // Save the event for later use
    });
  }

  private suggestPWAInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt(); // Show the install prompt
      this.deferredPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null; // Reset the prompt
      });
    } else {
      alert('The install prompt is not available. Please use the browser menu to install the app.');
    }
  }

  render() {
    return html`
      <!-- Responsive header for mobile -->
      <header class="main-header">
        <site-logo></site-logo>
        <div class="hamburger" @click="${this.toggleSidebar}">
          <div class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      <!-- Sidebar overlay for mobile -->
      <div class="sidebar-overlay${this.sidebarOpen ? ' open' : ''}" @click="${this.closeSidebar}"></div>
      <div class="layout">
        <aside class="sidebar${this.sidebarOpen ? ' open' : ''}">
          <site-logo class="sidebar-header"></site-logo>
          <nav class="menu">
            <nav-menu></nav-menu>
          </nav>
          <div style="margin-top:auto; text-align:left;">
            <a href="https://github.com/gritsenko/PlayableTools" target="_blank" rel="noopener" title="GitHub Repository" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--pico-muted-color);text-decoration:none;font-size:1rem;padding:0.5rem 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle;"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.525.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.099 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
              <span>GitHub</span>
            </a>
            <button @click="${this.suggestPWAInstall}" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--pico-muted-color);text-decoration:none;font-size:1rem;padding:0.5rem 0;border:none;background:none;cursor:pointer;">
              <img src="./media/pwa.png" width="170" alt="PWA Badge" style="vertical-align:middle;"/>
              <span>Install App</span>
            </button>
          </div>
        </aside>
        <main class="main">${this.body}</main>
      </div>
    `;
  }
}