import "./video2sprite-page.ts.css";
import { ComponentBase, customElement, html, route, state, inject } from "fw";
import {
  Video2SpriteService,
  type Video2SpriteOptions,
  type ProcessingProgress,
} from "../../services/Video2SpriteService";
import back1 from "../../../media/backgrounds/back1.jpg";
import back2 from "../../../media/backgrounds/back2.jpg";
import back3 from "../../../media/backgrounds/back3.jpg";
import back4 from "../../../media/backgrounds/back4.jpg";
import back1Svg from "../../../media/backgrounds/back1.svg";
import back2Svg from "../../../media/backgrounds/back2.svg";
import checkboard from "../../../media/backgrounds/checkboard.svg";
import darkCheckboard from "../../../media/backgrounds/dark-checkboard.svg";

@customElement("video2sprite-page")
@route("/video2sprite", {
  title: "Video to Sprite Converter",
  description:
    "Convert MP4 videos to PNG sprite sequences for game development",
})
export class Video2spritePage extends ComponentBase {
  @state()
  private selectedBackground = "";

  @state()
  private isDragOver = false;

  @state()
  private isProcessing = false;

  @state()
  private hasSelectedFile = false;

  @state()
  private processingProgress: ProcessingProgress | null = null;

  @state()
  private selectedColor = "";

  @inject(Video2SpriteService)
  private video2SpriteService!: Video2SpriteService;

  private selectedFile: File | null = null;

  private backgrounds = [
    checkboard,
    darkCheckboard,
    back1,
    back2,
    back3,
    back4,
    back1Svg,
    back2Svg,
  ];

  private originalImageData: ImageData | null = null;

  private selectBackground(bg: string) {
    this.selectedBackground = bg;
  }

  private async displayFirstFrame(file: File): Promise<void> {
    const video = document.createElement("video");
    const canvas = document.getElementById(
      "previewCanvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    video.preload = "metadata";
    video.muted = true; // Prevent autoplay issues
    video.playsInline = true; // Better mobile support

    return new Promise((resolve) => {
      let hasResolved = false;
      let drawWidth = 0,
        drawHeight = 0,
        offsetX = 0,
        offsetY = 0;

      const cleanup = () => {
        if (!hasResolved) {
          hasResolved = true;
          // Delay blob URL revocation to ensure all operations are complete
          setTimeout(() => {
            URL.revokeObjectURL(videoUrl);
          }, 100);
          resolve();
        }
      };

      video.onloadedmetadata = () => {
        const containerWidth = 600;
        const containerHeight = 600;
        const videoAspect = video.videoWidth / video.videoHeight;
        const containerAspect = containerWidth / containerHeight;

        if (videoAspect > containerAspect) {
          // Video is wider, fit by width
          drawWidth = containerWidth;
          drawHeight = containerWidth / videoAspect;
          offsetX = 0;
          offsetY = (containerHeight - drawHeight) / 2;
        } else {
          // Video is taller, fit by height
          drawHeight = containerHeight;
          drawWidth = containerHeight * videoAspect;
          offsetX = (containerWidth - drawWidth) / 2;
          offsetY = 0;
        }

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        video.currentTime = 0;
      };

      video.onseeked = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Store the original image data for chroma key processing
        this.originalImageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        cleanup();
      };

      video.onerror = () => {
        cleanup();
      };

      // Add timeout as fallback
      setTimeout(() => {
        cleanup();
      }, 10000); // 10 second timeout
    });
  }

