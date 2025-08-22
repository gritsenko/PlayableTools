import { ComponentBase, customElement, html, property, inject, state } from "fw";
import { PreviewService } from "../../services/PreviewService";
import type { PreviewPreset } from "../../services/types";
import "../../assets/pako_inflate.min.js";
import "./playable-previewer.ts.css";

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @property({ type: String }) githubUrl = "";
  @inject(PreviewService) previewService!: PreviewService;

  pageContent: string = "";
  loading: boolean = true;
  error: string = "";
  private uploadedContentUnsubscribe?: () => void;
  private presetUnsubscribe?: () => void;
  @state() private currentPreset: PreviewPreset | null = null;
  @state() private availablePresets: PreviewPreset[] = [];
  @state() private isPresetSwitching: boolean = false;
  @state() private presetSuccessMessage: string = "";

  devices = [
    { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'phone' },
    { name: 'iPhone 14', width: 390, height: 844, type: 'phone' },
    { name: 'iPhone SE', width: 375, height: 667, type: 'phone' },
    { name: 'Google Pixel 7 Pro', width: 412, height: 892, type: 'phone' },
    { name: 'Samsung Galaxy S23 Ultra', width: 384, height: 851, type: 'phone' },
    { name: 'Generic Android', width: 360, height: 800, type: 'phone' },
    { name: '--- Tablets ---', disabled: true },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366, type: 'tablet' },
    { name: 'iPad Air', width: 820, height: 1180, type: 'tablet' },
    { name: 'Samsung Galaxy Tab S8', width: 800, height: 1280, type: 'tablet' },
    { name: 'Generic tablet', width: 768, height: 1024, type: 'tablet' },
  ];
  selectedDeviceIdx: number = 2;
  isPortrait: boolean = true;

  connectedCallback() {
    super.connectedCallback();
    
    console.log(`🎬 PlayablePreviewer connected`);
    
    // Initialize presets
    this.availablePresets = this.previewService.getAvailablePresets();
    this.currentPreset = this.previewService.getCurrentPreset();
    
    console.log(`📋 Available presets:`, this.availablePresets.map(p => p.name));
    console.log(`🎯 Current preset: ${this.currentPreset?.name}`);
    
    // Subscribe to uploaded content changes
    this.uploadedContentUnsubscribe = this.previewService.onUploadedContentChange((content) => {
      if (content) {
        console.log(`📁 Uploaded content changed (${content.length} chars)`);
        this.pageContent = content;
        this.loading = false;
        this.error = "";
        this.requestUpdate();
      } else {
        console.log(`📁 Uploaded content cleared`);
      }
    });
    
    // Subscribe to preset changes
    this.presetUnsubscribe = this.previewService.onPresetChange((preset) => {
      console.log(`🔄 Preset changed to: ${preset?.name}`);
      this.currentPreset = preset;
      this.requestUpdate();
    });
    
    // Check if there's already uploaded content
    const existingContent = this.previewService.getUploadedContent();
    if (existingContent) {
      console.log(`📁 Found existing uploaded content (${existingContent.length} chars)`);
      this.pageContent = existingContent;
      this.loading = false;
      this.requestUpdate();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.uploadedContentUnsubscribe) {
      this.uploadedContentUnsubscribe();
    }
    if (this.presetUnsubscribe) {
      this.presetUnsubscribe();
    }
  }

  async updated(changedProps: Map<string, any>) {
    if (changedProps.has("githubUrl") && this.githubUrl) {
      await this.loadFromGithub();
    }
  }

  private async loadFromGithub() {
    console.log(`🔗 Loading from GitHub: ${this.githubUrl}`);
    this.loading = true;
    this.error = "";
    this.pageContent = "";
    
    const rawUrl = this.previewService.githubToRawUrl(this.githubUrl);
    if (!rawUrl) {
      console.error(`❌ Invalid GitHub URL: ${this.githubUrl}`);
      this.error = "Invalid GitHub URL";
      this.loading = false;
      this.requestUpdate();
      return;
    }
    
    console.log(`📡 Fetching raw content from: ${rawUrl}`);
    
    try {
      const currentPreset = this.previewService.getCurrentPreset();
      console.log(`🔧 Using preset: ${currentPreset?.name}`);
      
      this.pageContent = await this.previewService.fetchRawContent(rawUrl);
      console.log(`✅ Successfully loaded content (${this.pageContent.length} chars) with ${currentPreset?.name} preset`);
    } catch (err: any) {
      console.error(`❌ Failed to load from GitHub:`, err);
      this.error = err.message || String(err);
    }
    
    this.loading = false;
    this.requestUpdate();
  }

  get selectedDevice() {
    return this.devices[this.selectedDeviceIdx] || this.devices[0];
  }

  handleDeviceChange(e: Event) {
    const idx = Number((e.target as HTMLSelectElement).value);
    this.selectedDeviceIdx = idx;
    this.requestUpdate();
  }

  toggleOrientation() {
    this.isPortrait = !this.isPortrait;
    this.requestUpdate();
  }

  async handlePresetChange(e: Event) {
    const presetId = (e.target as HTMLSelectElement).value;
    const preset = this.previewService.getPresetById(presetId);
    
    console.log(`🔄 Preset changing from "${this.currentPreset?.name}" to "${preset?.name}"`);
    
    if (preset) {
      // Show visual feedback
      this.isPresetSwitching = true;
      this.error = "";
      this.requestUpdate();
      
      try {
        console.log(`📋 Applying preset: ${preset.name}`, {
          maxFileSizeMB: preset.maxFileSizeMB,
          injectScripts: preset.injectScripts.length,
          replaceTokens: Object.keys(preset.replaceTokens).length
        });
        
        this.previewService.setCurrentPreset(preset);
        
        // Reprocess existing content with new preset (works for both uploaded and GitHub content)
        console.log(`🔄 Reprocessing existing content with ${preset.name} preset`);
        await this.previewService.reloadContentWithPreset(preset);
        
        console.log(`✅ Preset successfully switched to "${preset.name}"`);
        
        // Show success message briefly
        this.presetSuccessMessage = `✅ Applied ${preset.name} preset`;
        setTimeout(() => {
          this.presetSuccessMessage = "";
          this.requestUpdate();
        }, 3000);
        
      } catch (error) {
        console.error(`❌ Failed to switch preset:`, error);
        this.error = `Failed to apply preset: ${error instanceof Error ? error.message : String(error)}`;
      } finally {
        this.isPresetSwitching = false;
        this.requestUpdate();
      }
    }
  }

  render() {
    const device = this.selectedDevice;
    const width = this.isPortrait ? device.width : device.height;
    const height = this.isPortrait ? device.height : device.width;
    
    return html`
      <!-- Device Controls -->
      <div class="device-controls" style="margin-bottom: 1em; display: flex; align-items: center; gap: 1em; flex-wrap: wrap;">
        <!-- Preset Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="preset-select" style="font-weight: bold; color: #1976d2;">Validator:</label>
          <select 
            id="preset-select"
            @change="${this.handlePresetChange.bind(this)}" 
            style="margin-bottom: 0; min-width: 150px; ${this.isPresetSwitching ? 'opacity: 0.7;' : ''}"
            title="${this.currentPreset?.description || ''}"
            ?disabled="${this.isPresetSwitching}"
          >
            ${this.availablePresets.map(preset =>
              html`<option 
                value="${preset.id}" 
                ?selected="${preset.id === this.currentPreset?.id}"
              >
                ${preset.name}
              </option>`
            )}
          </select>
          ${this.isPresetSwitching ? html`
            <div style="display: flex; align-items: center; gap: 0.5em; color: #1976d2;">
              <div class="preset-spinner"></div>
              <span style="font-size: 0.9em;">Switching...</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Device Selection -->
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label for="device-select" style="font-weight: bold; color: #1976d2;">Device:</label>
          <select id="device-select" @change="${this.handleDeviceChange.bind(this)}" style="margin-bottom: 0;">
            ${this.devices.map((d, i) =>
              d.disabled
                ? html`<option disabled> ${d.name} </option>`
                : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${d.name}</option>`
            )}
          </select>
        </div>
        
        <!-- Orientation Toggle -->
        <button @click="${this.toggleOrientation.bind(this)}" style="margin-left: 0;">
          ${this.isPortrait ? "Portrait" : "Landscape"}
        </button>
        
        <!-- Preset Info -->
        ${this.currentPreset ? html`
          <div style="font-size: 0.9em; color: #666; margin-left: auto; display: flex; align-items: center; gap: 1em;">
            <span>
              Max size: ${this.currentPreset.maxFileSizeMB}MB
              ${this.currentPreset.injectScripts.length > 0 ? html`• Scripts: ${this.currentPreset.injectScripts.length}` : ''}
            </span>
            ${this.presetSuccessMessage ? html`
              <span style="color: #4CAF50; font-weight: bold; animation: fadeInOut 3s ease-in-out;">
                ${this.presetSuccessMessage}
              </span>
            ` : ''}
          </div>
        ` : ''}
      </div>
      
      <!-- Preview Frame -->
      <div class="phone-simulator">
        <div class="phone-simulator-bg">
          <div class="phone-frame" style="width:${width}px; height:${height}px;">
            ${this.loading
              ? html`
                  <div class="spinner-container">
                    <div class="spinner"></div>
                    <div class="loading-message" style="margin-top: 1em; font-size: 1.1em; color: #bdbdbd;">
                      ${this.isPresetSwitching ? `Applying ${this.currentPreset?.name} preset...` : 'Loading playable content...'}
                    </div>
                  </div>
                `
              : this.error
              ? html`
                  <div style="color: ${this.error.includes('re-upload') ? '#ff9800' : 'red'}; padding: 1em; background: ${this.error.includes('re-upload') ? '#fff3e0' : '#ffebee'}; border-radius: 4px; margin: 1em;">
                    ${this.error.includes('re-upload') ? '⚠️' : '❌'} ${this.error}
                  </div>
                `
              : this.pageContent
              ? html`
                  <div style="position: relative; width: 100%; height: 100%;">
                    <iframe
                      srcdoc="${this.pageContent}"
                      class="playable-iframe"
                      frameborder="0"
                      allowfullscreen
                      style="width:100%; height:100%; border:none;"
                    ></iframe>
                    ${this.isPresetSwitching ? html`
                      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(25, 118, 210, 0.1); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(1px);">
                        <div style="background: rgba(25, 118, 210, 0.9); color: white; padding: 1em 2em; border-radius: 8px; display: flex; align-items: center; gap: 1em;">
                          <div class="preset-spinner"></div>
                          <span>Applying ${this.currentPreset?.name} preset...</span>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `
              : html`<div style="padding: 1em; color: #666; text-align: center;">
                  Ready to preview content.
                </div>`}
          </div>
        </div>
      </div>
    `;
  }
}