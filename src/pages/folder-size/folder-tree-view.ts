import { ComponentBase, customElement, html, property } from "fw";


interface FileNode {
  name: string;
  size: number;
  isDirectory: boolean;
  children?: FileNode[];
  handle?: FileSystemHandle;
}

@customElement("folder-tree-view")
export class FolderTreeView extends ComponentBase {
  @property({ type: Array })
  fileTree: FileNode[] = [];

  // track which directories are expanded; store paths (unique per node)
  private _expanded = new Set<string>();

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // pathPrefix is used to create a stable id/path for each node (e.g. "root/folder/sub")
  private _renderTree(nodes: FileNode[], level = 0, pathPrefix = '', maxSize = 0): any {
    return nodes.map(node => {
      const nodePath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
      const isExpanded = this._expanded.has(nodePath);
      const nodeTotal = this._nodeTotalSize(node);
      // protect against division by zero
      const pct = maxSize > 0 ? Math.max(0.5, (nodeTotal / maxSize) * 100) : 0.5;

      return html`
        <div class="relative">
          <div class="flex items-center py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded relative group transition-colors" style="padding-left:${level * 12}px">
            <div class="absolute left-0 top-0 bottom-0 bg-primary/5 dark:bg-primary/10 rounded pointer-events-none transition-all duration-300" style="width: ${pct}%" aria-hidden="true"></div>
            
            <div class="relative z-10 flex items-center w-full">
              ${node.isDirectory ? html`
                <button 
                  class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer select-none transition-colors" 
                  @click=${() => this._toggle(nodePath)} 
                  aria-expanded="${isExpanded}"
                >
                  <span class="material-icons-outlined text-[16px] transform transition-transform ${isExpanded ? 'rotate-90' : ''}">chevron_right</span>
                </button>
              ` : html`<span class="w-6"></span>`}

              <span 
                class="flex-1 truncate px-2 cursor-pointer text-sm ${node.isDirectory ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'} flex items-center gap-2" 
                @click=${() => node.isDirectory && this._toggle(nodePath)}
                title="${node.name}"
              >
                <span class="material-icons-outlined text-[18px] ${node.isDirectory ? 'text-yellow-500' : 'text-slate-400'}">
                  ${node.isDirectory ? (isExpanded ? 'folder_open' : 'folder') : 'description'}
                </span>
                ${node.name}
              </span>
              <span class="text-xs font-mono text-slate-500 dark:text-slate-400 px-2 whitespace-nowrap bg-white/50 dark:bg-black/20 rounded ml-2">
                ${this._formatSize(node.size)}
              </span>
            </div>
          </div>

          ${node.isDirectory && isExpanded ? html`
            <div class="border-l border-slate-200 dark:border-slate-700 ml-[11px]">
              ${node.children && node.children.length > 0 
                ? this._renderTree(node.children, level + 1, nodePath, maxSize) 
                : html`<div class="text-xs text-slate-400 italic py-1 pl-8">Empty directory</div>`
              }
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  // compute maximum size in the provided tree (recursively)
  private _getMaxSize(nodes: FileNode[] = []): number {
    let max = 0;
    const walk = (n: FileNode) => {
      const size = this._nodeTotalSize(n);
      if (size > max) max = size;
      if (n.children) n.children.forEach(c => walk(c));
    };
    nodes.forEach(n => walk(n));
    return max;
  }

  // return the total size for a node: prefer node.size if present, otherwise sum children
  private _nodeTotalSize(node: FileNode): number {
    if (!node) return 0;
    if (!node.isDirectory) return node.size || 0;
    if (typeof node.size === 'number' && node.size > 0) return node.size;
    if (!node.children || node.children.length === 0) return node.size || 0;
    return node.children.reduce((sum, c) => sum + this._nodeTotalSize(c), 0);
  }

  private _toggle(path: string) {
    if (this._expanded.has(path)) {
      this._expanded.delete(path);
    } else {
      this._expanded.add(path);
    }
    // trigger re-render
    this.requestUpdate();
  }

  // Return a new array where nodes and their children are sorted by size (descending)
  private _sortNodesDescending(nodes: FileNode[] = []): FileNode[] {
    // Create shallow copies so we don't mutate original data
    const copied = nodes.map(n => ({ ...n }));

    // Recursively sort children first
    copied.forEach(n => {
      if (n.children && n.children.length > 0) {
        n.children = this._sortNodesDescending(n.children);
      }
    });

    // Sort by size descending (largest first)
    copied.sort((a, b) => b.size - a.size);
    return copied;
  }

  render() {
    if (this.fileTree.length === 0) {
      return html`
        <div class="flex flex-col items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
          <span class="material-icons-outlined text-4xl mb-2">data_usage</span>
          <p>No data to display</p>
        </div>
      `;
    }

    const maxSize = this._getMaxSize(this.fileTree);
    return html`
      <div class="overflow-auto h-full pr-2 custom-scrollbar">
        ${this._renderTree(this._sortNodesDescending(this.fileTree), 0, '', maxSize)}
      </div>
    `;
  }
}