  private async startProcessing() {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.processingProgress = { stage: "loading", progress: 0 };

    try {
      const options: Video2SpriteOptions = {
        frameRate: 10,
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.9,
        spriteColumns: 8,
      };

      // Add chroma key options if color is selected
      if (this.selectedColor) {
        const colorMatch = this.selectedColor.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
        );
        if (colorMatch) {
          const toleranceInput = document.getElementById(
            "toleranceInput"
          ) as HTMLInputElement;
          const featherInput = document.getElementById(
            "featherInput"
          ) as HTMLInputElement;
          const contractInput = document.getElementById(
            "contractPx"
          ) as HTMLInputElement;
          const edgeBlurInput = document.getElementById(
            "edgeBlur"
          ) as HTMLInputElement;

          options.chromaKey = {
            keyColor: {
              r: parseInt(colorMatch[1]),
              g: parseInt(colorMatch[2]),
              b: parseInt(colorMatch[3]),
              a: 255,
            },
            tolerance: parseInt(toleranceInput?.value || "32"),
            feather: parseInt(featherInput?.value || "8"),
            contract: parseInt(contractInput?.value || "1"),
            edgeBlur: parseInt(edgeBlurInput?.value || "1"),
          };
        }
      }

      const result = await this.video2SpriteService.processVideoToSprites(
        this.selectedFile,
        options,
        (progress) => {
          this.processingProgress = progress;
        }
      );

      // Create download link for the sprite sheet
      const url = URL.createObjectURL(result.spriteSheet);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.selectedFile.name.replace(".mp4", "")}_sprites.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Delay cleanup to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      console.log("Sprite sheet generated:", result);
    } catch (error) {
      console.error("Error processing video:", error);
      alert(
        `Error processing video: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      this.isProcessing = false;
      this.processingProgress = null;
    }
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  private handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  private handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleClick() {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileInput?.click();
  }

  private handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private async handleFileSelection(file: File) {
    if (file.type !== "video/mp4") {
      alert("Please select an MP4 video file.");
      return;
    }

    // Clear previous data
    this.originalImageData = null;
    this.selectedColor = "";

    // Display first frame on preview canvas
    await this.displayFirstFrame(file);

    // Hide upload panel
    this.hasSelectedFile = true;

    // Store the file for later processing
    this.selectedFile = file;

    // Apply chroma key if color is already selected
    if (this.selectedColor) {
      this.processCurrentFrame();
    }
  }

  private handleCanvasClick(event: MouseEvent) {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Pick color from original image data, not processed canvas
    if (this.originalImageData) {
      const pixelIndex =
        (Math.floor(y) * this.originalImageData.width + Math.floor(x)) * 4;
      if (
        pixelIndex >= 0 &&
        pixelIndex < this.originalImageData.data.length - 3
      ) {
        const r = this.originalImageData.data[pixelIndex];
        const g = this.originalImageData.data[pixelIndex + 1];
        const b = this.originalImageData.data[pixelIndex + 2];
        const a = this.originalImageData.data[pixelIndex + 3];
        this.selectedColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      }
    } else {
      // Fallback to canvas if original data not available
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imageData.data;
        this.selectedColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      }
    }

    // Apply chroma key processing after picking color
    this.processCurrentFrame();
  }

  private processCurrentFrame() {
    const canvas = document.getElementById(
      "previewCanvas"
    ) as HTMLCanvasElement;
    if (!canvas || !this.originalImageData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use original image data instead of current canvas content
    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height
    );

    // Parse selected color
    if (!this.selectedColor) return;
    const colorMatch = this.selectedColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (!colorMatch) return;

    const keyColor = {
      r: parseInt(colorMatch[1]),
      g: parseInt(colorMatch[2]),
      b: parseInt(colorMatch[3]),
      a: 255,
    };

    // Get current parameter values
    const toleranceInput = document.getElementById(
      "toleranceInput"
    ) as HTMLInputElement;
    const featherInput = document.getElementById(
      "featherInput"
    ) as HTMLInputElement;
    const contractInput = document.getElementById(
      "contractPx"
    ) as HTMLInputElement;
    const edgeBlurInput = document.getElementById(
      "edgeBlur"
    ) as HTMLInputElement;

    const tolerance = parseInt(toleranceInput?.value || "32");
    const feather = parseInt(featherInput?.value || "8");
    const contract = parseInt(contractInput?.value || "1");
    const edgeBlur = parseInt(edgeBlurInput?.value || "1");

    // Update value displays
    const toleranceValue = document.getElementById(
      "toleranceValue"
    ) as HTMLSpanElement;
    const featherValue = document.getElementById(
      "featherValue"
    ) as HTMLSpanElement;
    const contractValue = document.getElementById(
      "contractValue"
    ) as HTMLSpanElement;
    const edgeBlurValue = document.getElementById(
      "edgeBlurValue"
    ) as HTMLSpanElement;

    if (toleranceValue) toleranceValue.textContent = tolerance.toString();
    if (featherValue) featherValue.textContent = feather.toString();
    if (contractValue) contractValue.textContent = contract.toString();
    if (edgeBlurValue) edgeBlurValue.textContent = edgeBlur.toString();

    // Apply chroma key
    const processedData = this.video2SpriteService.applyChromaKey(
      imageData,
      keyColor,
      tolerance,
      feather,
      contract,
      edgeBlur
    );

    // Draw processed frame back to canvas
    ctx.putImageData(processedData, 0, 0);
  }

  private updateValueDisplays() {
    // Update all value displays to match current input values
    const toleranceInput = document.getElementById(
      "toleranceInput"
    ) as HTMLInputElement;
    const featherInput = document.getElementById(
      "featherInput"
    ) as HTMLInputElement;
    const contractInput = document.getElementById(
      "contractPx"
    ) as HTMLInputElement;
    const edgeBlurInput = document.getElementById(
      "edgeBlur"
    ) as HTMLInputElement;

    const toleranceValue = document.getElementById(
      "toleranceValue"
    ) as HTMLSpanElement;
    const featherValue = document.getElementById(
      "featherValue"
    ) as HTMLSpanElement;
    const contractValue = document.getElementById(
      "contractValue"
    ) as HTMLSpanElement;
    const edgeBlurValue = document.getElementById(
      "edgeBlurValue"
    ) as HTMLSpanElement;

    if (toleranceValue && toleranceInput)
      toleranceValue.textContent = toleranceInput.value;
    if (featherValue && featherInput)
      featherValue.textContent = featherInput.value;
    if (contractValue && contractInput)
      contractValue.textContent = contractInput.value;
    if (edgeBlurValue && edgeBlurInput)
      edgeBlurValue.textContent = edgeBlurInput.value;
  }

  render() {
    // Initialize value displays on first render
    setTimeout(() => this.updateValueDisplays(), 0);

    return html`
      <h1>Video to Sprite Converter</h1>
      <p>
        Convert your MP4 videos into PNG sprite sequences for game development
        and animation.
      </p>
      <div class="page-layout">
        <div class="left-column">
          <div id="preview-container">
            <div class="background-container">
              ${this.selectedBackground
                ? html`<img src=${this.selectedBackground} alt="background" />`
                : ""}
            </div>
            <canvas
              id="previewCanvas"
              aria-label="First frame preview canvas"
              @click=${this.handleCanvasClick}
            ></canvas>

            ${!this.hasSelectedFile && !this.isProcessing
              ? html`
                  <div
                    id="upload-area"
                    class=${this.isDragOver ? "drag-over" : ""}
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${this.handleDrop}
                    @click=${this.handleClick}
                  >
                    <div class="upload-icon">📹</div>
                    <div class="upload-text">Drop your MP4 video here</div>
                    <div class="upload-subtext">or click to browse files</div>
                    <input
                      id="file-input"
                      type="file"
                      accept=".mp4,video/mp4"
                      @change=${this.handleFileInputChange}
                    />
                  </div>
                `
              : ""}
            ${this.isProcessing
              ? html`
                  <div class="processing-overlay">
                    <div class="processing-content">
                      <div class="processing-spinner">⏳</div>
                      <div class="processing-text">
                        ${this.processingProgress?.stage === "loading"
                          ? "Loading video..."
                          : this.processingProgress?.stage === "processing"
                          ? "Extracting frames..."
                          : "Generating sprite sheet..."}
                      </div>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          style="width: ${this.processingProgress?.progress ||
                          0}%"
                        ></div>
                      </div>
                      ${this.processingProgress?.currentFrame &&
                      this.processingProgress?.totalFrames
                        ? html`<div class="progress-text">
                            Frame ${this.processingProgress.currentFrame} of
                            ${this.processingProgress.totalFrames}
                          </div>`
                        : ""}
                    </div>
                  </div>
                `
              : ""}
          </div>

          <div id="background-presets">
            ${this.backgrounds.map(
              (bg) =>
                html`<button
                  class="preset-btn"
                  @click=${() => this.selectBackground(bg)}
                >
                  <img src=${bg} alt="background" width="40" height="40" />
                </button>`
            )}
          </div>

          ${this.hasSelectedFile && !this.isProcessing
            ? html`
                <div id="process-controls">
                  <button @click=${this.startProcessing} class="process-btn">
                    Save PNG sequence
                  </button>
                </div>
              `
            : ""}
        </div>

        <div class="right-column">
          <label for="colorSwatch">Background Color:</label>
          <p class="hint">
            Click the preview to pick a color to remove (chroma key)
          </p>
          <div
            id="colorSwatch"
            class="color-swatch"
            title="Selected color"
            style="background-color: ${this.selectedColor};"
          ></div>

          <label for="toleranceInput"
            >Tolerance: <span id="toleranceValue">32</span></label
          >
          <p class="hint">
            How similar colors are considered for removal (0-255). Higher = more
            colors removed
          </p>
          <input
            id="toleranceInput"
            type="number"
            min="0"
            max="255"
            value="32"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const range = document.getElementById(
                "toleranceRange"
              ) as HTMLInputElement;
              const valueDisplay = document.getElementById(
                "toleranceValue"
              ) as HTMLSpanElement;
              if (range) range.value = target.value;
              if (valueDisplay) valueDisplay.textContent = target.value;
              this.processCurrentFrame();
            }}
          />
          <input
            id="toleranceRange"
            type="range"
            min="0"
            max="255"
            value="32"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const number = document.getElementById(
                "toleranceInput"
              ) as HTMLInputElement;
              const valueDisplay = document.getElementById(
                "toleranceValue"
              ) as HTMLSpanElement;
              if (number) number.value = target.value;
              if (valueDisplay) valueDisplay.textContent = target.value;
              this.processCurrentFrame();
            }}
          />

          <label for="featherInput"
            >Feather: <span id="featherValue">8</span></label
          >
          <p class="hint">
            Softens edges for natural blending (0-64). Higher = smoother
            transitions
          </p>
          <input
            id="featherInput"
            type="range"
            min="0"
            max="64"
            value="2"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const valueDisplay = document.getElementById(
                "featherValue"
              ) as HTMLSpanElement;
              if (valueDisplay) valueDisplay.textContent = target.value;
              this.processCurrentFrame();
            }}
          />

          <label for="contractPx"
            >Contract/Erode: <span id="contractValue">1</span></label
          >
          <p class="hint">
            Refines mask edges: positive values (0-5) shrink/tighten, negative
            values (-2-0) expand/soften
          </p>
          <input
            id="contractPx"
            type="range"
            min="-2"
            max="5"
            value="1"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const valueDisplay = document.getElementById(
                "contractValue"
              ) as HTMLSpanElement;
              if (valueDisplay) valueDisplay.textContent = target.value;
              this.processCurrentFrame();
            }}
          />

          <label for="edgeBlur"
            >Edge Blur: <span id="edgeBlurValue">1</span></label
          >
          <p class="hint">
            Smooths rough edges in the mask (0-5). Higher = cleaner edges
          </p>
          <input
            id="edgeBlur"
            type="range"
            min="0"
            max="5"
            value="1"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const valueDisplay = document.getElementById(
                "edgeBlurValue"
              ) as HTMLSpanElement;
              if (valueDisplay) valueDisplay.textContent = target.value;
              this.processCurrentFrame();
            }}
          />
        </div>
      </div>
    `;
  }
}
