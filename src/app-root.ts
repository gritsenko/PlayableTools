import "reflect-metadata";

import { ComponentBase, customElement, html, state, inject, getNavigationEventName } from "./fw";
import "./Layout/nav-menu";
import { MainLayout } from "./Layout/main-layout";
import { VersionService } from "./services/VersionService";
import { PreviewService } from "./services/PreviewService";
import "./fw/update-notification";

import "./theme.css";
// Eagerly import all files in pages directory
// this will resolve all page components
import.meta.glob("./pages/**/*.ts", { eager: true });

@customElement("app-root")
export class AppRoot extends ComponentBase {
  @inject(PreviewService) previewService!: PreviewService;
  
  private versionService = new VersionService();
  private suppressNavigationGuard = false;
  private lastUrl = window.location.href;

  @state()
  private updateAvailable = false;

  private _onNavigation = (event: Event) => {
    const detail = event instanceof CustomEvent
      ? event.detail as { oldUrl: string; newUrl: string }
      : { oldUrl: this.lastUrl, newUrl: window.location.href };

    this.handleNavigationChange(detail.oldUrl, detail.newUrl);
  };

  private handleNavigationChange(oldUrlValue: string, newUrlValue: string) {
    const oldUrl = new URL(oldUrlValue, window.location.origin);
    const newUrl = new URL(newUrlValue, window.location.origin);

    this.lastUrl = newUrl.toString();

    if (this.suppressNavigationGuard || oldUrl.pathname === newUrl.pathname) {
      return;
    }

    // Check if PreviewService has unsaved changes
    if (this.previewService.hasUnsavedChanges() && !(window as any).isSavingPlayable) {
      // If navigating away from preview, show confirmation
      if (oldUrl.pathname.startsWith("/preview") && !newUrl.pathname.startsWith("/preview")) {
        if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
          this.suppressNavigationGuard = true;
          window.history.pushState({}, "", `${oldUrl.pathname}${oldUrl.search}${oldUrl.hash}`);
          window.dispatchEvent(
            new CustomEvent(getNavigationEventName(), {
              detail: { oldUrl: newUrl.toString(), newUrl: oldUrl.toString() },
            })
          );
          setTimeout(() => {
            this.suppressNavigationGuard = false;
          }, 0);
        }
      }
    }
  };

  async connectedCallback() {
    super.connectedCallback();
    
    console.log('🔧 Initializing PlayableTools...');
    
    // Add global navigation guard for unsaved changes
    window.addEventListener("popstate", this._onNavigation);
    window.addEventListener(getNavigationEventName(), this._onNavigation as EventListener);
    
    // Initialize version checking
    await this.initializeVersionService();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this._onNavigation);
    window.removeEventListener(getNavigationEventName(), this._onNavigation as EventListener);
    this.versionService.destroy();
  }

  private async initializeVersionService(): Promise<void> {
    try {
      // Initialize the version service
      await this.versionService.initialize();
      
      // Log current version to console
      const currentVersion = this.versionService.getCurrentVersion();
      if (currentVersion) {
        console.log(`🚀 Playable Ads Tools v${currentVersion.version}`);
        console.log(`📅 Build time: ${new Date(currentVersion.buildTime).toLocaleString()}`);
        console.log(`🔧 Build hash: ${currentVersion.hash}`);
        console.log(`${this.versionService.isPWAMode() ? '📱 PWA Mode' : '🌐 Browser Mode'}`);
      }
      
      // Subscribe to update notifications
      this.versionService.onUpdateAvailable((hasUpdate) => {
        this.updateAvailable = hasUpdate;
        if (hasUpdate) {
          console.log('🔄 New version available!');
          this.showUpdateNotification();
        }
      });
    } catch (error) {
      console.warn('Failed to initialize version service:', error);
    }
  }

  private showUpdateNotification(): void {
    this.requestUpdate();
    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      const notification = this.querySelector('update-notification') as any;
      if (notification?.show) {
        notification.show();
      }
    });
  }

  private async handleReloadRequested(): Promise<void> {
    try {
      await this.versionService.reloadWithCacheClear();
    } catch (error) {
      console.error('Failed to reload app:', error);
      // Fallback to regular reload
      window.location.reload();
    }
  }

  render() {
    return html`
      <router-outlet .defaultLayout="${MainLayout}"></router-outlet>
      ${this.updateAvailable ? html`
        <update-notification @reload-requested=${this.handleReloadRequested}></update-notification>
      ` : ''}
    `;
  }
}
