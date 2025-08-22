import { injectable } from "fw";
import pako from "pako";
import type { PreviewPreset, PreviewPresetsConfig } from "./types";
import previewPresetsConfig from "../assets/preview-presets.json";

@injectable()
export class PreviewService {
  // Example: fetch playable ad data, generate shareable links, etc.
  getShareableLink(adId: string, size: string, orientation: string): string {
    // This is a stub. Replace with real logic as needed.
    const params = new URLSearchParams({ adId, size, orientation });
    return `${window.location.origin}/preview?${params.toString()}`;
  }

  encodeUrl(longUrl: string): string {
    const compressed = pako.deflate(longUrl) as Uint8Array;
    const str = String.fromCharCode(...Array.from(compressed));
    const base64 = btoa(str);
    const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    return urlSafe;
  }

  decodeUrl(encodedStr: string): string {
    let base64 = encodedStr.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const compressedStr = atob(base64);
    const compressed = new Uint8Array([...compressedStr].map(char => char.charCodeAt(0)));
    try {
      const originalUrl = pako.inflate(compressed, { to: "string" });
      return originalUrl;
    } catch (err) {
      return String(err);
    }
  }

  /**
   * Converts a GitHub file URL to its raw content URL.
   * Example:
   * https://github.com/user/repo/blob/main/path/file.html
   * -> https://raw.githubusercontent.com/user/repo/refs/heads/main/path/file.html
   */
  githubToRawUrl(githubUrl: string): string | null {
    const match = githubUrl.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
    );
    if (!match) return null;
    const [, owner, repo, branch, path] = match;
    // Use refs/heads/branch for raw URL
    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${path}`;
  }

  /**
   * Downloads the content of a raw URL as a string.
   */
  async fetchRawContent(rawUrl: string): Promise<string> {
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const originalContent = await response.text();
    
    // Store original content and URL for preset switching
    this._originalGithubContent = originalContent;
    
    // Process content with current preset
    return await this.processContentWithPreset(originalContent);
  }

  // In-memory uploaded HTML content (not persisted). When set, components can preview it.
  private _uploadedContent: string | null = null;
  private _uploadedListeners = new Set<(content: string | null) => void>();
  
  // Store original content separately from processed content
  private _originalUploadedContent: string | null = null;
  private _originalGithubContent: string | null = null;
  
  // Preview preset configuration
  private _currentPreset: PreviewPreset | null = null;
  private _presetListeners = new Set<(preset: PreviewPreset | null) => void>();
  private _presetsConfig: PreviewPresetsConfig = previewPresetsConfig as PreviewPresetsConfig;

  setUploadedContent(content: string | null) {
    this._uploadedContent = content;
    for (const cb of Array.from(this._uploadedListeners)) cb(content);
  }

  getUploadedContent(): string | null {
    return this._uploadedContent;
  }

  onUploadedContentChange(cb: (content: string | null) => void): () => void {
    this._uploadedListeners.add(cb);
    // return unsubscribe
    return () => this._uploadedListeners.delete(cb);
  }

  /**
   * Gets all available preview presets
   */
  getAvailablePresets(): PreviewPreset[] {
    return this._presetsConfig.presets;
  }

  /**
   * Gets the default preset (first one)
   */
  getDefaultPreset(): PreviewPreset {
    return this._presetsConfig.presets[0];
  }

  /**
   * Gets preset by ID
   */
  getPresetById(id: string): PreviewPreset | null {
    return this._presetsConfig.presets.find(p => p.id === id) || null;
  }

  /**
   * Sets the current preview preset
   */
  setCurrentPreset(preset: PreviewPreset | null): void {
    const previousPreset = this._currentPreset?.name || 'none';
    console.log(`🔄 PreviewService: Changing preset from "${previousPreset}" to "${preset?.name || 'none'}"`);
    
    this._currentPreset = preset;
    for (const cb of Array.from(this._presetListeners)) cb(preset);
    
    console.log(`✅ PreviewService: Preset change completed, notified ${this._presetListeners.size} listeners`);
  }

  /**
   * Gets the current preview preset
   */
  getCurrentPreset(): PreviewPreset | null {
    return this._currentPreset || this.getDefaultPreset();
  }

  /**
   * Subscribe to preset changes
   */
  onPresetChange(cb: (preset: PreviewPreset | null) => void): () => void {
    this._presetListeners.add(cb);
    return () => this._presetListeners.delete(cb);
  }

  /**
   * Processes HTML content with the current preset settings
   */
  private async processContentWithPreset(content: string, preset?: PreviewPreset): Promise<string> {
    const activePreset = preset || this.getCurrentPreset();
    if (!activePreset) return content;

    console.log('Processing content with preset:', activePreset.name);
    let processedContent = content;

    // Apply token replacements
    for (const [find, replace] of Object.entries(activePreset.replaceTokens)) {
      const regex = new RegExp(find, 'g');
      const matches = processedContent.match(regex);
      if (matches) {
        console.log(`Replacing ${matches.length} occurrences of "${find}" with "${replace}"`);
        processedContent = processedContent.replace(regex, replace);
      }
    }

    // Inject scripts
    for (const script of activePreset.injectScripts) {
      try {
        console.log(`📜 Injecting script from ${script.source} at position ${script.position}`);
        const startTime = performance.now();
        
        const scriptContent = await this.loadScriptContent(script.source);
        const loadTime = performance.now() - startTime;
        console.log(`📥 Script loaded in ${loadTime.toFixed(2)}ms (${scriptContent.length} chars)`);
        
        processedContent = this.injectScript(processedContent, scriptContent, script.position);
        const totalTime = performance.now() - startTime;
        console.log(`✅ Script injection completed in ${totalTime.toFixed(2)}ms`);
      } catch (error) {
        console.warn(`❌ Failed to inject script ${script.source}:`, error);
      }
    }

    return processedContent;
  }

  /**
   * Loads script content from a URL or path
   */
  private async loadScriptContent(source: string): Promise<string> {
    // If source starts with '/', it's relative to the domain root
    const fullUrl = source.startsWith('/') ? `${window.location.origin}${source}` : source;
    console.log(`Loading script from: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to load script: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Injects script content at the specified position in HTML
   */
  private injectScript(html: string, scriptContent: string, position: string): string {
    const scriptTag = `<script>\n${scriptContent}\n</script>`;
    
    switch (position) {
      case 'beforeHeadEnd':
        return html.replace(/<\/head>/i, `${scriptTag}\n</head>`);
      case 'afterBodyStart':
        return html.replace(/<body[^>]*>/i, match => `${match}\n${scriptTag}`);
      case 'beforeBodyEnd':
        return html.replace(/<\/body>/i, `${scriptTag}\n</body>`);
      default:
        console.warn(`Unknown script injection position: ${position}`);
        return html;
    }
  }

