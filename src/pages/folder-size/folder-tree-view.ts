import { ComponentBase, customElement, html, property } from "fw";
import "./folder-tree-view.ts.css";

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
        <div class="tree-node" style="margin-left:${level * 12}px">
          <div class="node-info">
            <div class="size-bar" style="width: ${pct}%" aria-hidden="true"></div>
            ${node.isDirectory ? html`
              <button class="toggle-btn" @click=${() => this._toggle(nodePath)} aria-expanded="${isExpanded}">
                ${isExpanded ? '▾' : '▸'}
              </button>
            ` : html`<span class="file-spacer"></span>`}

            <span class="node-name ${node.isDirectory ? 'directory' : 'file'}" @click=${() => node.isDirectory && this._toggle(nodePath)}>
              ${node.isDirectory ? '📁' : '📄'} ${node.name}
            </span>
            <span class="node-size">${this._formatSize(node.size)}</span>
          </div>

            ${node.isDirectory ? html`
            <div class="directory-content">
              ${node.children && node.children.length > 0 ? (isExpanded ? this._renderTree(node.children, level + 1, nodePath, maxSize) : html``) : html`<div class="empty-directory">(empty)</div>`}
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
      return html`<div class="tree-container">No data to display</div>`;
    }

    const maxSize = this._getMaxSize(this.fileTree);
    return html`
      <div class="tree-container">
        ${this._renderTree(this._sortNodesDescending(this.fileTree), 0, '', maxSize)}
      </div>
    `;
  }
}