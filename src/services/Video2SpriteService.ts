import { injectable } from "fw";

export interface Video2SpriteOptions {
  frameRate?: number; // frames per second to extract
  maxWidth?: number; // maximum width of output sprites
  maxHeight?: number; // maximum height of output sprites
  quality?: number; // JPEG quality (0-1) for frame extraction
  startTime?: number; // start time in seconds
  endTime?: number; // end time in seconds
  spriteColumns?: number; // number of columns in sprite sheet
  chromaKey?: {
    keyColor: { r: number; g: number; b: number; a: number };
    tolerance: number;
    feather: number;
    contract: number;
    edgeBlur: number;
  };
}

export interface SpriteSheetResult {
  spriteSheet: Blob;
  frameCount: number;
  duration: number;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
}

export interface ProcessingProgress {
  stage: 'loading' | 'extracting' | 'processing' | 'generating';
  progress: number; // 0-100
  currentFrame?: number;
  totalFrames?: number;
}

export interface VideoFrame {
  imageData: ImageData;
  timestamp: number;
  index: number;
}

@injectable()
export class Video2SpriteService {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private originalFrames: VideoFrame[] = [];
  private processedFrames: VideoFrame[] = [];
  private currentVideoFile: File | null = null;
  private videoMetadata: { duration: number; width: number; height: number; frameRate?: number } | null = null;

  constructor() {
    this.initializeElements();
  }

