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
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Spritesheet Maker</h1>
          <div class="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Upload or drop multiple PNG files. The tool will group files by prefix (e.g. "01_walk_", "02_run_") and
            create a separate spritesheet for each group. It calculates an optimal rows/columns layout and exports a single
            spritesheet PNG per group.
          </div>
        </div>

        <div class="mb-8">
          <div
            class="border-2 border-dashed rounded-lg p-6 md:p-12 text-center transition-colors ${
              this.dropActive
                ? "border-primary bg-primary/5"
                : "border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }"
            @dragover=${this.handleDragOver}
            @dragleave=${this.handleDragLeave}
            @drop=${this.handleDrop}
          >
            <p class="text-slate-600 dark:text-slate-400 mb-4">Drop PNG files here or</p>
            <label class="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
              Select files
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/png"
                @change=${(e: Event) => this.onFilesSelected((e.target as HTMLInputElement).files)}
                class="hidden"
              />
            </label>
          </div>
        </div>

        <div class="space-y-6">
          ${this.generatedSheets.length > 0 ? html`
            <div class="flex justify-end mb-4">
              <button 
                @click=${this.downloadAll}
                class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <span class="material-icons-outlined">download</span>
                Download All as ZIP
              </button>
            </div>
          ` : ''}
          
          ${this.generatedSheets.length === 0
            ? html`
                <div class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span class="material-icons-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">image</span>
                  <p class="text-slate-500 dark:text-slate-400">No spritesheets generated yet</p>
                </div>
              `
            : html`
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${this.generatedSheets.map((sheet) => html`
                    <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 class="font-semibold text-slate-900 dark:text-white truncate" title="${sheet.group}">${sheet.group}</h3>
                        <a 
                          href="${sheet.downloadUrl}" 
                          download="${sheet.group}.png"
                          class="text-primary hover:text-primary-600 p-1 rounded hover:bg-primary/10 transition-colors"
                          title="Download PNG"
                        >
                          <span class="material-icons-outlined">download</span>
                        </a>
                      </div>
                      
                      <div class="p-4">
                        <div 
                          class="bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-center overflow-hidden h-48 cursor-zoom-in"
                          @click=${() => this.showFull(sheet)}
                        >
                          <img 
                            src="${sheet.imageUrl}" 
                            alt="${sheet.group} spritesheet" 
                            class="max-w-full max-h-full object-contain" 
                          />
                        </div>
                        
                        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div class="text-slate-500 dark:text-slate-400">Sheet Size:</div>
                          <div class="text-slate-900 dark:text-white font-mono text-right">${sheet.width} x ${sheet.height} px</div>
                          
                          <div class="text-slate-500 dark:text-slate-400">Frame Size:</div>
                          <div class="text-slate-900 dark:text-white font-mono text-right">${sheet.frameWidth} x ${sheet.frameHeight} px</div>
                          
                          <div class="text-slate-500 dark:text-slate-400">Layout:</div>
                          <div class="text-slate-900 dark:text-white font-mono text-right">${sheet.cols} cols x ${sheet.rows} rows</div>
                        </div>
                      </div>
                    </div>
                  `)}
                </div>
              `}
        </div>
      </div>
    `;
  }
}
