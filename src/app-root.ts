import "reflect-metadata";

import "@picocss/pico/css/pico.min.css";
import "./app-root.css";

import { ComponentBase, customElement, html, state } from "./fw";
import "./Layout/nav-menu";
import { MainLayout } from "./Layout/main-layout";
import { VersionService } from "./services/VersionService";
import "./fw/update-notification";

// Eagerly import all files in pages directory
// this will resolve all page components
import.meta.glob("./pages/**/*.ts", { eager: true });

@customElement("app-root")
export class AppRoot extends ComponentBase {
  private versionService = new VersionService();

  @state()
  private updateAvailable = false;

  async connectedCallback() {
    super.connectedCallback();
    
    console.log('🔧 Initializing PlayableTools...');
    
    // Initialize version checking
    await this.initializeVersionService();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
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