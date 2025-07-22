import { ComponentBase, customElement, html, css, state } from "fw";
import { VersionService } from "../services/VersionService";

@customElement("version-checker")
export class VersionChecker extends ComponentBase {
  private versionService = new VersionService();

  @state()
  private isChecking = false;

  @state()
  private lastCheckTime?: Date;

  @state()
  private currentVersion?: string;

  @state()
  private isPWA?: boolean;

  static override useShadowDom = true;

  static styles = css`
    :host {
      display: inline-block;
    }

    .version-checker {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      color: #64748b;
    }

    .check-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .check-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .check-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .version-info {
      font-family: monospace;
      font-size: 11px;
    }

    .status {
      font-weight: 500;
    }

    .status.checking {
      color: #f59e0b;
    }

    .status.up-to-date {
      color: #059669;
    }

    .status.update-available {
      color: #dc2626;
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadCurrentVersion();
  }

  private async loadCurrentVersion(): Promise<void> {
    try {
      await this.versionService.initialize();
      const version = this.versionService.getCurrentVersion();
      this.currentVersion = version?.version || 'unknown';
      this.isPWA = this.versionService.isPWAMode();
    } catch (error) {
      console.warn('Failed to load current version:', error);
    }
  }

  private async handleCheckVersion(): Promise<void> {
    this.isChecking = true;
    
    try {
      const hasUpdate = await this.versionService.checkForUpdates();
      this.lastCheckTime = new Date();
      
      if (hasUpdate) {
        // Dispatch event to notify parent components
        this.dispatchEvent(new CustomEvent('update-available', {
          bubbles: true,
          composed: true,
          detail: { hasUpdate: true }
        }));
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      this.isChecking = false;
    }
  }

  private async handleForceReload(): Promise<void> {
    try {
      await this.versionService.reloadWithCacheClear();
    } catch (error) {
      console.error('Failed to reload:', error);
      window.location.reload();
    }
  }

  render() {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return html`
      <div class="version-checker">
        <div class="version-info">
          v${this.currentVersion || '?'}${this.isPWA ? ' (PWA)' : ''}
        </div>
        
        <button 
          class="check-btn" 
          @click=${this.handleCheckVersion}
          ?disabled=${this.isChecking}
          title="Check for updates"
        >
          ${this.isChecking ? '...' : '↻'}
        </button>

        <button 
          class="check-btn" 
          @click=${this.handleForceReload}
          title="Force reload with cache clear"
        >
          ⟳
        </button>

        ${this.lastCheckTime ? html`
          <div class="status">
            Last check: ${formatTime(this.lastCheckTime)}
          </div>
        ` : ''}
      </div>
    `;
  }
}
