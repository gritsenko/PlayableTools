import { ComponentBase, customElement, html, route } from "fw";
import JSZip from 'jszip';

@customElement("spritesheet-maker-page")
@route("/spritesheet-maker", {
  title: "Spritesheet Maker",
  description: "Combine multiple PNG frames into optimized spritesheet PNGs grouped by filename prefix"
})
export class SpritesheetMakerPage extends ComponentBase {
  private dropActive = false;
  private files: File[] = [];
  private generatedSheets: {
    group: string;
    imageUrl: string;
    width: number;
    height: number;
    frameWidth: number;
    frameHeight: number;
    cols: number;
    rows: number;
    downloadUrl: string;
    blob: Blob;
  }[] = [];

  private onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      if (f) this.files.push(f);
    }
    this.generateSheets();
  };

  private handleDrop = (e: DragEvent) => {
    e.preventDefault();
    this.dropActive = false;
    const dtFiles = e.dataTransfer ? e.dataTransfer.files : null;
    this.onFilesSelected(dtFiles);
  };

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    this.dropActive = true;
    this.requestUpdate();
  };

  private handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    this.dropActive = false;
    this.requestUpdate();
  };

  private showFull(sheet: typeof this.generatedSheets[0]) {
    window.open(sheet.imageUrl, '_blank');
  }

  private async downloadAll() {
    const zip = new JSZip();
    for (const sheet of this.generatedSheets) {
      zip.file(`${sheet.group}.png`, sheet.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spritesheets.zip';
    a.click();
    URL.revokeObjectURL(url);
  }

  private async generateSheets() {
    const groups = new Map<string, { file: File; frame: string }[]>();
    for (const file of this.files) {
      const name = file.name.replace(/\.png$/i, '');
      const regex = /(.+?)([._-]*\d+([._-]\d+)*)$/;
      const match = name.match(regex);
      let group: string;
      let frame: string;
      if (match) {
        group = match[1].replace(/[._-]+$/ , '');
        frame = match[2];
      } else {
        group = name;
        frame = '0';
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push({ file, frame });
    }

    this.generatedSheets = [];
    for (const [group, frames] of groups) {
      if (frames.length === 0) continue;
      frames.sort((a, b) => a.frame.localeCompare(b.frame));

      const images: HTMLImageElement[] = [];
      try {
        for (const { file } of frames) {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
          });
          images.push(img);
        }
      } catch (error) {
        console.error(`Error loading images for group ${group}:`, error);
        continue;
      }

      const frameWidth = images[0].width;
      const frameHeight = images[0].height;
      const count = images.length;
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const sheetWidth = cols * frameWidth;
      const sheetHeight = rows * frameHeight;

      const canvas = document.createElement('canvas');
      canvas.width = sheetWidth;
      canvas.height = sheetHeight;
      const ctx = canvas.getContext('2d')!;
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (idx < images.length) {
            ctx.drawImage(images[idx], c * frameWidth, r * frameHeight);
            idx++;
          }
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          const downloadUrl = imageUrl;
          this.generatedSheets.push({
            group,
            imageUrl,
            width: sheetWidth,
            height: sheetHeight,
            frameWidth,
            frameHeight,
            cols,
            rows,
            downloadUrl,
            blob
          });
          this.requestUpdate();
        }
      }, 'image/png');
    }
  }

  render() {
    return html`
      <link rel="stylesheet" href="./spritesheet-maker-page.ts.css">
      <h1>Spritesheet Maker</h1>
      <p>
        Upload or drop multiple PNG files. The tool will group files by prefix (e.g. "01_walk_", "02_run_") and
        create a separate spritesheet for each group. It calculates an optimal rows/columns layout and exports a single
        spritesheet PNG per group. Progress indicators are shown per job.
      </p>

      <div class="uploader">
        <div
          class="dropzone ${this.dropActive ? 'dragover' : ''}"
          @dragover=${this.handleDragOver}
          @dragleave=${this.handleDragLeave}
          @drop=${this.handleDrop}
        >
          <p>Drop PNG files here or</p>
          <label class="file-select-button">
            Select files
            <input id="fileInput" type="file" multiple accept="image/png" @change=${(e: Event) => this.onFilesSelected((e.target as HTMLInputElement).files)} />
          </label>
        </div>
      </div>

      <div class="sheets-container">
        ${this.generatedSheets.length > 0 ? html`
          <div class="download-all">
            <button @click=${this.downloadAll}>Download All as ZIP</button>
          </div>
        ` : ''}
        ${this.generatedSheets.length === 0
          ? html`<div class="empty">No spritesheets generated yet</div>`
          : this.generatedSheets.map((sheet) => html`
              <div class="sheet-item">
                <h3>${sheet.group}</h3>
                <img src="${sheet.imageUrl}" alt="${sheet.group} spritesheet" style="max-width: 200px; cursor: pointer;" @click=${() => this.showFull(sheet)} />
                <p>Size: ${sheet.width} x ${sheet.height} px</p>
                <p>Frame: ${sheet.frameWidth} x ${sheet.frameHeight} px</p>
                <p>Layout: ${sheet.cols} cols x ${sheet.rows} rows</p>
                <a href="${sheet.downloadUrl}" download="${sheet.group}.png">Download</a>
              </div>
            `)}
      </div>
    `;
  }
}
