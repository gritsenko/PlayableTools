import { injectable, ServiceLifetime } from 'fw';
import type { PlatformConfig, PlayableProcessOptions } from './types';
// @ts-ignore
import platformsConfig from '../assets/platforms-config.json';

@injectable(ServiceLifetime.Singleton)
export class PlayablePublishService {
  private config: PlatformConfig[] = [];

  constructor() {
    // Load config from JSON file at construction
    this.loadConfig(platformsConfig);
  }
  /**
   * Loads the platforms config from the provided JSON object.
   */
  loadConfig(configJson: any) {
    if (Array.isArray(configJson.platforms)) {
      this.config = configJson.platforms;
      console.log('PlayablePublishService: Loaded platforms config:', this.config);
    } else {
      throw new Error('Invalid config: platforms array missing');
    }
  }

  /**
   * Returns the loaded platform configs.
   */
  getPlatforms(): PlatformConfig[] {
    return this.config;
  }

  /**
   * Returns the list of available platform names.
   */
  getAvailablePlatforms(): string[] {
    return this.config.map(p => p.Name);
  }

  /**
   * Processes an uploaded HTML file according to the platform rules.
   * @param htmlContent The HTML file content as string
   * @param platformName The name of the platform to process for
   * @param options Optional processing options
   * @returns Processed HTML as string
   */
  async processHtml(htmlContent: string, platformName: string, options?: PlayableProcessOptions): Promise<string> {
    const platform = this.config.find(p => p.Name === platformName);
    if (!platform) throw new Error(`Platform '${platformName}' not found in config`);

    let resultHtml = htmlContent;

    // Inject scripts if specified
    if (platform.InjeectScripts && Array.isArray(platform.InjeectScripts)) {
      resultHtml = await this.injectScripts(resultHtml, platform.InjeectScripts);
    }

    // Output index.html name replacement
    if (platform.OutputIndexHtmlName && options?.name) {
      // Optionally handle renaming logic here
      // This is just a placeholder for actual file renaming logic
      // e.g., options.outputFileName = platform.OutputIndexHtmlName.replace('%name%', options.name);
    }

    // Additional processing rules can be added here (e.g., ExtractScripts, ExtraFiles, Sizes, etc.)

    return resultHtml;
  }

  /**
   * Injects script tags in the head section before any existing script tags.
   */
  private async injectScripts(html: string, scripts: string[]): Promise<string> {
    let result = html;
    
    for (const scriptSrc of scripts) {
      try {
        // Fetch the script content from public folder
        const response = await fetch(`/publish-data/${scriptSrc}`);
        if (response.ok) {
          const scriptContent = await response.text();
          const scriptTag = `<script>\n${scriptContent}\n</script>`;
          
          // Try to inject in head before existing scripts
          if (/<head[^>]*>/i.test(result)) {
            // Check if there are existing script tags in head
            const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);
            if (headMatch) {
              const headContent = headMatch[2];
              const firstScriptMatch = headContent.match(/<script[^>]*>/i);
              
              if (firstScriptMatch) {
                // Insert before the first script tag in head
                const insertIndex = headMatch.index! + headMatch[1].length + headContent.indexOf(firstScriptMatch[0]);
                result = result.slice(0, insertIndex) + `\n${scriptTag}\n` + result.slice(insertIndex);
              } else {
                // No existing scripts in head, add at the end of head
                result = result.replace(/<\/head>/i, `${scriptTag}\n</head>`);
              }
            }
          } else if (/<\/body>/i.test(result)) {
            // Fallback: inject before closing body tag if no head section
            result = result.replace(/<\/body>/i, `${scriptTag}\n</body>`);
          } else {
            // Last resort: append to the end
            result = result + scriptTag;
          }
        } else {
          console.warn(`Could not load script: ${scriptSrc}`);
        }
      } catch (error) {
        console.warn(`Failed to inject script ${scriptSrc}:`, error);
      }
    }
    
