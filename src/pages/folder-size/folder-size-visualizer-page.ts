import { ComponentBase, customElement, html, route, state } from "fw";
import "./folder-size-visualizer-page.ts.css";
import "./folder-tree-view";
import "./folder-treemap-view";

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
  private activeTab = "tree";

  connectedCallback() {
    super.connectedCallback();
    this._checkBrowserSupport();
  }

  private _switchTab(tabName: string) {
    this.activeTab = tabName;

    // Update tab buttons
    const tabButtons = this.shadowRoot?.querySelectorAll('.tab-button');
    tabButtons?.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab panes
    const tabPanes = this.shadowRoot?.querySelectorAll('.tab-pane');
    tabPanes?.forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
  }

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
      <h1>Folder Size Visualizer</h1>
      <p>
        Select a local folder to visualize the size structure of its contents.
      </p>

      ${!this.isSupported ? html`
        <div class="warning">
          <strong>Browser Compatibility:</strong> This feature requires a Chromium-based browser (Chrome, Edge, etc.) with File System Access API support.
        </div>
      ` : ''}

      <div class="folder-picker-container">
        <button
          class="folder-select-button"
          @click=${this._onSelectFolder}
          ?disabled=${!this.isSupported || this.processing}
        >
          ${this.processing ? 'Analyzing...' : 'Select Folder'}
        </button>
        ${this.selectedFolderName ? html`
          <div class="selected-folder">
            Selected: <strong>${this.selectedFolderName}</strong>
          </div>
        ` : ''}
      </div>

      ${this.processing ? html`
        <div class="processing">Analyzing folder structure...</div>
      ` : ''}

      ${this.errorMessage ? html`
        <div class="error">${this.errorMessage}</div>
      ` : ''}

      ${this.fileTree.length > 0 ? html`
        <div class="results">
          <h2>Total Size: ${this._formatSize(this.totalSize)}</h2>

          <div class="visualization-tabs">
            <div class="tab-buttons">
              <button class="tab-button ${this.activeTab === 'tree' ? 'active' : ''}" data-tab="tree" @click=${() => this._switchTab('tree')}>Tree View</button>
              <button class="tab-button ${this.activeTab === 'treemap' ? 'active' : ''}" data-tab="treemap" @click=${() => this._switchTab('treemap')}>Treemap View</button>
            </div>

            <div class="tab-content">
              <div class="tab-pane ${this.activeTab === 'tree' ? 'active' : ''}" id="tree-tab">
                <folder-tree-view .fileTree=${this.fileTree}></folder-tree-view>
              </div>

              <div class="tab-pane ${this.activeTab === 'treemap' ? 'active' : ''}" id="treemap-tab">
                <folder-treemap-view .fileTree=${this.fileTree}></folder-treemap-view>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}