  /**
   * Load a video file and extract all frames
   */
  async loadVideo(
    videoFile: File,
    options: { frameRate?: number; maxWidth?: number; maxHeight?: number } = {},
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<void> {
    if (!this.videoElement || !this.canvasElement || !this.ctx) {
      throw new Error('Video processing elements not initialized');
    }

    const { frameRate = 10, maxWidth = 512, maxHeight = 512 } = options;

    try {
      // Clear previous data
      this.originalFrames = [];
      this.processedFrames = [];
      this.currentVideoFile = videoFile;

      // Load video
      onProgress?.({ stage: 'loading', progress: 0 });
      const videoUrl = URL.createObjectURL(videoFile);
      this.videoElement.src = videoUrl;

      await new Promise<void>((resolve, reject) => {
        if (!this.videoElement) return reject(new Error('Video element not available'));

        this.videoElement.onloadedmetadata = () => resolve();
        this.videoElement.onerror = () => reject(new Error('Failed to load video'));
      });

      // Store metadata
      this.videoMetadata = {
        duration: this.videoElement.duration,
        width: this.videoElement.videoWidth,
        height: this.videoElement.videoHeight
      };

      const duration = this.videoElement.duration;
      const totalFrames = Math.floor(duration * frameRate);
      const frameInterval = 1 / frameRate;

      onProgress?.({ stage: 'extracting', progress: 10, currentFrame: 0, totalFrames });

      // Extract all frames
      for (let i = 0; i < totalFrames; i++) {
        const currentTime = i * frameInterval;

        if (currentTime > duration) break;

        this.videoElement.currentTime = currentTime;

        await new Promise<void>((resolve) => {
          if (!this.videoElement) return resolve();

          const onSeeked = () => {
            this.videoElement?.removeEventListener('seeked', onSeeked);
            resolve();
          };
          this.videoElement.addEventListener('seeked', onSeeked);
        });

        // Draw frame to canvas
        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;

        // Calculate scaled dimensions
        const scale = Math.min(maxWidth / videoWidth, maxHeight / videoHeight, 1);
        const frameWidth = Math.floor(videoWidth * scale);
        const frameHeight = Math.floor(videoHeight * scale);

        this.canvasElement.width = frameWidth;
        this.canvasElement.height = frameHeight;

        this.ctx.drawImage(this.videoElement, 0, 0, frameWidth, frameHeight);
        const frameData = this.ctx.getImageData(0, 0, frameWidth, frameHeight);

        // Store original frame
        this.originalFrames.push({
          imageData: frameData,
          timestamp: currentTime,
          index: i
        });

        // Initially, processed frames are same as original frames
        this.processedFrames.push({
          imageData: new ImageData(frameData.data.slice(), frameData.width, frameData.height),
          timestamp: currentTime,
          index: i
        });

        onProgress?.({
          stage: 'extracting',
          progress: 10 + (i / totalFrames) * 80,
          currentFrame: i + 1,
          totalFrames
        });
      }

      onProgress?.({ stage: 'extracting', progress: 100 });

      // Clean up video URL
      URL.revokeObjectURL(videoUrl);

    } catch (error) {
      // Clean up on error
      if (this.videoElement?.src) {
        URL.revokeObjectURL(this.videoElement.src);
      }
      throw error;
    }
  }

  /**
   * Get the total number of loaded frames
   */
  getFrameCount(): number {
    return this.originalFrames.length;
  }

  /**
   * Get original frame at specific index
   */
  getOriginalFrame(index: number): VideoFrame | null {
    return this.originalFrames[index] || null;
  }

  /**
   * Get processed frame at specific index
   */
  getProcessedFrame(index: number): VideoFrame | null {
    return this.processedFrames[index] || null;
  }

  /**
   * Get all original frames
   */
  getOriginalFrames(): VideoFrame[] {
    return [...this.originalFrames];
  }

  /**
   * Get all processed frames
   */
  getProcessedFrames(): VideoFrame[] {
    return [...this.processedFrames];
  }

  /**
   * Apply processing to all frames (e.g., chroma key)
   */
  applyProcessingToAllFrames(
    options: Pick<Video2SpriteOptions, 'chromaKey'>,
    onProgress?: (progress: ProcessingProgress) => void
  ): void {
    if (this.originalFrames.length === 0) {
      throw new Error('No frames loaded. Call loadVideo() first.');
    }

    onProgress?.({ stage: 'processing', progress: 0, currentFrame: 0, totalFrames: this.originalFrames.length });

    for (let i = 0; i < this.originalFrames.length; i++) {
      const originalFrame = this.originalFrames[i];
      let processedImageData = new ImageData(
        originalFrame.imageData.data.slice(),
        originalFrame.imageData.width,
        originalFrame.imageData.height
      );

      // Apply chroma key if specified
      if (options.chromaKey) {
        processedImageData = this.applyChromaKey(
          processedImageData,
          options.chromaKey.keyColor,
          options.chromaKey.tolerance,
          options.chromaKey.feather,
          options.chromaKey.contract,
          options.chromaKey.edgeBlur
        );
      }

      this.processedFrames[i] = {
        imageData: processedImageData,
        timestamp: originalFrame.timestamp,
        index: originalFrame.index
      };

      onProgress?.({
        stage: 'processing',
        progress: (i + 1) / this.originalFrames.length * 100,
        currentFrame: i + 1,
        totalFrames: this.originalFrames.length
      });
    }
  }

  /**
   * Apply processing to a single frame
   */
  applyProcessingToFrame(
    frameIndex: number,
    options: Pick<Video2SpriteOptions, 'chromaKey'>
  ): VideoFrame | null {
    const originalFrame = this.originalFrames[frameIndex];
    if (!originalFrame) {
      return null;
    }

    let processedImageData = new ImageData(
      originalFrame.imageData.data.slice(),
      originalFrame.imageData.width,
      originalFrame.imageData.height
    );

    // Apply chroma key if specified
    if (options.chromaKey) {
      processedImageData = this.applyChromaKey(
        processedImageData,
        options.chromaKey.keyColor,
        options.chromaKey.tolerance,
        options.chromaKey.feather,
        options.chromaKey.contract,
        options.chromaKey.edgeBlur
      );
    }

    const processedFrame: VideoFrame = {
      imageData: processedImageData,
      timestamp: originalFrame.timestamp,
      index: originalFrame.index
    };

    // Update the processed frame in the array
    this.processedFrames[frameIndex] = processedFrame;

    return processedFrame;
  }

  /**
   * Create a canvas element with a specific frame for preview
   */
  createFramePreviewCanvas(frameIndex: number, useProcessed: boolean = true): HTMLCanvasElement | null {
    const frame = useProcessed ? this.getProcessedFrame(frameIndex) : this.getOriginalFrame(frameIndex);
    
    if (!frame) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }

    return canvas;
  }

  /**
   * Reset and clear all loaded frames
   */
  clearFrames(): void {
    this.originalFrames = [];
    this.processedFrames = [];
    this.currentVideoFile = null;
    this.videoMetadata = null;
  }

  /**
   * Get stored video metadata (from loaded video)
   */
  getStoredVideoMetadata(): { duration: number; width: number; height: number; frameRate?: number } | null {
    return this.videoMetadata ? { ...this.videoMetadata } : null;
  }

