import { injectable } from "fw";
import pako from "pako";
import type { PreviewPreset, PreviewPresetsConfig } from "./types";
import previewPresetsConfig from "../assets/preview-presets.json";
import { GeneralValidator, FacebookValidator, MraidValidator, type ValidationResult } from "./PreviewServiceValidators";

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
    const processedContent = await this.processContentWithPreset(originalContent);
    
    // Run validation on the processed content
    const fileSize = new Blob([processedContent]).size;
    await this.runValidation(processedContent, fileSize);
    
    return processedContent;
  }

  // In-memory uploaded HTML content (not persisted). When set, components can preview it.
  private _uploadedContent: string | null = null;
  private _uploadedListeners = new Set<(content: string | null) => void>();
  
  // When a ZIP is uploaded we create blob: URLs for contained files so the entry HTML
  // can load assets by relative paths. Store mapping and created URLs so we can revoke them.
  private _zipBlobUrlMap: Record<string, string> = {};
  private _createdBlobUrls = new Set<string>();
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

      // Run validation on the processed content
      await this.runValidation(processedContent, file.size);

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
   * Handles ZIP archive upload. Unpacks archive, creates blob: URLs for assets,
   * rewrites the entry HTML to point to those blob URLs and sets uploaded content.
   * The method chooses an entry HTML file (index.html or first .html) automatically.
   */
  async handleZipUpload(file: File): Promise<string> {
    const preset = this.getCurrentPreset();

    if (!this.isZipFile(file)) {
      throw new Error('Please select a valid ZIP archive (.zip)');
    }

    // Validate size against preset (zipped size)
    const maxSizeInMB = preset?.maxFileSizeMB || 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`ZIP size must be less than ${maxSizeInMB}MB (${preset?.name || 'current preset'} limit)`);
    }

    // Cleanup any previous blob URLs
    this.revokeBlobUrls();

    // Load JSZip dynamically (project already uses JSZip elsewhere)
    const JSZip = (await import('jszip')).default as any;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Collect file entries and create blob URLs for each file
    const fileEntries: { path: string; isDir: boolean }[] = Object.keys(zip.files).map(p => ({ path: p, isDir: zip.files[p].dir }));

    // Create blob URLs for non-directory files
    for (const entry of fileEntries) {
      if (entry.isDir) continue;
      const zfile = zip.files[entry.path];
      // Read as uint8array for binary safety
      const content = await zfile.async('uint8array') as Uint8Array;
      const mime = this.getMimeType(entry.path) || 'application/octet-stream';
  // content is Uint8Array - use its underlying ArrayBuffer for the Blob constructor
  const blob = new Blob([content.buffer as ArrayBuffer], { type: mime });
      const url = URL.createObjectURL(blob);
      this._zipBlobUrlMap[entry.path] = url;
      this._createdBlobUrls.add(url);
    }

    // Determine entry HTML file: prefer index.html at root, otherwise first .html
    const htmlPaths = Object.keys(zip.files).filter(p => !zip.files[p].dir && p.toLowerCase().endsWith('.html'));
    if (htmlPaths.length === 0) {
      // cleanup created urls
      this.revokeBlobUrls();
      throw new Error('ZIP does not contain any HTML files');
    }

    let entryHtmlPath = htmlPaths.find(p => p.toLowerCase().endsWith('/index.html') || p.toLowerCase() === 'index.html') || htmlPaths[0];

    const rawHtml = await zip.files[entryHtmlPath].async('string') as string;

    // Rewrite HTML to point relative references to blob URLs
    const rewritten = this.rewriteHtmlPaths(rawHtml, entryHtmlPath);

    // Store original uploaded content as the rewritten HTML (so preview shows correctly)
    this._originalUploadedContent = rewritten;
    this._originalGithubContent = null;

    // Run preset processing and validation on the rewritten HTML
    const processedContent = await this.processContentWithPreset(rewritten, preset || undefined);
    const totalSize = this.calculateZipPreviewSize(processedContent);
    await this.runValidation(processedContent, totalSize);

    // Set processed content so components can preview it
    this.setUploadedContent(processedContent);

    return processedContent;
  }

  private calculateZipPreviewSize(processedHtml: string): number {
    // Best-effort: return processed HTML size. We could store individual asset sizes when creating blobs
    return new Blob([processedHtml]).size;
  }

  private revokeBlobUrls() {
    for (const url of this._createdBlobUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        // ignore
      }
    }
    this._createdBlobUrls.clear();
    this._zipBlobUrlMap = {};
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

  /**
   * Rewrites relative asset paths in the HTML string to blob: URLs created from the ZIP.
   * entryPath is the path (inside zip) of the HTML file we will use as the entry point.
   */
  private rewriteHtmlPaths(html: string, entryPath: string): string {
    const baseDir = entryPath.includes('/') ? entryPath.slice(0, entryPath.lastIndexOf('/') + 1) : '';

    // Try to preserve DOCTYPE
    const doctypeMatch = html.match(/^<!doctype[^>]*>/i);
    const doctype = doctypeMatch ? doctypeMatch[0] + '\n' : '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const attrSelectors = [
      { sel: 'script[src]', attr: 'src' },
      { sel: 'link[href]', attr: 'href' },
      { sel: 'img[src]', attr: 'src' },
      { sel: 'audio[src]', attr: 'src' },
      { sel: 'video[src]', attr: 'src' },
      { sel: 'source[src]', attr: 'src' },
      { sel: 'track[src]', attr: 'src' },
      { sel: 'iframe[src]', attr: 'src' },
      { sel: 'embed[src]', attr: 'src' },
      { sel: 'object[data]', attr: 'data' }
    ];

    for (const s of attrSelectors) {
      const nodes = Array.from(doc.querySelectorAll(s.sel));
      for (const node of nodes) {
        const el = node as Element;
        const original = el.getAttribute(s.attr);
        if (!original) continue;
        const mapped = this.mapZipPathToBlobUrl(original, baseDir);
        if (mapped) el.setAttribute(s.attr, mapped);
      }
    }

    // Replace url(...) in inline styles and <style> blocks
    // Inline style attributes
    const styled = Array.from(doc.querySelectorAll<HTMLElement>('[style]'));
    for (const el of styled) {
      const style = el.getAttribute('style') || '';
      const replaced = style.replace(/url\(([^)]+)\)/g, (m, g1) => {
        const raw = g1.replace(/^['"]|['"]$/g, '').trim();
        const mapped = this.mapZipPathToBlobUrl(raw, baseDir);
        return mapped ? `url(${mapped})` : m;
      });
      if (replaced !== style) el.setAttribute('style', replaced);
    }

    // <style> tag contents
    const styleTags = Array.from(doc.querySelectorAll('style'));
    for (const tag of styleTags) {
      const text = tag.textContent || '';
      const replaced = text.replace(/url\(([^)]+)\)/g, (m, g1) => {
        const raw = g1.replace(/^['"]|['"]$/g, '').trim();
        const mapped = this.mapZipPathToBlobUrl(raw, baseDir);
        return mapped ? `url(${mapped})` : m;
      });
      if (replaced !== text) tag.textContent = replaced;
    }

    // Serialize back to string
    const serialized = doc.documentElement.outerHTML;
    return doctype + serialized;
  }

  private mapZipPathToBlobUrl(rawPath: string, baseDir: string): string | null {
    // Ignore absolute URLs
    if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(rawPath) || rawPath.startsWith('data:') || rawPath.startsWith('blob:')) {
      return null;
    }

    // Remove query/hash when matching zip entries
    const clean = rawPath.split('?')[0].split('#')[0];

    const resolved = this.normalizePath(baseDir, clean);
    // Try direct match first
    if (this._zipBlobUrlMap[resolved]) return this._zipBlobUrlMap[resolved];
    // Try without leading './'
    const alt = resolved.replace(/^\.\//, '');
    if (this._zipBlobUrlMap[alt]) return this._zipBlobUrlMap[alt];
    // Try pathname variants
    const withoutLeadingSlash = resolved.replace(/^\//, '');
    if (this._zipBlobUrlMap[withoutLeadingSlash]) return this._zipBlobUrlMap[withoutLeadingSlash];

    return null;
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
    // Revoke any blob URLs created from a ZIP
    this.revokeBlobUrls();
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

  /**
   * Runs validation on the current content using appropriate validators
   */
  private async runValidation(content: string, fileSize: number): Promise<void> {
    const preset = this.getCurrentPreset();
    const results: ValidationResult = { categories: [] };

    // Always run general validation
    const generalValidator = new GeneralValidator();
    const generalResults = generalValidator.validate(content, fileSize);
    results.categories.push(...generalResults.categories);

    // Run preset-specific validation
    if (preset) {
      switch (preset.id) {
        case 'facebook':
          const facebookValidator = new FacebookValidator();
          const facebookResults = facebookValidator.validate(content, fileSize);
          results.categories.push(...facebookResults.categories);
          break;
        case 'mraid':
          const mraidValidator = new MraidValidator();
          const mraidResults = mraidValidator.validate(content, fileSize);
          results.categories.push(...mraidResults.categories);
          break;
      }
    }

    this._validationResults = results;
    for (const cb of Array.from(this._validationListeners)) cb(results);
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
