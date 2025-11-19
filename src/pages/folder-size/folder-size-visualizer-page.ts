import { ComponentBase, customElement, html, route, state } from "fw";
import "./folder-tree-view";
import "./folder-treemap-view";
import "./folder-sunburst-view";

// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
}

interface FileNode {
  name: string;
  size: number;
  isDirectory: boolean;
  children?: FileNode[];
  handle?: FileSystemHandle;
}

@customElement("folder-size-visualizer-page")
@route("/folder-size-visualizer", {
  title: "Folder Size Visualizer",
  description: "Analyze and visualize the size structure of local folders using the File System API.",
})
export class FolderSizeVisualizerPage extends ComponentBase {
  @state()
  private fileTree: FileNode[] = [];

  @state()
  private processing = false;

  @state()
  private errorMessage = "";

  @state()
  private totalSize = 0;

  @state()
  private isSupported = false;

  @state()
  private selectedFolderName = "";

  @state()
  private treemapOpen = false;

  @state()
  private sunburstOpen = false;

  @state()
  private sunburstHeight = 600;


  connectedCallback() {
    super.connectedCallback();
    this._checkBrowserSupport();
  }

  // Treemap open handler removed - treemap action replaced by Sunburst

  private _onOpenSunburst = () => {
    this.sunburstHeight = Math.max(480, Math.floor(window.innerHeight - 96));
    this.sunburstOpen = true;
    window.addEventListener('resize', this._onResizeSunburst);
    window.addEventListener('keydown', this._onEscClose);
  };

  private _onCloseTreemap = () => {
    this.treemapOpen = false;
    window.removeEventListener('resize', this._onResizeTreemap);
    window.removeEventListener('keydown', this._onEscClose);
  };

  private _onCloseSunburst = () => {
    this.sunburstOpen = false;
    window.removeEventListener('resize', this._onResizeSunburst);
    window.removeEventListener('keydown', this._onEscClose);
  };

  private _onResizeTreemap = () => {
    // treemap is not actively used in UI; keep handler for completeness
    return;
  };

  private _onResizeSunburst = () => {
    if (this.sunburstOpen) {
      this.sunburstHeight = Math.max(480, Math.floor(window.innerHeight - 96));
    }
  };

