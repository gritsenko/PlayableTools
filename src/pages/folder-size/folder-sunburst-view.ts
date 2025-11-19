import { ComponentBase, customElement, html, property } from "fw";
import * as d3 from "d3";


interface FileNode {
  name: string;
  size: number;
  isDirectory: boolean;
  children?: FileNode[];
  handle?: FileSystemHandle;
}

@customElement("folder-sunburst-view")
export class FolderSunburstView extends ComponentBase {
  @property({ type: Array })
  fileTree: FileNode[] = [];

  @property({ type: Number })
  height: number = 400;

  @property({ type: Boolean })
  preview: boolean = false;

  @property({ type: Number })
  previewSize: number = 140;

  @property({ type: Boolean })
  previewStretch: boolean = false;

  @property({ type: Boolean })
  hideLabels: boolean = false;

  @property({ type: Boolean })
  hideTooltip: boolean = false;

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Keep the original hierarchy so we can navigate back to initial root
  private _originalHierarchy: any | null = null;
  // Current node used as root for the sunburst (d3 hierarchy node)
  private _currentRootNode: any | null = null;
  // Store path to current root as array of names
  private _currentRootPath: string[] = [];
  // When user drills into a subtree, this holds the data object used to build a fresh hierarchy for rendering
  private _currentRootData: any | null = null;

  private _convertToHierarchy(nodes: FileNode[]) {
    const root: any = { name: 'root', children: [] };
    const processNode = (node: FileNode) => {
      const d: any = { name: node.name };
      // Only set value for leaves (files). For directories, rely on d3.sum to aggregate children.
      if (!node.children || node.children.length === 0) {
        d.value = node.size;
      } else {
        d.children = node.children.map(processNode);
      }
      return d;
    };
    root.children = nodes.map(processNode);
    return root;
  }

