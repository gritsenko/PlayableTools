import { ComponentBase, customElement, html, css, state } from "fw";

@customElement("update-notification")
export class UpdateNotification extends ComponentBase {
  @state()
  private visible = false;

  static override useShadowDom = true;

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .notification {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transform: translateY(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .notification.visible {
      transform: translateY(0);
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      justify-content: center;
      max-width: 600px;
    }

    .notification-message {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .reload-btn {
      background: white;
      color: #3b82f6;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .reload-btn:hover {
      background: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .reload-icon {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    @media (max-width: 768px) {
      .notification {
        padding: 10px 16px;
        text-align: center;
      }
      
      .notification-content {
        flex-direction: column;
        gap: 8px;
      }
      
      .notification-message {
        font-size: 13px;
      }
      
      .reload-btn {
        padding: 6px 12px;
        font-size: 12px;
      }
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

  render() {
    return html`
      <div class="notification ${this.visible ? 'visible' : ''}">
        <div class="notification-content">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <div class="notification-message">
            A new version is available with latest features and improvements
          </div>
          <button class="reload-btn" @click=${this.handleReload}>
            <svg class="reload-icon" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Reload App
          </button>
        </div>
      </div>
    `;
  }
}
