import { ComponentBase, customElement, html, inject, state } from "fw";
import { PortfolioService, type PlayableAdData } from "../../services/PortfolioService";

@customElement("save-creative-modal")
export class SaveCreativeModal extends ComponentBase {
  @inject(PortfolioService) portfolioService!: PortfolioService;

  @state() private isOpen: boolean = false;
  @state() private creatives: PlayableAdData[] = [];
  @state() private selectedId: string | null = null;
  @state() private isNew: boolean = true;
  
  @state() private creativeTitle: string = "";
  @state() private tags: string = "";
  @state() private screenshotUrl: string = "";
  
  private screenshotBlob: Blob | null = null;
  private htmlContent: string = "";
  private fileName: string = "";
  
  @state() private isSaving: boolean = false;
  @state() private error: string = "";
  @state() private isAuthenticated: boolean = false;
  @state() private isLoading: boolean = false;

  async show(screenshot: Blob, htmlContent: string, fileName: string) {
    this.screenshotBlob = screenshot;
    this.htmlContent = htmlContent;
    this.fileName = fileName;
    this.screenshotUrl = URL.createObjectURL(screenshot);
    
    this.isOpen = true;
    this.isNew = true;
    this.selectedId = null;
    this.creativeTitle = this.extractTitle(htmlContent) || fileName.replace(/\.html$/i, "");
    this.tags = "";
    this.error = "";
    
    await this.checkAuthentication();
  }