  private _createSunburst() {
    if (!this.fileTree || this.fileTree.length === 0) return;

  // Use the container element local to this component instance so multiple instances can render
  const hostEl = (this as unknown as HTMLElement);
  const containerEl = hostEl.querySelector('.sunburst-container') as Element | null;
  if (!containerEl) return;
  const container = d3.select(containerEl);
  container.selectAll('*').remove();

  const containerRect = containerEl.getBoundingClientRect();
  // If measured width/height are 0 (e.g. not yet laid out), fall back to sensible defaults
  const measuredWidth = Math.floor(containerRect.width) || (this.preview ? this.previewSize : 320);
  const measuredHeight = Math.floor(containerRect.height) || (this.preview ? this.previewSize : (this.height || 400));
  const width = this.preview ? (this.previewStretch ? Math.max(320, measuredWidth) : this.previewSize) : Math.max(320, measuredWidth);
  // Use measured container height so diagram fits inside modal; ensure a reasonable minimum
  const height = this.preview ? this.previewSize : Math.max(320, measuredHeight);
  const radius = Math.min(width, height) / 2;

    const svg = container
      .append('svg')
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      // use explicit numeric width to avoid '0' or '0px' from CSS layout race; preserveAspectRatio keeps it responsive
      .attr('width', `${width}`)
      .attr('height', `${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('class', 'sunburst-svg');

    const hierarchyData = this._convertToHierarchy(this.fileTree);
    const fullRoot = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Save original full hierarchy reference once
    if (!this._originalHierarchy) {
      this._originalHierarchy = fullRoot;
      this._currentRootPath = [fullRoot.data.name];
      this._currentRootNode = fullRoot;
    }

    // Build a map from data object -> fullRoot node to compute paths later
    const dataNodeMap = new WeakMap<any, any>();
    fullRoot.descendants().forEach((n: any) => dataNodeMap.set(n.data, n));

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    // If a subtree has been selected, build a fresh d3.hierarchy from its data so the diagram is rebuilt
    const dataToRender = this._currentRootData || fullRoot.data;
    const renderRoot = d3.hierarchy(dataToRender)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    partition(renderRoot as any);

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => d.y0)
      .outerRadius((d: any) => d.y1);

    const color = d3.scaleOrdinal<string, string>(d3.schemeCategory10 as unknown as readonly string[]);

  const g = svg.append('g');
  const self = this;

    // Create a single tooltip appended to document.body so it won't be clipped by container
    d3.select('body').select('#sunburst-tooltip-body').remove();
    const bodyTooltip = d3.select('body')
      .append('div')
      .attr('id', 'sunburst-tooltip-body')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('z-index', '20000')
      .style('background', 'rgba(15, 23, 42, 0.9)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('box-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1)')
      .style('font-size', '12px')
      .style('line-height', '1.4')
      .style('max-width', '320px')
      .style('word-break', 'break-word')
      .style('backdrop-filter', 'blur(4px)');

    g.selectAll('path')
      .data(renderRoot.descendants().filter((d: any) => d.depth > 0))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d: any) => color(((d.children ? d : d.parent).data.name)) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', this.preview ? 'default' : 'pointer')
      .on('mouseover', function(_event: any, d: any) {
        // 'this' is the path element; set its opacity
        try { d3.select(this).style('opacity', '0.8'); } catch {}
        if (self.preview || self.hideTooltip) return; // don't show tooltip in preview or when hidden
        bodyTooltip.style('display', 'block')
          .html(`<strong style="display:block;color:#fff;margin-bottom:4px">${d.data.name}</strong><span style="color:#fff">Size: ${self._formatSize(d.value || 0)}</span>`);
      })
      .on('mousemove', (event: any) => {
        if (this.preview || this.hideTooltip) return;
        // Position tooltip near the pointer, taking scroll into account
        const left = (event.pageX || (event.clientX + window.scrollX)) + 12;
        const top = (event.pageY || (event.clientY + window.scrollY)) + 12;
        bodyTooltip.style('left', `${left}px`).style('top', `${top}px`);
      })
  .on('mouseout', function() { try { d3.select(this).style('opacity', '1'); } catch {} ; bodyTooltip.style('display', 'none'); })
      .on('click', (_event: any, d: any) => {
        if (this.preview) return; // disable navigation in preview
        // Only allow diving into directories (nodes that have children)
        const hasChildren = d.data && d.data.children && d.data.children.length > 0;
        if (!hasChildren) return; // prevent opening file items

        // Find the corresponding node in the full hierarchy to compute the full path
        const fullNode = dataNodeMap.get(d.data) || null;
        if (fullNode) {
          this._currentRootNode = fullNode;
          this._currentRootPath = this._computePathForNode(fullNode);
        } else {
          // fallback: compute path from render node
          this._currentRootPath = this._computePathForNode(d);
        }

        // Set the data to render to rebuild the entire diagram scoped to the clicked node
        this._currentRootData = d.data;
        this._createSunburst();
        // Update host render (header/buttons)
        this.requestUpdate();
      });

    // Labels for larger arcs (skip if preview or when hideLabels is true)
    if (!this.preview && !this.hideLabels) {
      const self = this;
      g.selectAll('text')
        .data(renderRoot.descendants().filter((d: any) => {
          // Angular width threshold (radians) and radial thickness threshold (pixels)
          const angular = d.x1 - d.x0;
          const radial = d.y1 - d.y0;
          const midRadius = (d.y0 + d.y1) / 2;
          // approximate arc length = angular * midRadius
          const arcLen = angular * midRadius;
          // show label only if arc length > ~20px and radial thickness > 10px
          return arcLen > 25 && radial > 15;
        }))
        .enter()
        .append('text')
        .attr('transform', (d: any) => {
          const angle = (d.x0 + d.x1) / 2;
          const r = (d.y0 + d.y1) / 2;
          const x = Math.sin(angle) * r;
          const y = -Math.cos(angle) * r;
          // rotate so text aligns with radial direction. Subtract 90 to make 0deg at top.
          let deg = angle * 180 / Math.PI - 90;
          // Keep text upright: flip if upside-down
          if (deg > 90) deg -= 180;
          if (deg < -90) deg += 180;
          return `translate(${x},${y}) rotate(${deg})`;
        })
        // Helper to compute path (array of names) from root to a node
  .attr('text-anchor', 'middle')
  .attr('dy', '0.35em')
  .attr('font-size', '10px')
  .attr('fill', '#fff')
  .attr('pointer-events', 'none')
  .each(function(d: any) {
    // Append name and size as separate tspans for better layout control
    const t = d3.select(this as any);
    t.append('tspan').attr('x', 0).attr('dy', '0').text(d.data.name);
    t.append('tspan')
      .attr('x', 0)
      .attr('dy', '1.05em')
      .attr('font-size', '9px')
      .text(self._formatSize((d && d.value) || 0));
  });
    }

    // Center label showing total
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'text-sm font-bold fill-slate-900 dark:fill-white')
      .text(this._formatSize((renderRoot && renderRoot.value) || 0));
  }


  // Helper to compute path (array of names) from root to a node
  private _computePathForNode(node: any): string[] {
    const path: string[] = [];
    let cur = node;
    while (cur) {
      if (cur.data && cur.data.name) path.unshift(cur.data.name);
      cur = cur.parent;
    }
    return path;
  }


  private _goToRoot() {
    if (!this._originalHierarchy) return;
    // Reset current root data so renderRoot uses the full hierarchy
    this._currentRootNode = this._originalHierarchy;
    this._currentRootPath = this._computePathForNode(this._originalHierarchy);
    this._currentRootData = null;
    this._createSunburst();
    this.requestUpdate();
  }

  private _goUpOne() {
    if (!this._currentRootNode) return;
    const parent = this._currentRootNode.parent;
    if (parent) {
      this._currentRootNode = parent;
      this._currentRootPath = this._computePathForNode(parent);
      // If we're back to the original root, clear _currentRootData so the full tree is rendered
      this._currentRootData = (parent === this._originalHierarchy) ? null : parent.data;
      this._createSunburst();
      this.requestUpdate();
    }
  }

  private _resizeHandler?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this._resizeHandler = () => this._createSunburst();
    window.addEventListener('resize', this._resizeHandler);
    // If data already present when component connects, create immediately (helps preview)
    if (this.fileTree && this.fileTree.length > 0) {
      // small delay to allow layout to settle
      setTimeout(() => this._createSunburst(), 50);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = undefined;
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('fileTree') && this.fileTree.length > 0) {
      setTimeout(() => this._createSunburst(), 50);
    }
  }

  render() {
    if (!this.fileTree || this.fileTree.length === 0) {
      return html`
        <div class="flex flex-col items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
          <span class="material-icons-outlined text-4xl mb-2">data_usage</span>
          <p>No data to display</p>
        </div>
      `;
    }

    const pathDisplay = this._currentRootPath && this._currentRootPath.length ? this._currentRootPath.join(' / ') : '';

    return html`
      <div class="flex flex-col h-full">
        <div class="flex justify-between items-center mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <div class="text-sm font-mono text-slate-700 dark:text-slate-300 truncate flex-1 mr-4" title="${pathDisplay}">
            <span class="text-slate-400 dark:text-slate-500 mr-2">Path:</span>
            ${pathDisplay}
          </div>
          ${!this.preview ? html`
            <div class="flex gap-2 shrink-0">
              <button 
                @click=${() => this._goToRoot()} 
                ?disabled=${!this._originalHierarchy || (this._currentRootData === null)}
                class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-300 shadow-sm"
              >
                Root
              </button>
              <button 
                @click=${() => this._goUpOne()} 
                ?disabled=${!this._currentRootData || (this._currentRootPath.length <= 1)}
                class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1"
              >
                <span class="material-icons-outlined text-[14px]">arrow_upward</span>
                Up
              </button>
            </div>
          ` : ''}
        </div>
        <div class="sunburst-container flex-1 min-h-0 relative flex items-center justify-center overflow-hidden"></div>
      </div>
    `;
  }
}