  /**
   * Auto-detect the most common background color from loaded frames
   * Analyzes edge pixels and finds the most frequent color
   */
  autoDetectBackgroundColor(): { r: number; g: number; b: number; a: number; confidence: number } | null {
    if (this.originalFrames.length === 0) {
      return null;
    }

    // Sample multiple frames for better detection
    const framesToSample = Math.min(5, this.originalFrames.length);
    const sampleIndices = [];
    
    // Sample frames evenly across the video
    for (let i = 0; i < framesToSample; i++) {
      const index = Math.floor((i / (framesToSample - 1)) * (this.originalFrames.length - 1));
      sampleIndices.push(index);
    }

    const colorCounts = new Map<string, { count: number; r: number; g: number; b: number; a: number }>();
    let totalPixelsSampled = 0;

    // Sample edge pixels from selected frames
    for (const frameIndex of sampleIndices) {
      const frame = this.originalFrames[frameIndex];
      if (!frame) continue;

      const { width, height, data } = frame.imageData;
      const borderWidth = Math.max(2, Math.floor(Math.min(width, height) * 0.05)); // 5% border

      // Sample pixels from edges (top, bottom, left, right borders)
      const pixelsToSample: number[] = [];

      // Top and bottom edges
      for (let x = 0; x < width; x += 4) { // Sample every 4th pixel for performance
        for (let y = 0; y < borderWidth; y++) {
          pixelsToSample.push(y * width + x); // Top edge
        }
        for (let y = height - borderWidth; y < height; y++) {
          pixelsToSample.push(y * width + x); // Bottom edge
        }
      }

      // Left and right edges
      for (let y = borderWidth; y < height - borderWidth; y += 4) {
        for (let x = 0; x < borderWidth; x++) {
          pixelsToSample.push(y * width + x); // Left edge
        }
        for (let x = width - borderWidth; x < width; x++) {
          pixelsToSample.push(y * width + x); // Right edge
        }
      }

      // Count colors
      for (const pixelIndex of pixelsToSample) {
        const dataIndex = pixelIndex * 4;
        if (dataIndex >= data.length - 3) continue;

        const r = data[dataIndex];
        const g = data[dataIndex + 1];
        const b = data[dataIndex + 2];
        const a = data[dataIndex + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors to reduce noise (group similar colors)
        const quantizedR = Math.round(r / 8) * 8;
        const quantizedG = Math.round(g / 8) * 8;
        const quantizedB = Math.round(b / 8) * 8;

        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        
        if (colorCounts.has(colorKey)) {
          colorCounts.get(colorKey)!.count++;
        } else {
          colorCounts.set(colorKey, { count: 1, r: quantizedR, g: quantizedG, b: quantizedB, a: 255 });
        }
        
        totalPixelsSampled++;
      }
    }

    if (totalPixelsSampled === 0) {
      return null;
    }

    // Find the most common color
    let mostCommonColor: { count: number; r: number; g: number; b: number; a: number } | null = null;
    let maxCount = 0;

    for (const colorData of colorCounts.values()) {
      if (colorData.count > maxCount) {
        maxCount = colorData.count;
        mostCommonColor = colorData;
      }
    }

    if (!mostCommonColor) {
      return null;
    }

    // Calculate confidence (percentage of edge pixels that are this color)
    const confidence = (mostCommonColor.count / totalPixelsSampled) * 100;

    return {
      r: mostCommonColor.r,
      g: mostCommonColor.g,
      b: mostCommonColor.b,
      a: mostCommonColor.a,
      confidence: Math.round(confidence * 100) / 100 // Round to 2 decimal places
    };
  }

  private initializeElements() {
    // Create video element for processing
    this.videoElement = document.createElement('video');
    this.videoElement.preload = 'metadata';
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;

    // Create canvas for frame extraction
    this.canvasElement = document.createElement('canvas');
    this.ctx = this.canvasElement.getContext('2d');
  }

  async processVideoToSprites(
    videoFile: File,
    options: Video2SpriteOptions = {},
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<SpriteSheetResult> {
    const {
      quality = 0.9,
      spriteColumns = 8,
      startTime = 0
    } = options;

    // Check if we need to load the video or if it's already loaded
    const needsLoading = !this.currentVideoFile || 
                        this.currentVideoFile !== videoFile || 
                        this.originalFrames.length === 0;

    if (needsLoading) {
      // Load video and extract all frames
      await this.loadVideo(videoFile, {
        frameRate: options.frameRate,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight
      }, onProgress);
    }

    if (this.processedFrames.length === 0) {
      throw new Error('No frames available. Video loading may have failed.');
    }

    try {
      // Apply processing to frames if needed
      onProgress?.({ stage: 'processing', progress: 10 });
      
      // Use existing processed frames or apply new processing
      let framesToUse = this.processedFrames;
      
      // If we have chroma key options, reprocess the frames
      if (options.chromaKey) {
        this.applyProcessingToAllFrames({ chromaKey: options.chromaKey }, (progress) => {
          onProgress?.({
            stage: 'processing',
            progress: 10 + (progress.progress * 0.6), // 10-70%
            currentFrame: progress.currentFrame,
            totalFrames: progress.totalFrames
          });
        });
        framesToUse = this.processedFrames;
      }

      // Filter frames by time range if specified
      const endTime = options.endTime || (this.videoMetadata?.duration || 0);
      const filteredFrames = framesToUse.filter(frame => 
        frame.timestamp >= startTime && frame.timestamp <= endTime
      );

      if (filteredFrames.length === 0) {
        throw new Error('No frames in specified time range');
      }

      // Generate sprite sheet
      onProgress?.({ stage: 'generating', progress: 70 });

      const frameImageDataArray = filteredFrames.map(frame => frame.imageData);
      const spriteSheet = await this.generateSpriteSheet(frameImageDataArray, spriteColumns, quality);

      onProgress?.({ stage: 'generating', progress: 100 });

      const firstFrame = filteredFrames[0];
      return {
        spriteSheet,
        frameCount: filteredFrames.length,
        duration: endTime - startTime,
        width: firstFrame.imageData.width * spriteColumns,
        height: firstFrame.imageData.height * Math.ceil(filteredFrames.length / spriteColumns),
        frameWidth: firstFrame.imageData.width,
        frameHeight: firstFrame.imageData.height
      };

    } catch (error) {
      throw error;
    }
  }

  private async generateSpriteSheet(
    frames: ImageData[],
    columns: number,
    quality: number
  ): Promise<Blob> {
    if (!this.canvasElement || !this.ctx || frames.length === 0) {
      throw new Error('Cannot generate sprite sheet: missing data');
    }

    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const rows = Math.ceil(frames.length / columns);

    // Set canvas size for sprite sheet
    this.canvasElement.width = frameWidth * columns;
    this.canvasElement.height = frameHeight * rows;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw frames to sprite sheet
    frames.forEach((frame, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * frameWidth;
      const y = row * frameHeight;

      // Create temporary canvas for this frame
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = frameWidth;
      tempCanvas.height = frameHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        tempCtx.putImageData(frame, 0, 0);
        this.ctx?.drawImage(tempCanvas, x, y);
      }
    });

    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
      this.canvasElement?.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate sprite sheet blob'));
          }
        },
        'image/png',
        quality
      );
    });
  }

  // Utility method to get video metadata without processing
  async getVideoMetadata(videoFile: File): Promise<{
    duration: number;
    width: number;
    height: number;
    frameRate?: number;
  }> {
    if (!this.videoElement) {
      throw new Error('Video element not initialized');
    }

    return new Promise((resolve, reject) => {
      const videoUrl = URL.createObjectURL(videoFile);
      this.videoElement!.src = videoUrl;

      this.videoElement!.onloadedmetadata = () => {
        const metadata = {
          duration: this.videoElement!.duration,
          width: this.videoElement!.videoWidth,
          height: this.videoElement!.videoHeight,
          frameRate: undefined // Would need more complex detection
        };
        URL.revokeObjectURL(videoUrl);
        resolve(metadata);
      };

      this.videoElement!.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('Failed to load video metadata'));
      };
    });
  }

  /**
   * Apply chroma key (green screen) effect to remove background color
   */
  applyChromaKey(
    frame: ImageData,
    keyColor: { r: number; g: number; b: number; a: number },
    tolerance: number = 32,
    feather: number = 8,
    contract: number = 1,
    edgeBlur: number = 1
  ): ImageData {
    const { width, height, data } = frame;
    const result = new ImageData(width, height);
    const resultData = result.data;

    // Create mask for pixels to remove
    const mask = new Uint8Array(width * height);

    // Step 1: Create initial mask based on color distance
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color distance
      const dr = r - keyColor.r;
      const dg = g - keyColor.g;
      const db = b - keyColor.b;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);

      const pixelIndex = i / 4;
      mask[pixelIndex] = distance <= tolerance ? 0 : 255; // 0 = transparent, 255 = opaque
    }

    // Step 2: Apply contract/erode to refine mask
    if (contract > 0) {
      this.applyContract(mask, width, height, contract);
    }

    // Step 3: Apply edge blur to soften transitions
    if (edgeBlur > 0) {
      this.applyEdgeBlur(mask, width, height, edgeBlur);
    }

    // Step 4: Apply feather to create smooth alpha transitions
    if (feather > 0) {
      this.applyFeather(mask, width, height, feather);
    }

    // Step 5: Apply mask to create final image
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const alpha = mask[pixelIndex] / 255;

      resultData[i] = data[i];     // R
      resultData[i + 1] = data[i + 1]; // G
      resultData[i + 2] = data[i + 2]; // B
      resultData[i + 3] = Math.round(data[i + 3] * alpha); // A
    }

    return result;
  }

  private applyContract(mask: Uint8Array, width: number, height: number, amount: number) {
    if (amount === 0) return;

    const temp = new Uint8Array(mask);
    const result = new Uint8Array(mask);

    // Contract/Erode factor - positive values contract, negative values expand
    const contractFactor = amount;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        if (temp[idx] > 0) { // Only process non-transparent pixels
          const neighbors = [
            temp[(y - 1) * width + x],     // top
            temp[y * width + (x + 1)],     // right
            temp[(y + 1) * width + x],     // bottom
            temp[y * width + (x - 1)]      // left
          ];

          // Count transparent and opaque neighbors
          const transparentNeighbors = neighbors.filter(n => n === 0).length;
          const opaqueNeighbors = neighbors.filter(n => n === 255).length;

          let newValue = temp[idx];

          if (contractFactor > 0) {
            // Contract: if we have transparent neighbors, reduce opacity
            if (transparentNeighbors > 0) {
              const reduction = (transparentNeighbors / 4) * contractFactor * 0.5;
              newValue = Math.max(0, temp[idx] - (reduction * 255));
            }
          } else if (contractFactor < 0) {
            // Expand: if we have opaque neighbors, increase opacity
            if (opaqueNeighbors > 0) {
              const increase = (opaqueNeighbors / 4) * Math.abs(contractFactor) * 0.5;
              newValue = Math.min(255, temp[idx] + (increase * 255));
            }
          }

          result[idx] = Math.round(newValue);
        } else {
          result[idx] = 0;
        }
      }
    }

    // Copy result back to mask
    mask.set(result);
  }

  private applyEdgeBlur(mask: Uint8Array, width: number, height: number, amount: number) {
    const kernelSize = Math.max(1, Math.floor(amount));
    const temp = new Uint8Array(mask);

    for (let y = kernelSize; y < height - kernelSize; y++) {
      for (let x = kernelSize; x < width - kernelSize; x++) {
        const idx = y * width + x;

        // Only blur edges (pixels that are partially transparent)
        if (temp[idx] > 0 && temp[idx] < 255) {
          let sum = 0;
          let count = 0;

          // Simple box blur
          for (let ky = -kernelSize; ky <= kernelSize; ky++) {
            for (let kx = -kernelSize; kx <= kernelSize; kx++) {
              const nidx = (y + ky) * width + (x + kx);
              sum += temp[nidx];
              count++;
            }
          }

          mask[idx] = Math.round(sum / count);
        }
      }
    }
  }

  private applyFeather(mask: Uint8Array, width: number, height: number, amount: number) {
    if (amount <= 0) return;

    const featherRadius = Math.max(1, Math.floor(amount));
    const temp = new Uint8Array(mask);
    const result = new Uint8Array(mask);

    // Simple box blur approach for feathering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;

        // Only process pixels that are not fully transparent
        if (temp[idx] > 0) {
          let sum = 0;
          let count = 0;

          // Sample neighboring pixels within feather radius
          for (let dy = -featherRadius; dy <= featherRadius; dy++) {
            for (let dx = -featherRadius; dx <= featherRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                sum += temp[nidx];
                count++;
              }
            }
          }

          // Average the values to create smooth transition
          if (count > 0) {
            result[idx] = Math.round(sum / count);
          } else {
            result[idx] = temp[idx];
          }
        } else {
          result[idx] = 0; // Keep transparent pixels transparent
        }
      }
    }

    // Copy result back to mask
    mask.set(result);
  }
}