  private async checkAuthentication() {
    try {
      await this.portfolioService.initialize();
      await this.portfolioService.waitForAuthState();
      const user = this.portfolioService.getCurrentUser();
      if (user && this.portfolioService.isAuthenticated()) {
        this.isAuthenticated = true;
        this.requestUpdate();
        await this.loadCreatives();
      } else {
        this.isAuthenticated = false;
        this.requestUpdate();
        // Render Google Sign-In button after update
        await this.updateComplete;
        this.renderGoogleButton();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      this.error = error instanceof Error ? error.message : "An error occurred";
    }
  }

  private renderGoogleButton() {
    const container = (this as any).querySelector('#modal-google-signin-button');
    if (container) {
      this.portfolioService.renderSignInButton(
        "modal-google-signin-button",
        async (user) => {
          this.isAuthenticated = true;
          this.requestUpdate();
          console.log("Authenticated with Google as:", user.uid);
          await this.loadCreatives();
        },
        (error) => {
          console.error("Google authentication error:", error);
          this.error = error instanceof Error ? error.message : "Google authentication failed";
          this.isAuthenticated = false;
        }
      );
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (this.isOpen && !this.isAuthenticated && !this.isLoading) {
      this.renderGoogleButton();
    }
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : "";
  }

  private async loadCreatives() {
    this.isLoading = true;
    try {
      if (this.portfolioService.isAuthenticated()) {
        this.creatives = await this.portfolioService.getPlayables();
      }
    } catch (e) {
      console.error("Failed to load creatives", e);
      this.error = e instanceof Error ? e.message : "Failed to load creatives";
    } finally {
      this.isLoading = false;
    }
  }

  close() {
    this.isOpen = false;
    if (this.screenshotUrl) {
      URL.revokeObjectURL(this.screenshotUrl);
      this.screenshotUrl = "";
    }
  }

  private selectNew() {
    this.isNew = true;
    this.selectedId = null;
    this.creativeTitle = this.extractTitle(this.htmlContent) || this.fileName.replace(/\.html$/i, "");
    this.tags = "";
  }

  private selectCreative(c: PlayableAdData) {
    this.isNew = false;
    this.selectedId = c.id;
    this.creativeTitle = c.title;
    this.tags = c.tags.join(" ");
  }

  private async save() {
    if (!this.creativeTitle) {
      this.error = "Title is required";
      return;
    }

    this.isSaving = true;
    this.error = "";

    try {
      const tagList = this.tags.split(/[\s,]+/).filter(t => t.length > 0);
      
      if (this.isNew) {
        // Create new creative with variation
        const playable = await this.portfolioService.uploadPlayable(
          this.creativeTitle,
          this.htmlContent,
          "",
          "",
          tagList
        );
        
        // Upload screenshot if available
        if (this.screenshotBlob && playable.creativeId && playable.variationId) {
          const jpgBlob = await this.convertBlobToJpg(this.screenshotBlob);
          await this.portfolioService.uploadScreenshot(
            jpgBlob,
            playable.creativeId,
            playable.variationId
          );
        }
      } else if (this.selectedId) {
        // Update existing creative
        const match = this.selectedId.match(/^(\d+)/);
        if (match) {
          const creativeId = parseInt(match[1], 10);
          await this.portfolioService.updateCreative(
            creativeId,
            this.creativeTitle,
            "",
            "",
            tagList
          );
        }
      }

      (window as any).isSavingPlayable = true;
      this.close();
      window.location.reload();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.isSaving = false;
    }
  }

  private async convertBlobToJpg(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (jpgBlob) => {
              if (jpgBlob) {
                resolve(jpgBlob);
              } else {
                reject(new Error("Failed to convert to JPG"));
              }
            },
            "image/jpeg",
            0.85 // Quality 85%
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  }

  render() {
    if (!this.isOpen) return null;

    return html`
      <div class="modal-backdrop" @click=${this.close}>
        <div class="modal-container" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>Save Creative to Library</h3>
            <button class="close-btn" @click=${this.close}>&times;</button>
          </div>
          <div class="modal-body">
            ${!this.isAuthenticated ? html`
              <div class="auth-prompt">
                <p>Sign in to manage and share your playable ads. Your playables will be stored securely.</p>
                <div id="modal-google-signin-button" class="google-btn-container"></div>
                ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
              </div>
            ` : html`
              <div class="modal-grid">
                <!-- Left Side: List -->
                <div class="list-section">
                  <h5>Select Existing Creative</h5>
                  <div class="list-group">
                    <div class="list-item ${this.isNew ? 'selected' : ''}" @click=${this.selectNew}>
                      <div class="new-item">
                        <span class="plus-icon">+</span>
                        <strong>New Playable Ad</strong>
                      </div>
                    </div>
                    ${this.creatives.map(c => html`
                      <div class="list-item ${this.selectedId === c.id ? 'selected' : ''}" @click=${() => this.selectCreative(c)}>
                        <strong>${c.title}</strong><br>
                        <small>${c.tags.join(' ')}</small>
                      </div>
                    `)}
                  </div>
                </div>
                <!-- Right Side: Form -->
                <div class="form-section">
                  <h5>${this.isNew ? 'New Creative' : 'Update Creative'}</h5>
                  <label>
                    Title
                    <input type="text" .value=${this.creativeTitle} @input=${(e: any) => this.creativeTitle = e.target.value} ?disabled=${!this.isNew}>
                  </label>
                  <label>
                    Tags
                    <input type="text" .value=${this.tags} @input=${(e: any) => this.tags = e.target.value} placeholder="space or comma separated">
                  </label>
                  <label>Preview</label>
                  <div class="preview-container">
                    ${this.screenshotUrl ? html`
                      <img src=${this.screenshotUrl} class="preview-image">
                    ` : html`<div class="no-preview">No preview available</div>`}
                  </div>
                  ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
                </div>
              </div>
            `}
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" @click=${this.close} ?disabled=${this.isSaving}>Cancel</button>
            ${this.isAuthenticated ? html`<button class="primary-btn" @click=${this.save} ?disabled=${this.isSaving}>${this.isSaving ? 'Saving...' : 'Save Creative'}</button>` : ''}
          </div>
        </div>
      </div>
      
      <style>
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(2px);
        }
        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: #64748b;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .close-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .list-section {
          border-right: 1px solid #e2e8f0;
          padding-right: 1.5rem;
        }
        .list-section h5, .form-section h5 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .list-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 400px;
          overflow-y: auto;
        }
        .list-item {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .list-item:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .list-item.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .list-item strong {
          color: #1e293b;
        }
        .list-item small {
          color: #64748b;
        }
        .new-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .plus-icon {
          font-size: 1.25rem;
          color: #3b82f6;
          font-weight: bold;
        }
        .form-section label {
          display: block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .form-section input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .form-section input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-section input:disabled {
          background: #f3f4f6;
          color: #6b7280;
        }
        .preview-container {
          margin-top: 0.5rem;
        }
        .preview-image {
          width: 100%;
          max-height: 250px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .no-preview {
          padding: 2rem;
          text-align: center;
          color: #64748b;
          background: #f8fafc;
          border-radius: 8px;
        }
        .auth-prompt {
          text-align: center;
          padding: 3rem 2rem;
        }
        .auth-prompt p {
          margin-bottom: 1.5rem;
          color: #64748b;
        }
        .primary-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .primary-btn:hover:not(:disabled) {
          background: #2563eb;
        }
        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .secondary-btn {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .secondary-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .secondary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fef2f2;
          border-radius: 6px;
        }
        .google-btn-container {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }
        
        @media (prefers-color-scheme: dark) {
          .modal-container {
            background: #1e293b;
          }
          .modal-header {
            border-color: #334155;
          }
          .modal-header h3 {
            color: #f1f5f9;
          }
          .close-btn {
            color: #94a3b8;
          }
          .close-btn:hover {
            background: #334155;
            color: #f1f5f9;
          }
          .modal-footer {
            border-color: #334155;
            background: #0f172a;
          }
          .list-section {
            border-color: #334155;
          }
          .list-section h5, .form-section h5 {
            color: #94a3b8;
          }
          .list-item {
            border-color: #334155;
          }
          .list-item:hover {
            background: #334155;
            border-color: #475569;
          }
          .list-item.selected {
            background: rgba(59, 130, 246, 0.15);
          }
          .list-item strong {
            color: #f1f5f9;
          }
          .form-section label {
            color: #e2e8f0;
          }
          .form-section input {
            background: #0f172a;
            border-color: #334155;
            color: #f1f5f9;
          }
          .form-section input:disabled {
            background: #1e293b;
            color: #64748b;
          }
          .preview-image {
            border-color: #334155;
          }
          .no-preview {
            background: #0f172a;
            color: #94a3b8;
          }
          .auth-prompt p {
            color: #94a3b8;
          }
          .secondary-btn {
            background: #334155;
            color: #f1f5f9;
            border-color: #475569;
          }
          .secondary-btn:hover:not(:disabled) {
            background: #475569;
          }
          .error-message {
            background: rgba(220, 38, 38, 0.15);
          }
        }
      </style>
    `;
  }
}
