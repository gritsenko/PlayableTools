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

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private _renderTree(nodes: FileNode[], level = 0): any {
    return nodes.map(node => {
      return html`
        <div class="tree-node" style="margin-left: ${level * 20}px;">
          <div class="node-info">
            <span class="node-name ${node.isDirectory ? 'directory' : 'file'}">
              ${node.isDirectory ? '📁' : '📄'} ${node.name}
            </span>
            <span class="node-size">${this._formatSize(node.size)}</span>
          </div>
          ${node.isDirectory ? html`<div class="directory-content">${node.children && node.children.length > 0 ? this._renderTree(node.children, level + 1) : html`<div class="empty-directory">(empty)</div>`}</div>` : ''}
        </div>
      `;
    });
  }

  render() {
    if (this.fileTree.length === 0) {
      return html`<div class="tree-container">No data to display</div>`;
    }

    return html`
      <div class="tree-container">
        ${this._renderTree(this.fileTree)}
      </div>
    `;
  }
}