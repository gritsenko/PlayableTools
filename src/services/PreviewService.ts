import { injectable } from "fw";
import pako from "pako";
import type { PreviewPreset, PreviewPresetsConfig } from "./types";
import previewPresetsConfig from "../assets/preview-presets.json";
import { GeneralValidator, FacebookValidator, MraidValidator, type ValidationResult } from "./PreviewServiceValidators";

type ZipAssetPayload = {
  path: string;
  mime: string;
  buffer: ArrayBuffer;
};

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
    console.log(`📥 PreviewService: Fetching raw content from ${rawUrl}`);
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const originalContent = await response.text();
    
    console.log(`📥 PreviewService: Fetched ${originalContent.length} chars from GitHub`);
    
    // Store original content and URL for preset switching
    this._originalGithubContent = originalContent;
    
    // Process content with current preset
    console.log(`⚙️ PreviewService: Processing content with preset`);
    const processedContent = await this.processContentWithPreset(originalContent);
    console.log(`⚙️ PreviewService: Processed content is ${processedContent.length} chars`);
    
    // Run validation on the processed content
    const fileSize = new Blob([processedContent]).size;
    console.log(`✅ PreviewService: Running validation (${fileSize} bytes)`);
    await this.runValidation(processedContent, fileSize);

    this._lastUploadedSizeBytes = fileSize;
    await this.clearZipSession();
    
    console.log(`✅ PreviewService: fetchRawContent complete, returning ${processedContent.length} chars`);
    return processedContent;
  }

  // In-memory uploaded HTML content (not persisted). When set, components can preview it.
  private _uploadedContent: string | null = null;
  private _uploadedListeners = new Set<(content: string | null) => void>();
  private _lastUploadedSizeBytes: number | undefined;
  
  // ZIP preview session metadata served through a dedicated service worker
  private _zipSessionId: string | null = null;
  private _zipEntryPath: string | null = null;
  private _zipPreviewUrl: string | null = null;
  private _zipPreviewListeners = new Set<(url: string | null) => void>();
  private _zipSwRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
  // Store original content separately from processed content
  private _originalUploadedContent: string | null = null;
  private _originalGithubContent: string | null = null;
  
  // Preview preset configuration
  private _currentPreset: PreviewPreset | null = null;
  private _presetListeners = new Set<(preset: PreviewPreset | null) => void>();
  private _presetsConfig: PreviewPresetsConfig = previewPresetsConfig as PreviewPresetsConfig;

  // Validation results
  private _validationResults: ValidationResult | null = null;
  private _validationListeners = new Set<(results: ValidationResult | null) => void>();

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

  getZipPreviewUrl(): string | null {
    return this._zipPreviewUrl;
  }

  onZipPreviewUrlChange(cb: (url: string | null) => void): () => void {
    this._zipPreviewListeners.add(cb);
    return () => this._zipPreviewListeners.delete(cb);
  }

  private setZipPreviewUrl(url: string | null): void {
    this._zipPreviewUrl = url;
    for (const cb of Array.from(this._zipPreviewListeners)) cb(url);
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
    if (!activePreset) {
      console.log(`⚙️ PreviewService: No active preset, returning content as-is`);
      return content;
    }

    console.log(`⚙️ PreviewService: Processing content with preset: ${activePreset.name}`);
    let processedContent = content;

    // Apply token replacements
    for (const [find, replace] of Object.entries(activePreset.replaceTokens)) {
      const regex = new RegExp(find, 'g');
      const matches = processedContent.match(regex);
      if (matches) {
        console.log(`  🔄 Replacing ${matches.length} occurrences of "${find}" with "${replace}"`);
        processedContent = processedContent.replace(regex, replace);
      }
    }

    // Inject scripts
    for (const script of activePreset.injectScripts) {
      try {
        console.log(`  📜 Injecting script from ${script.source} at position ${script.position}`);
        const startTime = performance.now();
        
        const scriptContent = await this.loadScriptContent(script.source);
        const loadTime = performance.now() - startTime;
        console.log(`  📥 Script loaded in ${loadTime.toFixed(2)}ms (${scriptContent.length} chars)`);
        
        processedContent = this.injectScript(processedContent, scriptContent, script.position);
        const totalTime = performance.now() - startTime;
        console.log(`  ✅ Script injection completed in ${totalTime.toFixed(2)}ms`);
      } catch (error) {
        console.warn(`  ❌ Failed to inject script ${script.source}:`, error);
      }
    }

    console.log(`✅ PreviewService: Processing complete, ${processedContent.length} chars`);
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
    await this.clearZipSession();
    
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

      // Run validation on the processed content
      await this.runValidation(processedContent, file.size);

      this._lastUploadedSizeBytes = file.size;
      this.setZipPreviewUrl(null);

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
   * Validates if the file is a ZIP archive based on extension
   */
  private isZipFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.zip');
  }

  /**
   * Handles ZIP archive upload. Unpacks archive, registers all assets with the
   * preview service worker, and serves the playable from a virtual URL so the
   * playable can load assets by relative paths (HTML, JS, CSS, audio, video, images, etc.).
   */
  async handleZipUpload(file: File): Promise<string> {
    const preset = this.getCurrentPreset();

    if (!this.isZipFile(file)) {
      throw new Error('Please select a valid ZIP archive (.zip)');
    }

    const maxSizeInMB = preset?.maxFileSizeMB || 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`ZIP size must be less than ${maxSizeInMB}MB (${preset?.name || 'current preset'} limit)`);
    }

    await this.clearZipSession();

    const JSZip = (await import('jszip')).default as any;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const entries = Object.keys(zip.files).map(path => ({ path, isDir: zip.files[path].dir }));
    const htmlPaths = entries.filter(e => !e.isDir && e.path.toLowerCase().endsWith('.html')).map(e => e.path);
    if (htmlPaths.length === 0) {
      throw new Error('ZIP does not contain any HTML files');
    }

    const entryHtmlPath = htmlPaths.find(p => p.toLowerCase().endsWith('/index.html') || p.toLowerCase() === 'index.html') || htmlPaths[0];
    this._zipEntryPath = entryHtmlPath;

    const rawEntryHtml = await zip.files[entryHtmlPath].async('string') as string;
    this._originalUploadedContent = rawEntryHtml;
    this._originalGithubContent = null;

    const processedContent = await this.processContentWithPreset(rawEntryHtml, preset || undefined);
    await this.runValidation(processedContent, file.size);

    const sessionId = crypto.randomUUID();
    this._zipSessionId = sessionId;

    const encoder = new TextEncoder();
    const assets: ZipAssetPayload[] = [];

    for (const entry of entries) {
      if (entry.isDir) continue;
      const normalizedPath = this.normalizePath('', entry.path);
      const mime = entry.path === entryHtmlPath ? 'text/html' : (this.getMimeType(entry.path) || 'application/octet-stream');

      if (entry.path === entryHtmlPath) {
        const htmlBuffer = encoder.encode(processedContent);
        assets.push({ path: normalizedPath, mime, buffer: htmlBuffer.buffer });
        continue;
      }

      const fileContent = await zip.files[entry.path].async('uint8array') as Uint8Array;
      const fileCopy = fileContent.slice();
      assets.push({ path: normalizedPath, mime, buffer: fileCopy.buffer });
    }

    await this.registerZipSessionAssets(sessionId, assets);

    const previewUrl = this.buildZipPreviewUrl(sessionId, entryHtmlPath);
    this.setZipPreviewUrl(previewUrl);

    this._lastUploadedSizeBytes = file.size;
    this.setUploadedContent(processedContent);

    return processedContent;
  }

  /**
   * Very small mime-type map for common playable asset types
   */
  private getMimeType(filePath: string): string | null {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'html': return 'text/html';
      case 'htm': return 'text/html';
      case 'js': return 'application/javascript';
      case 'mjs': return 'application/javascript';
      case 'css': return 'text/css';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'webp': return 'image/webp';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'json': return 'application/json';
      case 'xml': return 'application/xml';
      case 'txt': return 'text/plain';
      default: return null;
    }
  }

  private normalizePath(baseDir: string, relative: string): string {
    if (relative.startsWith('/')) {
      return relative.replace(/^\//, '');
    }
    const parts = (baseDir + relative).split('/');
    const out: string[] = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') { out.pop(); continue; }
      out.push(part);
    }
    return out.join('/');
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
    void this.clearZipSession();
    this._lastUploadedSizeBytes = undefined;
    console.log(`🧹 Cleared all content (processed and original)`);
  }

  /**
   * Reloads current content with a different preset
   */
  async reloadContentWithPreset(preset: PreviewPreset): Promise<void> {
    console.log(`🔄 Reloading content with preset: ${preset.name}`);
    
    this.setCurrentPreset(preset);

    if (this._zipSessionId && this._zipEntryPath && this._originalUploadedContent) {
      console.log(`📦 Updating ZIP session content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalUploadedContent, preset);
      await this.runValidation(processedContent, new Blob([processedContent]).size);
      this.setUploadedContent(processedContent);
      await this.updateZipEntryHtmlAsset(this._zipSessionId, this._zipEntryPath, processedContent);
      return;
    }
    
    // If we have original uploaded content, reprocess it
    if (this._originalUploadedContent) {
      console.log(`📁 Reprocessing uploaded content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalUploadedContent, preset);
      await this.runValidation(processedContent, new Blob([processedContent]).size);
      this.setUploadedContent(processedContent);
      return;
    }
    
    // If we have original GitHub content, reprocess it
    if (this._originalGithubContent) {
      console.log(`🔗 Reprocessing GitHub content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalGithubContent, preset);
      await this.runValidation(processedContent, new Blob([processedContent]).size);
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
    const hasZipPreview = !!this._zipPreviewUrl;
    const hasContent = content !== null || hasZipPreview;
    return {
      hasContent,
      size: hasContent ? this._lastUploadedSizeBytes ?? (content ? new Blob([content]).size : undefined) : undefined
    };
  }

  /**
   * Checks if we have original content that can be reprocessed
   */
  hasOriginalContent(): boolean {
    return this._originalUploadedContent !== null || this._originalGithubContent !== null;
  }

  private getBasePath(): string {
    const base = import.meta.env.BASE_URL || '/';
    return base.endsWith('/') ? base : `${base}/`;
  }

  private getZipPreviewScope(): string {
    return `${this.getBasePath()}zip-preview/`;
  }

  private getZipPreviewSwUrl(): string {
    return `${this.getBasePath()}zip-preview-sw.js`;
  }

  private buildZipPreviewUrl(sessionId: string, entryPath: string): string {
    const normalizedEntry = this.normalizePath('', entryPath);
    return `${this.getZipPreviewScope()}${sessionId}/${normalizedEntry}`;
  }

  private async getZipServiceWorker(): Promise<ServiceWorker | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('PreviewService: Service workers are not supported in this browser');
      return null;
    }

    if (!this._zipSwRegistrationPromise) {
      this._zipSwRegistrationPromise = (async () => {
        try {
          return await navigator.serviceWorker.register(this.getZipPreviewSwUrl(), {
            scope: this.getZipPreviewScope()
          });
        } catch (error) {
          console.warn('PreviewService: Failed to register zip preview service worker', error);
          return null;
        }
      })();
    }

    const registration = await this._zipSwRegistrationPromise;
    if (!registration) return null;

    const resolveWorker = async (worker: ServiceWorker | null): Promise<ServiceWorker | null> => {
      if (!worker) return null;
      if ((worker.state as string) === 'activated') return worker;
      await new Promise<void>((resolve) => {
        const listener = () => {
          const state = worker.state as string;
          if (state === 'activated' || state === 'redundant') {
            worker.removeEventListener('statechange', listener);
            resolve();
          }
        };
        worker.addEventListener('statechange', listener);
      });
      return (worker.state as string) === 'activated' ? worker : registration.active ?? null;
    };

    return (await resolveWorker(registration.active))
      || (await resolveWorker(registration.waiting))
      || (await resolveWorker(registration.installing));
  }

  private async postMessageToZipSw(message: any, transferables: Transferable[] = []): Promise<void> {
    const worker = await this.getZipServiceWorker();
    if (!worker) return;
    worker.postMessage(message, transferables);
  }

  private async registerZipSessionAssets(sessionId: string, assets: ZipAssetPayload[]): Promise<void> {
    const transferables = assets.map(asset => asset.buffer);
    await this.postMessageToZipSw({
      type: 'ZIP_SESSION_REGISTER',
      sessionId,
      assets
    }, transferables);
  }

  private async updateZipEntryHtmlAsset(sessionId: string, entryPath: string, html: string): Promise<void> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(html).buffer as ArrayBuffer;
    await this.postMessageToZipSw({
      type: 'ZIP_SESSION_UPDATE_ENTRY',
      sessionId,
      asset: {
        path: this.normalizePath('', entryPath),
        mime: 'text/html',
        buffer
      }
    }, [buffer]);
  }

  private async clearZipSession(sessionId?: string): Promise<void> {
    const targetSession = sessionId || this._zipSessionId;
    if (!targetSession) return;
    await this.postMessageToZipSw({
      type: 'ZIP_SESSION_CLEAR',
      sessionId: targetSession
    });
    if (!sessionId) {
      this._zipSessionId = null;
      this._zipEntryPath = null;
      this.setZipPreviewUrl(null);
    }
  }

  /**
   * Runs validation on the current content using appropriate validators
   */
  private async runValidation(content: string, fileSize: number): Promise<void> {
    try {
      console.log(`🔍 PreviewService: Running validation on ${fileSize} bytes`);
      const preset = this.getCurrentPreset();
      const results: ValidationResult = { categories: [] };

      // Always run general validation
      const generalValidator = new GeneralValidator();
      const generalResults = generalValidator.validate(content, fileSize);
      results.categories.push(...generalResults.categories);
      console.log(`✅ PreviewService: General validation complete, ${generalResults.categories.length} categories`);

      // Run preset-specific validation
      if (preset) {
        console.log(`⚙️ PreviewService: Running ${preset.name} preset validation`);
        switch (preset.id) {
          case 'facebook':
            const facebookValidator = new FacebookValidator();
            const facebookResults = facebookValidator.validate(content, fileSize);
            results.categories.push(...facebookResults.categories);
            console.log(`✅ PreviewService: Facebook validation complete`);
            break;
          case 'mraid':
            const mraidValidator = new MraidValidator();
            const mraidResults = mraidValidator.validate(content, fileSize);
            results.categories.push(...mraidResults.categories);
            console.log(`✅ PreviewService: MRAID validation complete`);
            break;
          default:
            console.log(`ℹ️ PreviewService: No preset-specific validation for ${preset.id}`);
        }
      }

      console.log(`✅ PreviewService: Validation complete, ${results.categories.length} total categories, notifying ${this._validationListeners.size} listeners`);
      this._validationResults = results;
      for (const cb of Array.from(this._validationListeners)) cb(results);
    } catch (err) {
      console.error(`❌ PreviewService: Validation error:`, err);
      const errorResults: ValidationResult = {
        categories: [{
          name: 'Validation Error',
          checks: [{
            name: 'Validation Process',
            passed: false,
            isWarning: false,
            details: err instanceof Error ? err.message : String(err)
          }]
        }]
      };
      this._validationResults = errorResults;
      for (const cb of Array.from(this._validationListeners)) cb(errorResults);
    }
  }

  /**
   * Gets the current validation results
   */
  getValidationResults(): ValidationResult | null {
    return this._validationResults;
  }

  /**
   * Subscribe to validation result changes
   */
  onValidationChange(cb: (results: ValidationResult | null) => void): () => void {
    this._validationListeners.add(cb);
    return () => this._validationListeners.delete(cb);
  }

  /**
   * Utility: Returns warning checks (passed but details present)
   */
  getWarnings(): { category: string; check: string; details: string }[] {
    const results = this.getValidationResults();
    if (!results) return [];
    const warnings: { category: string; check: string; details: string }[] = [];
    for (const cat of results.categories) {
      for (const check of cat.checks) {
        if (check.passed && check.details) {
          warnings.push({ category: cat.name, check: check.name, details: check.details });
        }
      }
    }
    return warnings;
  }

  /**
   * Called when the preview page toggles a simulated screen lock.
   * This will invoke the emulated SDK helpers (currently mraid shim)
   * to raise a viewableChange event. The mraid viewableChange expects
   * a boolean where true = viewable (unlocked) and false = not viewable (locked).
   */
  handleScreenLockChange(locked: boolean): void {
    try {
      // Dispatch a generic event; SDK-specific shims (like mraid.js) should
      // listen for this and translate into appropriate SDK events.
      const ev = new CustomEvent('playable-screen-lock', { detail: { locked } });
      window.dispatchEvent(ev);
      console.log('PreviewService: dispatched playable-screen-lock', locked);
    } catch (err) {
      console.warn('PreviewService: handleScreenLockChange failed', err);
    }
  }
}
