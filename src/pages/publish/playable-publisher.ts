import { ComponentBase, html, inject } from "fw";
import { PlayablePublishService } from "../../services/PlayablePublishService";
import "./playable-publisher.ts.css";

export class PlayablePublisher extends ComponentBase {
  dragActive = false;
  loadedFile: File | null = null;
  isPublishing = false;
  publishProgress = 0;
  currentPlatform: string | null = null;
  publishStartTime: number | null = null;
  publishElapsed: string | null = null;

  // Form inputs
  playableTitle = '';
  googlePlayUrl = '';
  appStoreUrl = '';
  customSuffix = 'EN';
  outputDirectory = '';

  // Platform checklist state
  availablePlatforms: string[] = [];
  selectedPlatforms: string[] = [];

  // LocalStorage keys
  private readonly STORAGE_KEYS = {
    playableTitle: 'playable-publisher-title',
    googlePlayUrl: 'playable-publisher-google-url',
    appStoreUrl: 'playable-publisher-app-store-url',
    customSuffix: 'playable-publisher-suffix',
    selectedPlatforms: 'playable-publisher-selected-platforms',
  };

  connectedCallback() {
    super.connectedCallback();
    this.loadFromLocalStorage();
    // Load available platforms from service
    if (this.playablePublishService && typeof this.playablePublishService.getAvailablePlatforms === 'function') {
      this.availablePlatforms = this.playablePublishService.getAvailablePlatforms();
      // If no selectedPlatforms loaded, default to all
      if (!this.selectedPlatforms || this.selectedPlatforms.length === 0) {
        this.selectedPlatforms = [...this.availablePlatforms];
      }
    }
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

        ${!this.loadedFile
          ? html`
              <div
                class="dropzone ${this.dragActive ? "dragover" : ""}"
                @dragover=${this._onDragOver}
                @dragleave=${this._onDragLeave}
                @drop=${this._onDrop}
              >
                <p>Drop your .html file here or</p>
                <label class="file-select-button">
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
              <div class="file-loaded-info">
                <strong>File loaded:</strong> ${this.loadedFile.name}
                (${(this.loadedFile.size / 1024).toFixed(2)} KB)

                ${this.isPublishing
                  ? html`
                      <div class="progress-container">
                        <div class="progress-text">
                          Publishing... ${Math.round(this.publishProgress)}%
                          ${this.currentPlatform ? html`<span style="margin-left:1em;">(${this.currentPlatform})</span>` : ''}
                        </div>
                        <div class="progress-bar-background">
                          <div 
                            class="progress-bar-fill"
                            style="width: ${this.publishProgress}%;"
                          ></div>
                        </div>
                      </div>
                    `
                  : null}
              </div>
            `}

        <!-- Form inputs: only show when file is loaded -->
        ${this.loadedFile ? html`
          <div class="form-section compact-form" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; font-size: 1.1rem;">Playable Configuration</h3>
            </div>
            <div class="form-row compact-row">
              <label for="playableTitle">Playable Title:</label>
              <input
                id="playableTitle"
                type="text"
                .value=${this.playableTitle}
                @input=${(e: Event) => {
                  this.updateField('playableTitle', (e.target as HTMLInputElement).value);
                }}
                placeholder="e.g., GoH_PBCustomHero3D"
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="googlePlayUrl">Google Play URL:</label>
              <input
                id="googlePlayUrl"
                type="url"
                .value=${this.googlePlayUrl}
                @input=${(e: Event) => {
                  this.updateField('googlePlayUrl', (e.target as HTMLInputElement).value);
                }}
                placeholder="https://play.google.com/store/apps/details?id=..."
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="appStoreUrl">App Store URL:</label>
              <input
                id="appStoreUrl"
                type="url"
                .value=${this.appStoreUrl}
                @input=${(e: Event) => {
                  this.updateField('appStoreUrl', (e.target as HTMLInputElement).value);
                }}
                placeholder="https://apps.apple.com/app/..."
                style="margin-left: 8px;"
              />
            </div>
            <div class="form-row compact-row">
              <label for="customSuffix">Custom Suffix:</label>
              <input
                id="customSuffix"
                type="text"
                .value=${this.customSuffix}
                @input=${(e: Event) => {
                  this.updateField('customSuffix', (e.target as HTMLInputElement).value);
                }}
                placeholder="EN"
                style="width: 60px; margin-left: 8px;"
              />
            </div>

            <!-- Platform checklist -->
            <div class="form-row compact-row platform-section">
              <label class="platform-label">Platforms:</label>
              <div class="platform-content">
                <div class="platform-actions">
                  <a href="#" @click=${this._selectAllPlatforms} class="platform-link">Select all</a>
                  <a href="#" @click=${this._clearAllPlatforms} class="platform-link">Clear all</a>
                </div>
                <div class="platform-grid">
                  ${this.availablePlatforms.map(platform => html`
                    <label class="platform-checkbox">
                      <input
                        type="checkbox"
                        .checked=${this.selectedPlatforms.includes(platform)}
                        @change=${(e: Event) => this._onPlatformCheckboxChange(e, platform)}
                      />
                      <span>${platform}</span>
                    </label>
                  `)}
                </div>
              </div>
            </div>
          </div>
        ` : null}

        <!-- Publish/Cancel buttons below the form -->
        <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
          ${this.loadedFile && this.playableTitle && !this.isPublishing ? html`
            <button 
              @click=${this._publishPlayable}
              style="margin-right: 0.5rem;"
              ?disabled=${!this.selectedPlatforms.length}
            >
              Publish
            </button>
          ` : null}
          ${this.loadedFile && !this.isPublishing ? html`
            <button 
              @click=${this._resetFile}
            >
              Cancel
            </button>
          ` : null}
        </div>
      </div>
    `;
  }
  /**
   * Handle platform checkbox change
   */
  private _onPlatformCheckboxChange(e: Event, platform: string) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedPlatforms.includes(platform)) {
        this.selectedPlatforms = [...this.selectedPlatforms, platform];
      }
    } else {
      this.selectedPlatforms = this.selectedPlatforms.filter(p => p !== platform);
    }
    this.saveToLocalStorage();
    this.requestUpdate();
  }

  /**
   * Select all platforms
   */
  private _selectAllPlatforms(e: Event) {
    e.preventDefault();
    this.selectedPlatforms = [...this.availablePlatforms];
    this.saveToLocalStorage();
    this.requestUpdate();
  }

  /**
   * Clear all platforms
   */
  private _clearAllPlatforms(e: Event) {
    e.preventDefault();
    this.selectedPlatforms = [];
    this.saveToLocalStorage();
    this.requestUpdate();
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
    if (!this.selectedPlatforms || this.selectedPlatforms.length === 0) {
      alert('Please select at least one platform to publish.');
      return;
    }

    try {
      this.isPublishing = true;
      this.publishProgress = 0;
      this.currentPlatform = null;
      this.publishElapsed = null;
      this.requestUpdate();

      // Request output directory
      this.publishProgress = 10;
      this.requestUpdate();
      const outputDir = await this.playablePublishService.requestOutputDirectory();

      // Start elapsed time after user selects folder
      this.publishStartTime = Date.now();

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
        onProgress: (progress: number, platform?: string) => {
          this.publishProgress = progress;
          if (platform) this.currentPlatform = platform;
          this.requestUpdate();
        },
        selectedPlatforms: [...this.selectedPlatforms],
      };

      this.publishProgress = 30;
      this.requestUpdate();

      // Process only selected platforms
      await this.playablePublishService.processAllPlatforms(htmlContent, options);
      this.publishProgress = 100;
      this.currentPlatform = null;
      // Calculate elapsed time
      if (this.publishStartTime) {
        const elapsedMs = Date.now() - this.publishStartTime;
        this.publishElapsed = this._formatElapsed(elapsedMs);
      }
      this.requestUpdate();

      // Show success message
      setTimeout(() => {
        let msg = `Publishing completed successfully! Files have been saved to the selected directory with subfolders for each platform.`;
        if (this.publishElapsed) {
          msg += `\n\nElapsed time: ${this.publishElapsed}`;
        }
        alert(msg);
        this.isPublishing = false;
        this.publishProgress = 0;
        this.publishElapsed = null;
        this.publishStartTime = null;
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

  /**
   * Formats elapsed time in ms to human readable string
   */
  private _formatElapsed(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    if (min > 0) return `${min}m ${s}s`;
    return `${s}s`;
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

    // Load selected platforms
    const selectedPlatformsStr = localStorage.getItem(this.STORAGE_KEYS.selectedPlatforms);
    if (selectedPlatformsStr) {
      try {
        const arr = JSON.parse(selectedPlatformsStr);
        if (Array.isArray(arr)) {
          this.selectedPlatforms = arr;
        }
      } catch {}
    }

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
    localStorage.setItem(this.STORAGE_KEYS.selectedPlatforms, JSON.stringify(this.selectedPlatforms));
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
}

customElements.define("playable-publisher", PlayablePublisher);
