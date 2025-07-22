import { ComponentBase, customElement, html, css, state } from "fw";

@customElement("update-notification")
export class UpdateNotification extends ComponentBase {
  @state()
  private visible = false;

  static override useShadowDom = true;

  static styles = css`
    :host {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notification {
      background: #3b82f6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
    }

    .notification.visible {
      transform: translateX(0);
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .notification-message {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-primary {
      background: white;
      color: #3b82f6;
    }

    .btn-primary:hover {
      background: #f8fafc;
    }

    .icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  `;

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  private handleReload(): void {
    this.dispatchEvent(new CustomEvent('reload-requested', {
      bubbles: true,
      composed: true
    }));
  }

  private handleDismiss(): void {
    this.hide();
  }

  render() {
    return html`
      <div class="notification ${this.visible ? 'visible' : ''}">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <div class="notification-content">
          <div class="notification-title">Update Available</div>
          <div class="notification-message">
            A new version of the app is available. Reload to get the latest features and fixes.
          </div>
        </div>
        <div class="notification-actions">
          <button class="btn" @click=${this.handleDismiss}>
            Later
          </button>
          <button class="btn btn-primary" @click=${this.handleReload}>
            Reload
          </button>
        </div>
      </div>
    `;
  }
}
