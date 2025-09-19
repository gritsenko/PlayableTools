import { ComponentBase, customElement, html, property } from "fw";
import * as d3 from "d3";
import "./folder-treemap-view.ts.css";

interface FileNode {
  name: string;
  size: number;
  isDirectory: boolean;
  children?: FileNode[];
  handle?: FileSystemHandle;
}

@customElement("folder-treemap-view")
export class FolderTreemapView extends ComponentBase {
  @property({ type: Array })
  fileTree: FileNode[] = [];
  @property({ type: Number })
  height: number = 400;

  private _resizeHandler?: () => void;

  private _formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private _convertToHierarchy(nodes: FileNode[]): any {
    const root: any = { name: "root", children: [] };

    const processNode = (node: FileNode): any => {
      const d3Node: any = {
        name: node.name,
        value: node.size,
        isDirectory: node.isDirectory
      };

      if (node.children && node.children.length > 0) {
        d3Node.children = node.children.map(processNode);
      }

      return d3Node;
    };

    root.children = nodes.map(processNode);
    return root;
  }

  private _createTreemap() {
    if (this.fileTree.length === 0) return;

    const svg = d3.select("#treemap-svg");
    svg.selectAll("*").remove(); // Clear previous content

    // Determine current width from the SVG bounding box (responsive)
    const svgEl = svg.node() as SVGSVGElement | null;
    const bbox = svgEl?.getBoundingClientRect();
    const width = Math.max(320, Math.floor((bbox?.width ?? 800)));
  const height = this.height || 400; // use provided height for modal fit

    // Make SVG responsive via viewBox
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Convert data to hierarchy
    const hierarchyData = this._convertToHierarchy(this.fileTree);
    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => b.value! - a.value!);

    // Create treemap layout
    const treemap = d3.treemap<any>()
      .size([width, height])
      .paddingInner(1)
      .paddingOuter(2)
      .round(true);

    treemap(root);

    // Draw directory boundaries (internal nodes, excluding the root)
    const directories = root.descendants().filter((d: any) => d.children && d.depth > 0);

    const dirGroup = svg
      .append("g")
      .attr("class", "treemap-directories");

    const dir = dirGroup
      .selectAll("g.dir")
      .data(directories)
      .enter()
      .append("g")
      .attr("class", (d: any) => `dir depth-${d.depth}`)
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    dir.append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("fill", "none")
      .attr("stroke", "#4a90e2")
      .attr("stroke-width", (d: any) => d.depth === 1 ? 2 : 1)
      .style("pointer-events", "none"); // let file cells capture events

    // Native tooltip for directories
    dir.append("title")
      .text((d: any) => `Folder: ${d.data.name}\nSize: ${this._formatSize(d.value ?? 0)}`);

    // Directory labels (name + size) if there's room
    dir.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("font-size", "11px")
      .attr("fill", "#2b6cb0")
      .attr("font-weight", "600")
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 80 || h < 20) return "";
        const name = d.data.name;
        const size = this._formatSize(d.value ?? 0);
        const maxLen = Math.floor(w / 7);
        const label = `${name} (${size})`;
        return label.length > maxLen ? label.slice(0, Math.max(0, maxLen - 1)) + "…" : label;
      });

    // Create groups for file nodes (leaves) - HIDDEN
    // const files = root.leaves();
    // const cell = svg
    //   .append("g")
    //   .attr("class", "treemap-files")
    //   .selectAll("g.cell")
    //   .data(files)
    //   .enter()
    //   .append("g")
    //   .attr("class", "cell")
    //   .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // // Add rectangles for files - HIDDEN
    // cell.append("rect")
    //   .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
    //   .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
    //   .attr("fill", "#7ed321")
    //   .attr("stroke", "#fff")
    //   .attr("stroke-width", 1)
    //   .style("cursor", "pointer")
    //   .on("mouseover", (event: MouseEvent, d: any) => {
    //     d3.select(event.target as SVGRectElement).attr("stroke", "#000").attr("stroke-width", 2);

    //     // Show tooltip
    //     const tooltip = d3.select("body")
    //       .append("div")
    //       .attr("class", "treemap-tooltip")
    //       .style("position", "absolute")
    //       .style("background", "rgba(0, 0, 0, 0.8)")
    //       .style("color", "white")
    //       .style("padding", "8px")
    //       .style("border-radius", "4px")
    //       .style("font-size", "12px")
    //       .style("pointer-events", "none")
    //       .style("z-index", "1000")
    //       .html(`
    //         <strong>${d.data.name}</strong><br>
    //         Size: ${this._formatSize(d.data.value)}<br>
    //         Type: File
    //       `);

    //     tooltip
    //       .style("left", (event.pageX + 10) + "px")
    //       .style("top", (event.pageY - 10) + "px");
    //   })
    //   .on("mouseout", (event: MouseEvent) => {
    //     d3.select(event.target as SVGRectElement).attr("stroke", "#fff").attr("stroke-width", 1);
    //     d3.selectAll(".treemap-tooltip").remove();
    //   });

    // // Add text labels for larger rectangles - HIDDEN
    // cell.append("text")
    //   .selectAll("tspan")
    //   .data((d: any) => {
    //     const width = d.x1 - d.x0;
    //     const height = d.y1 - d.y0;
    //     if (width < 60 || height < 20) return []; // Don't show text if too small

    //     const name = d.data.name;
    //     const maxLength = Math.floor(width / 6); // Approximate character width
    //     return name.length > maxLength ? [name.substring(0, maxLength) + "..."] : [name];
    //   })
    //   .enter()
    //   .append("tspan")
    //   .attr("x", 4)
    //   .attr("y", (_: any, i: number) => 13 + i * 12)
    //   .attr("font-size", "11px")
    //   .attr("fill", "white")
    //   .attr("font-weight", "bold")
    //   .text((d: any) => d);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Re-render on resize to keep responsiveness
    this._resizeHandler = () => this._createTreemap();
    window.addEventListener("resize", this._resizeHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = undefined;
    }
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('fileTree') && this.fileTree.length > 0) {
      // Wait for the DOM to update before creating the treemap
      setTimeout(() => this._createTreemap(), 100);
    }
  }

  render() {
    if (this.fileTree.length === 0) {
      return html`<div class="treemap-section">No data to display</div>`;
    }

    return html`
      <div class="treemap-section">
        <div class="treemap-container">
          <svg id="treemap-svg" width="100%" height="${this.height}"></svg>
        </div>
        <div class="treemap-legend">
          <div class="legend-item">
            <div class="legend-color folder"></div>
            <span>Folders</span>
          </div>
        </div>
      </div>
    `;
  }
}