  /**
   * Handles file upload from user's PC and reads HTML content
   */
  async handleFileUpload(file: File): Promise<string> {
    const preset = this.getCurrentPreset();
    
    // Validate file type
    if (!this.isValidHtmlFile(file)) {
      throw new Error('Please select a valid HTML file (.html, .htm)');
    }

    // Validate file size using preset limits
    const maxSizeInMB = preset?.maxFileSizeMB || 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size must be less than ${maxSizeInMB}MB (${preset?.name || 'current preset'} limit)`);
    }

    try {
      const originalContent = await this.readFileAsText(file);
      
      // Basic HTML validation
      if (!this.isValidHtmlContent(originalContent)) {
        throw new Error('The file does not appear to contain valid HTML content');
      }

      // Store original content for preset switching
      this._originalUploadedContent = originalContent;
      this._originalGithubContent = null; // Clear GitHub content when uploading

      // Process content with current preset
      const processedContent = await this.processContentWithPreset(originalContent, preset || undefined);

      // Set the processed content so components can access it
      this.setUploadedContent(processedContent);
      
      return processedContent;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to read the uploaded file');
    }
  }

  /**
   * Validates if the file is an HTML file based on extension
   */
  private isValidHtmlFile(file: File): boolean {
    const validExtensions = ['.html', '.htm'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Reads a file as text using FileReader
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Basic validation to check if content contains HTML
   */
  private isValidHtmlContent(content: string): boolean {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return false;
    }
    
    // Check for basic HTML structure
    const hasHtmlTags = /<html|<!DOCTYPE|<head|<body|<div|<script|<style/i.test(trimmedContent);
    return hasHtmlTags;
  }

  /**
   * Clears the uploaded content
   */
  clearUploadedContent(): void {
    this.setUploadedContent(null);
    this._originalUploadedContent = null;
    this._originalGithubContent = null;
    console.log(`🧹 Cleared all content (processed and original)`);
  }

  /**
   * Reloads current content with a different preset
   */
  async reloadContentWithPreset(preset: PreviewPreset): Promise<void> {
    console.log(`🔄 Reloading content with preset: ${preset.name}`);
    
    this.setCurrentPreset(preset);
    
    // If we have original uploaded content, reprocess it
    if (this._originalUploadedContent) {
      console.log(`📁 Reprocessing uploaded content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalUploadedContent, preset);
      this.setUploadedContent(processedContent);
      return;
    }
    
    // If we have original GitHub content, reprocess it
    if (this._originalGithubContent) {
      console.log(`🔗 Reprocessing GitHub content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalGithubContent, preset);
      this.setUploadedContent(processedContent);
      return;
    }
    
    console.log(`⚠️ No original content available to reprocess`);
  }

  /**
   * Gets file info for uploaded content
   */
  getUploadedFileInfo(): { hasContent: boolean; size?: number } {
    const content = this.getUploadedContent();
    return {
      hasContent: content !== null,
      size: content ? new Blob([content]).size : undefined
    };
  }

  /**
   * Checks if we have original content that can be reprocessed
   */
  hasOriginalContent(): boolean {
    return this._originalUploadedContent !== null || this._originalGithubContent !== null;
  }
}
