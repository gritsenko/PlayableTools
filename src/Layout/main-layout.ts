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
      <div class="flex flex-col md:flex-row h-screen font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 antialiased">
        <!-- Mobile Header (visible only on small screens) -->
        <header class="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
           <site-logo></site-logo>
           <button @click="${this.toggleSidebar}" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
             <span class="material-icons-outlined">menu</span>
           </button>
        </header>

        <!-- Sidebar -->
        <aside class="${this.sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-20 w-64 h-full flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 transition-transform duration-300 ease-in-out">
          <div class="flex items-center gap-4 mb-8">
             <site-logo></site-logo>
             <button @click="${this.closeSidebar}" class="md:hidden ml-auto text-slate-500">
               <span class="material-icons-outlined">close</span>
             </button>
          </div>
          
          <nav class="flex-grow overflow-y-auto">
            <nav-menu></nav-menu>
          </nav>

          <div class="mt-auto space-y-4">
             <!-- GitHub & Telegram links -->
             <div class="flex flex-col gap-2">
                <a href="https://github.com/gritsenko/PlayableTools" target="_blank" class="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary no-underline">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.525.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.099 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
                  GitHub
                </a>
                <a href="https://t.me/playable_html5" target="_blank" class="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary no-underline">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_87_7225)"/>
                    <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_87_7225" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#37BBFE"/>
                        <stop offset="1" stop-color="#007DBB"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  Telegram
                </a>
             </div>
             
             <button @click="${this.suggestPWAInstall}" class="block hover:opacity-80 transition-opacity border-none bg-transparent p-0 cursor-pointer">
                <img src="pwa.png" width="170" alt="PWA Badge" />
             </button>
          </div>
        </aside>

        <!-- Overlay for mobile sidebar -->
        ${this.sidebarOpen ? html`<div class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" @click="${this.closeSidebar}"></div>` : ''}

        <main class="flex-1 p-4 md:p-8 overflow-y-auto">
          ${this.body}
        </main>
      </div>
    `;
  }
}