import { ComponentBase, html, inject } from "fw";
import { PlayablePublishService } from "../../services/PlayablePublishService";
import "./playable-publisher.ts.css";

export class PlayablePublisher extends ComponentBase {
  dragActive = false;
  loadedFile: File | null = null;
  isPublishing = false;
  publishProgress = 0;
  
  // Form inputs
  playableTitle = '';
  googlePlayUrl = '';
  appStoreUrl = '';
  customSuffix = 'EN';
  outputDirectory = '';

  // LocalStorage keys
  private readonly STORAGE_KEYS = {
    playableTitle: 'playable-publisher-title',
    googlePlayUrl: 'playable-publisher-google-url',
    appStoreUrl: 'playable-publisher-app-store-url',
    customSuffix: 'playable-publisher-suffix'
  };

  connectedCallback() {
    super.connectedCallback();
    this.loadFromLocalStorage();
  }

  render() {
    return html`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it
            for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>

        <!-- Form inputs -->
        <div class="form-section" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0;">Playable Configuration</h3>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <small style="color: #666; font-style: italic;">Data is saved automatically</small>
              <button @click=${this._clearStoredData} class="clear-button" type="button">
                Clear Saved Data
              </button>
            </div>
          </div>
          
          <div class="form-row">
            <label>
              Playable Title:
              <input
                type="text"
                .value=${this.playableTitle}
                @input=${(e: Event) => {
                  this.updateField('playableTitle', (e.target as HTMLInputElement).value);
                }}
                placeholder="e.g., GoH_PBCustomHero3D"
                style="width: 300px; margin-left: 10px;"
              />
            </label>
          </div>
          
          <div class="form-row">
            <label>
              Google Play URL:
              <input
                type="url"
                .value=${this.googlePlayUrl}
                @input=${(e: Event) => {
                  this.updateField('googlePlayUrl', (e.target as HTMLInputElement).value);
                }}
                placeholder="https://play.google.com/store/apps/details?id=..."
                style="width: 400px; margin-left: 10px;"
              />
            </label>
          </div>
          
          <div class="form-row">
            <label>
              App Store URL:
              <input
                type="url"
                .value=${this.appStoreUrl}
                @input=${(e: Event) => {
                  this.updateField('appStoreUrl', (e.target as HTMLInputElement).value);
                }}
                placeholder="https://apps.apple.com/app/..."
                style="width: 400px; margin-left: 10px;"
              />
            </label>
          </div>
          
          <div class="form-row">
            <label>
              Custom Suffix:
              <input
                type="text"
                .value=${this.customSuffix}
                @input=${(e: Event) => {
                  this.updateField('customSuffix', (e.target as HTMLInputElement).value);
                }}
                placeholder="EN"
                style="width: 100px; margin-left: 10px;"
              />
            </label>
          </div>
        </div>

        ${!this.loadedFile
          ? html`
              <div
                class="dropzone ${this.dragActive ? "dragover" : ""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your .html file here or</p>
                <label>
                  Select file
                  <input
                    type="file"
                    accept=".html"
                    @change=${this._onFileChange}
                  />
                </label>
              </div>
            `
          : html`
              <div style="margin-top:1rem;color:#0078d4">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size / 1024).toFixed(2)} KB)

                ${this.isPublishing
                  ? html`
                      <div class="progress-container">
                        <div class="progress-text">Publishing... ${Math.round(this.publishProgress)}%</div>
                        <div class="progress-bar-background">
                          <div 
                            class="progress-bar-fill"
                            style="width: ${this.publishProgress}%;"
                          ></div>
                        </div>
                      </div>
                    `
                  : html`
                      <div>
                        <button @click=${this._publishPlayable} ?disabled=${!this.playableTitle}>
                          Publish
                        </button>
                        <button @click=${this._resetFile}>Cancel</button>
                      </div>
                    `}
              </div>
            `}
      </div>
    `;
  }
  @inject(PlayablePublishService) playablePublishService!: PlayablePublishService;

  _onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragActive = true;
    this.requestUpdate();
  }

  _onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
  }

  _onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this._processFile(files[0]);
    }
  }

  _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this._processFile(file);
    }
  }

  _processFile(file: File) {
    if (file && file.name.endsWith(".html")) {
      this.loadedFile = file;
      this.requestUpdate();
      const event = new CustomEvent("file-selected", { detail: file });
      this.dispatchEvent(event);
    } else {
      alert("Please select a valid .html file.");
    }
  }

  _resetFile() {
    this.loadedFile = null;
    this.requestUpdate();
  }

  async _publishPlayable() {
    if (!this.loadedFile || !this.playableTitle) {
      alert('Please provide a playable title and select a file.');
      return;
    }

    try {
      this.isPublishing = true;
      this.publishProgress = 0;
      this.requestUpdate();

      // Request output directory
      this.publishProgress = 10;
      this.requestUpdate();
      
      const outputDir = await this.playablePublishService.requestOutputDirectory();
      
      // Read file content
      this.publishProgress = 20;
      this.requestUpdate();
      
      const htmlContent = await this._readFileContent(this.loadedFile);
      
      // Prepare options
      const options = {
        name: this.playableTitle,
        title: this.playableTitle,
        googlePlayUrl: this.googlePlayUrl,
        appStoreUrl: this.appStoreUrl,
        suffix: this.customSuffix,
        outputDirectory: outputDir,
        onProgress: (progress: number) => {
          this.publishProgress = progress;
          this.requestUpdate();
        }
      };

      this.publishProgress = 30;
      this.requestUpdate();

      // Process all platforms
      await this.playablePublishService.processAllPlatforms(htmlContent, options);
      
      this.publishProgress = 100;
      this.requestUpdate();

      // Show success message
      setTimeout(() => {
        alert(`Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.`);
        this.isPublishing = false;
        this.publishProgress = 0;
        this.requestUpdate();
      }, 500);

    } catch (error) {
      console.error('Publishing failed:', error);
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Add browser compatibility hint for File System API errors
      if (errorMessage.includes('File System Access API is not supported')) {
        errorMessage += '\n\nFor best results, please use Chrome 86+, Edge 86+, or another browser that supports the File System Access API.';
      }
      
      alert(`Publishing failed: ${errorMessage}`);
      this.isPublishing = false;
      this.publishProgress = 0;
      this.requestUpdate();
    }
  }

  private _readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Loads saved form data from localStorage
   */
  private loadFromLocalStorage() {
    this.playableTitle = localStorage.getItem(this.STORAGE_KEYS.playableTitle) || '';
    this.googlePlayUrl = localStorage.getItem(this.STORAGE_KEYS.googlePlayUrl) || '';
    this.appStoreUrl = localStorage.getItem(this.STORAGE_KEYS.appStoreUrl) || '';
    this.customSuffix = localStorage.getItem(this.STORAGE_KEYS.customSuffix) || 'EN';
    
    console.log('PlayablePublisher: Loaded data from localStorage', {
      playableTitle: this.playableTitle,
      googlePlayUrl: this.googlePlayUrl,
      appStoreUrl: this.appStoreUrl,
      customSuffix: this.customSuffix
    });
    
    this.requestUpdate();
  }

  /**
   * Saves form data to localStorage
   */
  private saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEYS.playableTitle, this.playableTitle);
    localStorage.setItem(this.STORAGE_KEYS.googlePlayUrl, this.googlePlayUrl);
    localStorage.setItem(this.STORAGE_KEYS.appStoreUrl, this.appStoreUrl);
    localStorage.setItem(this.STORAGE_KEYS.customSuffix, this.customSuffix);
  }

  /**
   * Updates a form field and saves to localStorage
   */
  private updateField(field: keyof typeof this.STORAGE_KEYS, value: string) {
    switch (field) {
      case 'playableTitle':
        this.playableTitle = value;
        break;
      case 'googlePlayUrl':
        this.googlePlayUrl = value;
        break;
      case 'appStoreUrl':
        this.appStoreUrl = value;
        break;
      case 'customSuffix':
        this.customSuffix = value;
        break;
    }
    this.saveToLocalStorage();
    this.requestUpdate();
  }

  /**
   * Clears all stored form data
   */
  private _clearStoredData() {
    // Clear localStorage
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset form fields to defaults
    this.playableTitle = '';
    this.googlePlayUrl = '';
    this.appStoreUrl = '';
    this.customSuffix = 'EN';
    
    this.requestUpdate();
  }
}

customElements.define("playable-publisher", PlayablePublisher);