  private _onEscClose = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    if (this.sunburstOpen) this._onCloseSunburst();
    else if (this.treemapOpen) this._onCloseTreemap();
  };

  private _checkBrowserSupport() {
    // Check if File System Access API is supported
    this.isSupported = 'showDirectoryPicker' in window;
  }

  private _onSelectFolder = async () => {
    if (!this.isSupported) {
      this.errorMessage = "File System API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.";
      return;
    }

    try {
      // @ts-ignore - TypeScript doesn't have types for File System Access API yet
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });
      console.log('Selected directory:', dirHandle.name);
      await this._handleDirectory(dirHandle);
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        this.errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      }
    }
  };

  private async _handleDirectory(dirHandle: FileSystemDirectoryHandle) {
    this.processing = true;
    this.errorMessage = "";
    this.fileTree = [];
    this.totalSize = 0;
    this.selectedFolderName = dirHandle.name;

    try {
      console.log('Processing directory:', dirHandle.name);
      const tree = await this._buildFileTree(dirHandle);
      console.log('Built tree:', tree);
      this.fileTree = tree.children || [];
      console.log('File tree children:', this.fileTree);
      this.totalSize = tree.size;
    } catch (error) {
      console.error('Error processing directory:', error);
      this.errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    } finally {
      this.processing = false;
      // Create treemap after data is processed
      this.requestUpdate();
    }
  }

  private async _buildFileTree(dirHandle: FileSystemDirectoryHandle): Promise<FileNode> {
    const root: FileNode = {
      name: dirHandle.name,
      size: 0,
      isDirectory: true,
      children: [],
      handle: dirHandle
    };

    console.log('Building tree for directory:', dirHandle.name);

    try {
      const entries: [string, FileSystemHandle][] = [];
      for await (const entry of dirHandle.entries()) {
        entries.push(entry);
      }
      console.log('Found', entries.length, 'entries in', dirHandle.name);

      for (const [name, handle] of entries) {
        console.log('Processing entry:', name, 'type:', handle.kind);
        try {
          if (handle.kind === 'file') {
            const fileHandle = handle as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const fileNode: FileNode = {
              name: name,
              size: file.size,
              isDirectory: false,
              handle: handle
            };
            root.children!.push(fileNode);
            console.log('Added file:', name, 'size:', file.size);
          } else if (handle.kind === 'directory') {
            const subDirHandle = handle as FileSystemDirectoryHandle;
            console.log('Processing subdirectory:', name);
            try {
              const dirNode = await this._buildFileTree(subDirHandle);
              root.children!.push(dirNode);
              console.log('Added directory:', name, 'children:', dirNode.children?.length || 0);
            } catch (dirError) {
              console.warn('Could not read subdirectory:', name, dirError);
              // Add the directory anyway, even if we can't read its contents
              const dirNode: FileNode = {
                name: name,
                size: 0,
                isDirectory: true,
                children: [],
                handle: handle
              };
              root.children!.push(dirNode);
            }
          }
        } catch (entryError) {
          console.warn('Could not process entry:', name, entryError);
        }
      }
    } catch (error) {
      console.error('Error reading directory entries:', error);
      throw error;
    }

    // Calculate directory sizes
    this._calculateDirectorySizes(root);
    console.log('Final tree for', dirHandle.name, ':', root);
    return root;
  }

  private _calculateDirectorySizes(node: FileNode): number {
    if (!node.isDirectory) return node.size;

    let total = 0;
    if (node.children) {
      for (const child of node.children) {
        total += this._calculateDirectorySizes(child);
      }
    }
    node.size = total;
    return total;
  }

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  render() {
    return html`
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Folder Size Visualizer</h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-6">
          Select a local folder to visualize the size structure of its contents.
        </p>

        ${!this.isSupported ? html`
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-6 rounded-r text-yellow-700 dark:text-yellow-300">
            <strong>Browser Compatibility:</strong> This feature requires a Chromium-based browser (Chrome, Edge, etc.) with File System Access API support.
          </div>
        ` : ''}

        ${this.fileTree.length > 0 ? html`
          <div class="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div class="flex-1 w-full">
              <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                  class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                  @click=${this._onSelectFolder}
                  ?disabled=${!this.isSupported || this.processing}
                >
                  ${this.processing ? 'Analyzing...' : 'Select Folder'}
                </button>
                ${this.selectedFolderName ? html`
                  <div class="mt-4 text-slate-700 dark:text-slate-300">
                    Selected: <strong>${this.selectedFolderName}</strong>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="w-full md:w-auto flex justify-center">
              <div class="w-[360px] h-[360px] bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden relative group" @click=${this._onOpenSunburst} title="Open Sunburst (Full Screen)">
                <folder-sunburst-view .fileTree=${this.fileTree} preview .previewStretch=${true} .previewSize=${360} .hideLabels=${true} .hideTooltip=${true}></folder-sunburst-view>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">Click to expand</span>
                </div>
              </div>
            </div>
          </div>
        ` : html`
          <div class="bg-white dark:bg-slate-900 p-6 md:p-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
            <button
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              @click=${this._onSelectFolder}
              ?disabled=${!this.isSupported || this.processing}
            >
              ${this.processing ? 'Analyzing...' : 'Select Folder'}
            </button>
            ${this.selectedFolderName ? html`
              <div class="mt-4 text-slate-700 dark:text-slate-300">
                Selected: <strong>${this.selectedFolderName}</strong>
              </div>
            ` : ''}
          </div>
        `}

        ${this.processing ? html`
          <div class="mt-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <div class="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4"></div>
            Analyzing folder structure...
          </div>
        ` : ''}

        ${this.errorMessage ? html`
          <div class="mt-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r text-red-700 dark:text-red-300">${this.errorMessage}</div>
        ` : ''}

        ${this.fileTree.length > 0 ? html`
          <div class="mt-8">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Total Size: ${this._formatSize(this.totalSize)}</h3>

            <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <folder-tree-view .fileTree=${this.fileTree}></folder-tree-view>
            </div>

            ${this.sunburstOpen ? html`
              <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click=${this._onCloseSunburst}>
                <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" @click=${(e: Event) => e.stopPropagation()}>
                  <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Folder Size Sunburst</h3>
                    <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" aria-label="Close" @click=${this._onCloseSunburst}>
                      <span class="material-icons-outlined">close</span>
                    </button>
                  </div>
                  <div class="flex-1 overflow-auto p-4">
                    <folder-sunburst-view .fileTree=${this.fileTree} .height=${this.sunburstHeight}></folder-sunburst-view>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}