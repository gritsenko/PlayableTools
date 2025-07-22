import { ComponentBase, customElement, html, property, inject } from "fw";
import { PreviewService } from "../../services/PreviewService";
import "../../assets/pako_inflate.min.js";
import "./playable-previewer.ts.css";

@customElement("playable-previewer")
export class PlayablePreviewer extends ComponentBase {
  @property({ type: String }) githubUrl = "";
  @inject(PreviewService) previewService!: PreviewService;

  pageContent: string = "";
  loading: boolean = false;
  error: string = "";

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

  async updated(changedProps: Map<string, any>) {
    if (changedProps.has("githubUrl") && this.githubUrl) {
      this.loading = true;
      this.error = "";
      this.pageContent = "";
      const rawUrl = this.previewService.githubToRawUrl(this.githubUrl);
      if (!rawUrl) {
        this.error = "Invalid GitHub URL";
        this.loading = false;
        this.requestUpdate();
        return;
      }
      try {
        this.pageContent = await this.previewService.fetchRawContent(rawUrl);
      } catch (err: any) {
        this.error = err.message || String(err);
      }
      this.loading = false;
      this.requestUpdate();
    }
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

  render() {
    const device = this.selectedDevice;
    const width = this.isPortrait ? device.width : device.height;
    const height = this.isPortrait ? device.height : device.width;
    return html`
      <div class="device-controls" style="margin-bottom: 1em; margin-top: 1em; display: flex; align-items: center; gap: 1em;">
        <select @change="${this.handleDeviceChange.bind(this)}" style="margin-bottom: 0;">
          ${this.devices.map((d, i) =>
            d.disabled
              ? html`<option disabled> ${d.name} </option>`
              : html`<option value="${i}" ?selected="${i === this.selectedDeviceIdx}">${d.name}</option>`
          )}
        </select>
        <button @click="${this.toggleOrientation.bind(this)}" style="margin-left: 0;">
          ${this.isPortrait ? "Portrait" : "Landscape"}
        </button>
      </div>
      <div class="phone-simulator">
        <div class="phone-simulator-bg">
          <div class="phone-frame" style="width:${width}px; height:${height}px;">
            ${this.loading
              ? html`<div>Loading...</div>`
              : this.error
              ? html`<div style="color: red;">${this.error}</div>`
              : html`<iframe
                  srcdoc="${this.pageContent}"
                  class="playable-iframe"
                  frameborder="0"
                  allowfullscreen
                  style="width:100%; height:100%; border:none;"
                ></iframe>`}
          </div>
        </div>
      </div>
    `;
  }
}