    return result;
  }

  /**
   * Processes the playable for all platforms and saves to the specified directory
   * @param htmlContent The HTML file content as string
   * @param options Processing options including output directory and metadata
   * @returns Promise that resolves when processing is complete
   */
  /**
   * Processes the playable for selected platforms and saves to the specified directory
   * @param htmlContent The HTML file content as string
   * @param options Processing options including output directory and metadata
   * @param options.selectedPlatforms Optional array of platform names to process
   * @returns Promise that resolves when processing is complete
   */
  async processAllPlatforms(htmlContent: string, options: PlayableProcessOptions & { selectedPlatforms?: string[] }): Promise<void> {
    if (!options.outputDirectory) {
      throw new Error('Output directory is required');
    }

    // Ensure we have default values
    const playableName = options.name || 'Playable';
    const suffix = options.suffix || 'EN';

    // Determine which platforms to process
    let platformsToProcess = this.config;
    if (options.selectedPlatforms && Array.isArray(options.selectedPlatforms) && options.selectedPlatforms.length > 0) {
      platformsToProcess = this.config.filter(p => options.selectedPlatforms!.includes(p.Name));
    }

    const totalPlatforms = platformsToProcess.length;
    let completedPlatforms = 0;

    for (const platform of platformsToProcess) {
      // Create platform subdirectory
      const platformDirHandle = await this.createPlatformDirectory(options.outputDirectory, platform.Name);

      const processedHtml = await this.processHtml(htmlContent, platform.Name, options);
      const fileName = this.generateFileName(playableName, platform.Name, suffix, platform);

      if (platform.format === 'zip') {
        await this.createZipPackageToDirectory(processedHtml, fileName, platformDirHandle, platform);
      } else {
        await this.saveHtmlFileToDirectory(processedHtml, fileName, platformDirHandle);
      }

      completedPlatforms++;
      const progress = 30 + (completedPlatforms / totalPlatforms) * 70; // 30% to 100%
      options.onProgress?.(progress, platform.Name);
    }
  }

  /**
   * Generates the output filename based on the pattern
   */
  private generateFileName(playableName: string, platformName: string, suffix: string, platform: PlatformConfig): string {
    if (platform.OutputIndexHtmlName) {
      if (platform.OutputIndexHtmlName.includes('%name%')) {
        return platform.OutputIndexHtmlName.replace('%name%', playableName);
      }
      return platform.OutputIndexHtmlName;
    }
    // Default pattern: GoH_PBCustomHero3D_Facebook_EN.html
    return `${playableName}_${platformName}_${suffix}.html`;
  }

  /**
   * Creates a platform subdirectory using the File System Access API
   */
  private async createPlatformDirectory(parentDir: FileSystemDirectoryHandle, platformName: string): Promise<FileSystemDirectoryHandle> {
    try {
      // Try to get existing directory or create new one
      const platformDir = await parentDir.getDirectoryHandle(platformName, { create: true });
      console.log(`Created/accessed directory: ${platformName}`);
      return platformDir;
    } catch (error) {
      throw new Error(`Failed to create platform directory ${platformName}: ${error}`);
    }
  }

  /**
   * Saves an HTML file to the specified directory using File System Access API
   */
  private async saveHtmlFileToDirectory(content: string, fileName: string, directory: FileSystemDirectoryHandle): Promise<void> {
    try {
      const fileHandle = await directory.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      const sizeKB = (content.length / 1024).toFixed(2);
      console.log(`Saved HTML file: ${fileName} (${sizeKB} KB)`);
    } catch (error) {
      throw new Error(`Failed to save HTML file ${fileName}: ${error}`);
    }
  }

  /**
   * Creates a ZIP package with the processed HTML and extra files and saves to directory
   */
  private async createZipPackageToDirectory(
    htmlContent: string, 
    fileName: string, 
    directory: FileSystemDirectoryHandle, 
    platform: PlatformConfig
  ): Promise<void> {
    try {
      // Dynamic import of JSZip for creating zip files
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add the main HTML file
      zip.file(fileName, htmlContent);

      // Add extra files if specified
      if (platform.ExtraFiles) {
        for (const extraFile of platform.ExtraFiles) {
          try {
            // Try to load from public folder
            const publicPath = `/publish-data/${extraFile.from.replace('./', '')}`;
            const response = await fetch(publicPath);
            if (response.ok) {
              const content = await response.text();
              zip.file(extraFile.to.replace('./', ''), content);
            } else {
              console.warn(`Could not load extra file from: ${publicPath}`);
            }
          } catch (error) {
            console.warn(`Could not load extra file: ${extraFile.from}`, error);
          }
        }
      }

      // Generate zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Save zip file to directory
      const zipFileName = fileName.replace('.html', '.zip');
      const fileHandle = await directory.getFileHandle(zipFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(zipBlob);
      await writable.close();
      
      const sizeKB = (zipBlob.size / 1024).toFixed(2);
      console.log(`Saved ZIP file: ${zipFileName} (${sizeKB} KB)`);
    } catch (error) {
      throw new Error(`Failed to create ZIP package ${fileName}: ${error}`);
    }
  }

  /**
   * Requests a directory handle from the user using File System Access API
   */
  async requestOutputDirectory(): Promise<FileSystemDirectoryHandle> {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore - File System Access API
        const dirHandle = await window.showDirectoryPicker();
        console.log(`Selected output directory: ${dirHandle.name}`);
        return dirHandle;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Directory selection was cancelled');
        }
        throw new Error(`Failed to select directory: ${error}`);
      }
    } else {
      throw new Error('File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser.');
    }
  }
}
