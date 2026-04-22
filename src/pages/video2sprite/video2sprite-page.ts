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
  title: "Video to Sprite Converter for Playable Ads | PlayableTools",
  description:
    "Convert MP4 videos to PNG sprite sheets and frame sequences for game development and playable ads",
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
      <div class="max-w-6xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Convert MP4 video to sprite sheets for playable ads</h1>
          <p class="text-lg text-slate-600 dark:text-slate-400">
            Turn short MP4 clips into optimized PNG sprite sheets and frame sequences for HTML5 playable ads, lightweight web games, and animation-heavy creatives.
          </p>
          <p class="text-slate-600 dark:text-slate-400 mt-3">
            The tool helps with frame extraction, sprite packing, chroma-key cleanup, and transparent asset preparation so it is easier to ship rich motion inside strict file-size budgets.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Left Column: Preview & Controls -->
          <div class="flex-1 min-w-0">
            <div id="preview-container" class="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner mb-4">
              <div class="absolute inset-0 z-0">
                ${this.selectedBackground
                  ? html`<img src=${this.selectedBackground} alt="background" class="w-full h-full object-cover" />`
                  : ""}
              </div>
              <canvas
                id="previewCanvas"
                aria-label="First frame preview canvas"
                @click=${this.handleCanvasClick}
                class="relative z-10 max-w-full max-h-full object-contain cursor-crosshair"
              ></canvas>

              ${!this.hasSelectedFile && !this.isProcessing
                ? html`
                    <div
                      id="upload-area"
                      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 cursor-pointer transition-colors border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-100/90 dark:hover:bg-slate-800/90 ${this.isDragOver ? "border-primary bg-primary/5" : ""}"
                      @dragover=${this.handleDragOver}
                      @dragleave=${this.handleDragLeave}
                      @drop=${this.handleDrop}
                      @click=${this.handleClick}
                    >
                      <div class="text-6xl mb-4">📹</div>
                      <div class="text-xl font-medium text-slate-900 dark:text-white mb-2">Drop your MP4 video here</div>
                      <div class="text-slate-500 dark:text-slate-400">or click to browse files</div>
                      <input
                        id="file-input"
                        type="file"
                        accept=".mp4,video/mp4"
                        @change=${this.handleFileInputChange}
                        class="hidden"
                      />
                    </div>
                  `
                : ""}
              ${this.isProcessing
                ? html`
                    <div class="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                        <div class="text-4xl mb-4 animate-bounce">⏳</div>
                        <div class="font-medium text-slate-900 dark:text-white mb-2">
                          ${this.processingProgress?.stage === "loading"
                            ? "Loading video..."
                            : this.processingProgress?.stage === "processing"
                            ? "Extracting frames..."
                            : "Generating sprite sheet..."}
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-2">
                          <div
                            class="bg-primary h-2.5 rounded-full transition-all duration-300"
                            style="width: ${this.processingProgress?.progress || 0}%"
                          ></div>
                        </div>
                        ${this.processingProgress?.currentFrame &&
                        this.processingProgress?.totalFrames
                          ? html`<div class="text-sm text-slate-500 dark:text-slate-400">
                              Frame ${this.processingProgress.currentFrame} of
                              ${this.processingProgress.totalFrames}
                            </div>`
                          : ""}
                      </div>
                    </div>
                  `
                : ""}
            </div>

            <div id="background-presets" class="flex flex-wrap gap-2 mb-6">
              ${this.backgrounds.map(
                (bg) =>
                  html`<button
                    class="w-10 h-10 rounded overflow-hidden border-2 transition-all ${this.selectedBackground === bg ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}"
                    @click=${() => this.selectBackground(bg)}
                  >
                    <img src=${bg} alt="background" class="w-full h-full object-cover" />
                  </button>`
              )}
            </div>

            ${this.framesLoaded && this.hasSelectedFile && !this.isProcessing
              ? html`
                  <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 space-y-4">
                    <div class="flex justify-between items-center mb-2">
                      <label class="font-medium text-slate-700 dark:text-slate-300">Frame Navigation</label>
                      
                      <!-- Play/Pause Controls -->
                      <div class="flex items-center gap-4">
                        <button 
                          @click=${this.togglePlayPause}
                          class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
                        >
                          ${this.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                        </button>
                        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          Speed:
                          <select 
                            @change=${(e: Event) => {
                              const target = e.target as HTMLSelectElement;
                              this.setPlaybackSpeed(parseInt(target.value));
                            }}
                            .value=${this.playbackSpeed.toString()}
                            class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="50">Fast (50ms)</option>
                            <option value="100">Normal (100ms)</option>
                            <option value="200">Slow (200ms)</option>
                            <option value="500">Very Slow (500ms)</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <!-- Frame Controls -->
                    <div class="flex items-center justify-center gap-4">
                      <button 
                        @click=${this.previousFrame} 
                        ?disabled=${this.currentFrameIndex <= 0}
                        class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <span class="material-icons-outlined">chevron_left</span>
                      </button>
                      <span class="font-mono text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
                        ${this.currentFrameIndex + 1} / ${this.totalFrames}
                      </span>
                      <button 
                        @click=${this.nextFrame} 
                        ?disabled=${this.currentFrameIndex >= this.totalFrames - 1}
                        class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <span class="material-icons-outlined">chevron_right</span>
                      </button>
                    </div>
                    
                    <!-- Frame Slider -->
                    <div class="px-2">
                      <input
                        type="range"
                        min="0"
                        max="${this.totalFrames - 1}"
                        value="${this.currentFrameIndex}"
                        @mousedown=${() => { this.isSliderBeingDragged = true; }}
                        @mouseup=${() => { 
                          this.isSliderBeingDragged = false;
                          this.updateSliderValue();
                        }}
                        @touchstart=${() => { this.isSliderBeingDragged = true; }}
                        @touchend=${() => { 
                          this.isSliderBeingDragged = false;
                          this.updateSliderValue();
                        }}
                        @mouseleave=${() => { 
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
                          this.isSliderBeingDragged = false;
                        }}
                        class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                `
              : ""}

            ${this.hasSelectedFile && !this.isProcessing && !this.isSavingSequence
              ? html`
                  <div class="flex flex-wrap gap-4">
                    <button 
                      @click=${this.startProcessing} 
                      class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <span class="material-icons-outlined">grid_view</span>
                      Save PNG sprite sheet
                    </button>
                    ${this.framesLoaded 
                      ? html`
                          <button 
                            @click=${this.savePngSequence} 
                            class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                          >
                            <span class="material-icons-outlined">collections</span>
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
                  <div class="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mt-6">
                    <div class="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>
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
                      </span>
                      <span>${Math.round(this.processingProgress.progress || 0)}%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        class="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style="width: ${this.processingProgress.progress || 0}%"
                      ></div>
                    </div>
                  </div>
                `
              : ""}
          </div>

          <!-- Right Column: Settings -->
          <div class="w-full lg:w-80 space-y-6">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-icons-outlined">palette</span>
                Chroma Key Settings
              </h3>
              
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Background Color</label>
                  ${this.selectedColor ? html`
                    <button 
                      @click=${this.resetColor}
                      class="text-xs text-red-500 hover:text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  ` : ''}
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Click the preview to pick a color to remove
                </p>
                <div class="relative">
                  <div
                    class="w-full h-12 rounded border border-slate-300 dark:border-slate-600 shadow-inner"
                    style="background-color: ${this.selectedColor || 'transparent'}; background-image: ${!this.selectedColor ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none'}; background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px;"
                  ></div>
                  ${!this.selectedColor ? html`
                    <div class="absolute inset-0 flex items-center justify-center text-slate-400 text-sm pointer-events-none">
                      No color selected
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1">
                    <label for="toleranceInput" class="text-sm font-medium text-slate-700 dark:text-slate-300">Tolerance</label>
                    <span id="toleranceValue" class="text-sm font-mono text-slate-500">50</span>
                  </div>
                  <input
                    id="toleranceRange"
                    type="range"
                    min="0"
                    max="255"
                    value="50"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const number = document.getElementById("toleranceInput") as HTMLInputElement;
                      const valueDisplay = document.getElementById("toleranceValue") as HTMLSpanElement;
                      if (number) number.value = target.value;
                      if (valueDisplay) valueDisplay.textContent = target.value;
                      this.processCurrentFrame();
                    }}
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary mb-2"
                  />
                  <input
                    id="toleranceInput"
                    type="number"
                    min="0"
                    max="255"
                    value="50"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const range = document.getElementById("toleranceRange") as HTMLInputElement;
                      const valueDisplay = document.getElementById("toleranceValue") as HTMLSpanElement;
                      if (range) range.value = target.value;
                      if (valueDisplay) valueDisplay.textContent = target.value;
                      this.processCurrentFrame();
                    }}
                    class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Higher values remove more similar colors
                  </p>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <label for="featherInput" class="text-sm font-medium text-slate-700 dark:text-slate-300">Feather</label>
                    <span id="featherValue" class="text-sm font-mono text-slate-500">8</span>
                  </div>
                  <input
                    id="featherInput"
                    type="range"
                    min="0"
                    max="64"
                    value="2"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const valueDisplay = document.getElementById("featherValue") as HTMLSpanElement;
                      if (valueDisplay) valueDisplay.textContent = target.value;
                      this.processCurrentFrame();
                    }}
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Softens edges for natural blending
                  </p>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <label for="contractPx" class="text-sm font-medium text-slate-700 dark:text-slate-300">Contract/Erode</label>
                    <span id="contractValue" class="text-sm font-mono text-slate-500">1</span>
                  </div>
                  <input
                    id="contractPx"
                    type="range"
                    min="-2"
                    max="5"
                    value="1"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const valueDisplay = document.getElementById("contractValue") as HTMLSpanElement;
                      if (valueDisplay) valueDisplay.textContent = target.value;
                      this.processCurrentFrame();
                    }}
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Positive shrinks mask, negative expands
                  </p>
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <label for="edgeBlur" class="text-sm font-medium text-slate-700 dark:text-slate-300">Edge Blur</label>
                    <span id="edgeBlurValue" class="text-sm font-mono text-slate-500">1</span>
                  </div>
                  <input
                    id="edgeBlur"
                    type="range"
                    min="0"
                    max="5"
                    value="1"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const valueDisplay = document.getElementById("edgeBlurValue") as HTMLSpanElement;
                      if (valueDisplay) valueDisplay.textContent = target.value;
                      this.processCurrentFrame();
                    }}
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Smooths rough edges in the mask
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
