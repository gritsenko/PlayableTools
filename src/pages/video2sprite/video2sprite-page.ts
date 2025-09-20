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

  @state()
  private currentFrameIndex = 0;

  @state()
  private totalFrames = 0;

  @state()
  private framesLoaded = false;

  @state()
  private isPlaying = false;

  @state()
  private playbackSpeed = 100; // milliseconds per frame

  @state()
  private isSavingSequence = false;

  @state()
  private isSliderBeingDragged = false;

  @state()
  private detectedBackgroundColor: string | null = null;

  @inject(Video2SpriteService)
  private video2SpriteService!: Video2SpriteService;

  private selectedFile: File | null = null;
  private animationInterval: number | null = null;

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

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up animation interval when component is destroyed
    this.pauseAnimation();
    // Remove global event listeners
    document.removeEventListener('mouseup', this.handleGlobalMouseUp);
  }

  connectedCallback() {
    super.connectedCallback();
    // Add global mouse up event listener to handle slider drag end
    document.addEventListener('mouseup', this.handleGlobalMouseUp);
  }

  private handleGlobalMouseUp = () => {
    if (this.isSliderBeingDragged) {
      this.isSliderBeingDragged = false;
      this.updateSliderValue();
    }
  };

  private selectBackground(bg: string) {
    this.selectedBackground = bg;
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
            tolerance: parseInt(toleranceInput?.value || "50"),
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

  private async savePngSequence() {
    if (!this.framesLoaded || this.video2SpriteService.getFrameCount() === 0) {
      alert("No frames available to save. Please load a video first.");
      return;
    }

    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      alert("Your browser doesn't support the File System Access API. Please use Chrome, Edge, or another compatible browser.");
      return;
    }

    try {
      // Let user pick a directory
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });

      this.isSavingSequence = true;
      this.processingProgress = { stage: 'generating', progress: 0 };

      // Get all processed frames
      const frames = this.video2SpriteService.getProcessedFrames();
      const totalFrames = frames.length;
      
      if (totalFrames === 0) {
        alert("No processed frames available to save.");
        this.isSavingSequence = false;
        this.processingProgress = null;
        return;
      }

      // Save each frame as PNG
      for (let i = 0; i < totalFrames; i++) {
        // Create canvas with frame data
        const canvas = this.video2SpriteService.createFramePreviewCanvas(i, true);
        if (!canvas) {
          console.warn(`Failed to create canvas for frame ${i}`);
          continue;
        }

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(`Failed to create blob for frame ${i}`));
            }
          }, 'image/png', 1.0);
        });

        // Create filename with zero-padded frame number
        const frameNumber = String(i + 1).padStart(4, '0');
        const filename = `frame_${frameNumber}.png`;

        // Save file to directory
        const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        // Update progress
        this.processingProgress = {
          stage: 'generating',
          progress: ((i + 1) / totalFrames) * 100,
          currentFrame: i + 1,
          totalFrames
        };
      }

      alert(`Successfully saved ${totalFrames} PNG files to the selected folder!`);

    } catch (error) {
      console.error('Failed to save PNG sequence:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // User cancelled the directory picker
          return;
        }
        alert(`Failed to save PNG sequence: ${error.message}`);
      } else {
        alert('Failed to save PNG sequence. Please try again.');
      }
    } finally {
      this.isSavingSequence = false;
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

    // Pause any running animation
    this.pauseAnimation();

    // Clear previous data
    this.originalImageData = null;
    this.selectedColor = "";
    this.framesLoaded = false;
    this.currentFrameIndex = 0;
    this.totalFrames = 0;

    // Load all frames from the video
    this.isProcessing = true;
    try {
      await this.video2SpriteService.loadVideo(file, {
        frameRate: 10,
        maxWidth: 512,
        maxHeight: 512
      }, (progress) => {
        this.processingProgress = progress;
      });

      // Update state with frame information
      this.totalFrames = this.video2SpriteService.getFrameCount();
      this.framesLoaded = true;
      
      // Auto-detect background color
      this.autoDetectBackground();
      
      // Display the first frame
      this.displayFrame(0);

    } catch (error) {
      console.error('Failed to load video frames:', error);
      alert('Failed to load video. Please try a different file.');
    } finally {
      this.isProcessing = false;
      this.processingProgress = null;
    }

    // Hide upload panel
    this.hasSelectedFile = true;

    // Store the file for later processing
    this.selectedFile = file;
  }

  private autoDetectBackground() {
    try {
      const detection = this.video2SpriteService.autoDetectBackgroundColor();
      if (detection && detection.confidence > 50) { // Auto-apply if confidence > 50%
        this.detectedBackgroundColor = `rgba(${detection.r}, ${detection.g}, ${detection.b}, ${detection.a})`;
        this.selectedColor = this.detectedBackgroundColor;
        console.log(`Auto-applied background color: ${this.detectedBackgroundColor} (${detection.confidence}% confidence)`);
      } else {
        this.detectedBackgroundColor = null;
        console.log(`Background detection failed or low confidence: ${detection ? detection.confidence : 0}%`);
      }
    } catch (error) {
      console.error('Failed to auto-detect background color:', error);
      this.detectedBackgroundColor = null;
    }
  }

  private resetColor() {
    this.selectedColor = "";
    this.detectedBackgroundColor = null;
    this.processCurrentFrame();
  }

  private displayFrame(frameIndex: number) {
    if (frameIndex < 0 || frameIndex >= this.totalFrames) return;
    
    const canvas = document.getElementById("previewCanvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Auto-process the frame with current settings if chroma key is selected
    if (this.selectedColor) {
      this.applyCurrentSettingsToFrame(frameIndex);
    }

    // Get the frame from the service (processed if chroma key applied)
    const frame = this.video2SpriteService.getProcessedFrame(frameIndex);
    if (!frame) return;

    // Set canvas size to match container
    canvas.width = 600;
    canvas.height = 600;

    // Calculate scaling to fit frame in canvas while maintaining aspect ratio
    const frameAspect = frame.imageData.width / frame.imageData.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (frameAspect > canvasAspect) {
      // Frame is wider, fit by width
      drawWidth = canvas.width;
      drawHeight = canvas.width / frameAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      // Frame is taller, fit by height
      drawHeight = canvas.height;
      drawWidth = canvas.height * frameAspect;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    // Clear canvas and draw frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas for the frame
    const tempCanvas = this.video2SpriteService.createFramePreviewCanvas(frameIndex, true);
    if (tempCanvas) {
      ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Store the image data for color picking
    this.originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Update current frame index and trigger re-render to sync slider
    this.currentFrameIndex = frameIndex;
    
    // Force update the slider to sync with the new frame index
    this.updateSliderValue();
  }

  private updateSliderValue() {
    // Only update slider if it's not currently being dragged by the user
    if (this.isSliderBeingDragged) return;
    
    // Use requestAnimationFrame to ensure DOM is updated after current render cycle
    requestAnimationFrame(() => {
      const slider = document.querySelector('.frame-slider input[type="range"]') as HTMLInputElement;
      if (slider && parseInt(slider.value) !== this.currentFrameIndex) {
        slider.value = this.currentFrameIndex.toString();
        // Trigger a 'input' event to update any visual indicators
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  private applyCurrentSettingsToFrame(frameIndex: number) {
    if (!this.selectedColor) return;

    // Parse selected color
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
    const toleranceInput = document.getElementById("toleranceInput") as HTMLInputElement;
    const featherInput = document.getElementById("featherInput") as HTMLInputElement;
    const contractInput = document.getElementById("contractPx") as HTMLInputElement;
    const edgeBlurInput = document.getElementById("edgeBlur") as HTMLInputElement;

    const tolerance = toleranceInput ? parseInt(toleranceInput.value) : 50;
    const feather = featherInput ? parseInt(featherInput.value) : 8;
    const contract = contractInput ? parseInt(contractInput.value) : 1;
    const edgeBlur = edgeBlurInput ? parseInt(edgeBlurInput.value) : 1;

    // Apply chroma key to the specific frame
    try {
      this.video2SpriteService.applyProcessingToFrame(frameIndex, {
        chromaKey: {
          keyColor,
          tolerance,
          feather,
          contract,
          edgeBlur
        }
      });
    } catch (error) {
      console.error('Failed to process frame:', error);
    }
  }

  private nextFrame() {
    if (this.currentFrameIndex < this.totalFrames - 1) {
      this.displayFrame(this.currentFrameIndex + 1);
    }
  }

  private previousFrame() {
    if (this.currentFrameIndex > 0) {
      this.displayFrame(this.currentFrameIndex - 1);
    }
  }

  private goToFrame(frameIndex: number) {
    if (frameIndex >= 0 && frameIndex < this.totalFrames) {
      this.displayFrame(frameIndex);
    }
  }

  private playAnimation() {
    if (this.isPlaying || !this.framesLoaded) return;

    this.isPlaying = true;
    this.animationInterval = window.setInterval(() => {
      let nextFrame = this.currentFrameIndex + 1;
      if (nextFrame >= this.totalFrames) {
        nextFrame = 0; // Loop back to start
      }
      this.displayFrame(nextFrame);
    }, this.playbackSpeed);
  }

  private pauseAnimation() {
    this.isPlaying = false;
    if (this.animationInterval !== null) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  private togglePlayPause() {
    if (this.isPlaying) {
      this.pauseAnimation();
    } else {
      this.playAnimation();
    }
  }

  private setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
    if (this.isPlaying) {
      // Restart animation with new speed
      this.pauseAnimation();
      this.playAnimation();
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
    if (!this.framesLoaded || !this.selectedColor) return;

    // Apply settings to current frame and redisplay
    this.applyCurrentSettingsToFrame(this.currentFrameIndex);
    this.displayFrame(this.currentFrameIndex);
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

          ${this.framesLoaded && this.hasSelectedFile && !this.isProcessing
            ? html`
                <div class="frame-navigation">
                  <label>Frame Navigation:</label>
                  
                  <!-- Play/Pause Controls -->
                  <div class="playback-controls">
                    <button 
                      @click=${this.togglePlayPause}
                      class="play-pause-btn"
                    >
                      ${this.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    <label class="speed-label">
                      Speed:
                      <select 
                        @change=${(e: Event) => {
                          const target = e.target as HTMLSelectElement;
                          this.setPlaybackSpeed(parseInt(target.value));
                        }}
                        .value=${this.playbackSpeed.toString()}
                      >
                        <option value="50">Fast (50ms)</option>
                        <option value="100">Normal (100ms)</option>
                        <option value="200">Slow (200ms)</option>
                        <option value="500">Very Slow (500ms)</option>
                      </select>
                    </label>
                  </div>

                  <!-- Frame Controls -->
                  <div class="frame-controls">
                    <button 
                      @click=${this.previousFrame} 
                      ?disabled=${this.currentFrameIndex <= 0}
                    >
                      ◀ Previous
                    </button>
                    <span class="frame-info">
                      ${this.currentFrameIndex + 1} of ${this.totalFrames}
                    </span>
                    <button 
                      @click=${this.nextFrame} 
                      ?disabled=${this.currentFrameIndex >= this.totalFrames - 1}
                    >
                      Next ▶
                    </button>
                  </div>
                  
                  <!-- Frame Slider -->
                  <div class="frame-slider">
                    <input
                      type="range"
                      min="0"
                      max="${this.totalFrames - 1}"
                      value="${this.currentFrameIndex}"
                      @mousedown=${() => { this.isSliderBeingDragged = true; }}
                      @mouseup=${() => { 
                        this.isSliderBeingDragged = false;
                        this.updateSliderValue(); // Ensure sync after user releases
                      }}
                      @touchstart=${() => { this.isSliderBeingDragged = true; }}
                      @touchend=${() => { 
                        this.isSliderBeingDragged = false;
                        this.updateSliderValue(); // Ensure sync after user releases
                      }}
                      @mouseleave=${() => { 
                        // Reset drag state if mouse leaves slider area
                        this.isSliderBeingDragged = false;
                        this.updateSliderValue();
                      }}
                      @input=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        this.goToFrame(parseInt(target.value));
                      }}
                      @change=${(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        this.goToFrame(parseInt(target.value));
                        this.isSliderBeingDragged = false; // Ensure drag state is reset
                      }}
                    />
                  </div>
                </div>
              `
            : ""}

          ${this.hasSelectedFile && !this.isProcessing && !this.isSavingSequence
            ? html`
                <div id="process-controls">
                  <button @click=${this.startProcessing} class="process-btn">
                    Save PNG sprite sheet
                  </button>
                  ${this.framesLoaded 
                    ? html`
                        <button @click=${this.savePngSequence} class="process-btn sequence-btn">
                          Save PNG sequence
                        </button>
                      `
                    : ""
                  }
                </div>
              `
            : ""}

          ${(this.isProcessing || this.isSavingSequence) && this.processingProgress
            ? html`
                <div class="processing-info">
                  <div class="processing-text">
                    ${this.isSavingSequence 
                      ? `Saving frame ${this.processingProgress.currentFrame || 0} of ${this.processingProgress.totalFrames || 0}...`
                      : this.processingProgress.stage === "loading"
                      ? "Loading video..."
                      : this.processingProgress.stage === "extracting"
                      ? "Extracting frames..."
                      : this.processingProgress.stage === "processing"
                      ? "Processing frames..."
                      : "Generating sprite sheet..."
                    }
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style="width: ${this.processingProgress.progress || 0}%"
                    ></div>
                  </div>
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
          <button 
            @click=${this.resetColor}
            class="reset-color-btn"
            title="Clear selected color"
          >
            ✕
          </button>

          <label for="toleranceInput"
            >Tolerance: <span id="toleranceValue">50</span></label
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
            value="50"
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
            value="50"
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
