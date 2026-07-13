import { injectable } from "fw";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";
import ffmpegWorkerSource from "@ffmpeg/ffmpeg/worker?raw";
import ffmpegConstSource from "../../node_modules/@ffmpeg/ffmpeg/dist/esm/const.js?raw";
import ffmpegErrorsSource from "../../node_modules/@ffmpeg/ffmpeg/dist/esm/errors.js?raw";
import type { FFmpeg as BrowserFFmpeg } from "@ffmpeg/ffmpeg";
import html2canvas from "html2canvas";
import pako from "pako";
import type { PreviewPreset, PreviewPresetsConfig, PreviewRecordingController, PreviewRecordingResult } from "./types";
import previewPresetsConfig from "../assets/preview-presets.json";
import { GeneralValidator, FacebookValidator, MraidValidator, CtaSdkValidator, YandexGamesValidator, AdsManagerValidator, AppLovinValidator, type ValidationContext, type ValidationResult } from "./PreviewServiceValidators";

type ZipAssetPayload = {
  path: string;
  mime: string;
  buffer: ArrayBuffer;
};

type FfmpegFetchFile = typeof import("@ffmpeg/util").fetchFile;

type LoadedMp4Exporter = {
  ffmpeg: BrowserFFmpeg;
  fetchFile: FfmpegFetchFile;
};

type Mp4ExportCallbacks = {
  onStatus?: (status: string) => void;
  onProgress?: (progress: number) => void;
};

type DownloadProgressEvent = {
  url: string | URL;
  received: number;
  total: number;
};

type RemotePlayableType = 'html' | 'zip';

type PreviewRecordingOptions = {
  frameRate?: number;
  targetWidth?: number;
  targetHeight?: number;
  includeCursor?: boolean;
  outputScale?: number;
  maxOutputDimension?: number;
  captureAudio?: boolean;
};

@injectable()
export class PreviewService {
  private static readonly zipSwAckTimeoutMs = 60000;
  private static readonly recordingMinVideoBitrate = 2_000_000;
  private static readonly recordingMaxVideoBitrate = 14_000_000;
  private static readonly recordingBitsPerPixelFrame = 0.18;
  private static readonly recordingMaxOutputDimension = 1280;
  private static readonly recordingMimeTypeCandidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
  ] as const;

  private _ffmpegLoadPromise: Promise<LoadedMp4Exporter> | null = null;
  private _ffmpegStatusCallback?: (status: string) => void;
  private _ffmpegProgressCallback?: (progress: number) => void;
  private _ffmpegCoreBlobUrl: string | null = null;
  private _ffmpegWasmBlobUrl: string | null = null;
  private _ffmpegClassWorkerUrl: string | null = null;
  private _ffmpegRecentLogs: string[] = [];
  private _ffmpegExpectedDurationSec: number | null = null;
  private _fastMp4ExportSupported: boolean | null = null;

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
    this._originalZipFile = null;
    this._originalGithubContent = originalContent;
    this._validationSourceContent = originalContent;
    
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

  async loadPlayableFromUrl(sourceUrl: string): Promise<{ fileName: string; type: RemotePlayableType }> {
    const normalizedUrl = this.normalizePlayableSourceUrl(sourceUrl);
    const preset = this.getCurrentPreset();
    const maxSizeInMB = preset?.maxFileSizeMB || 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    let response: Response;
    try {
      response = await fetch(normalizedUrl, {
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
      });
    } catch (error) {
      throw this.buildRemoteFetchError(normalizedUrl, error);
    }

    if (!response.ok) {
      throw new Error(`Failed to load playable: ${response.status} ${response.statusText || 'Request failed'}`.trim());
    }

    const declaredSize = Number(response.headers.get('content-length') || '0');
    if (declaredSize > maxSizeInBytes) {
      throw new Error(`Remote file is larger than ${maxSizeInMB}MB (${preset?.name || 'current preset'} limit)`);
    }

    const payload = await response.arrayBuffer();
    if (payload.byteLength > maxSizeInBytes) {
      throw new Error(`Remote file is larger than ${maxSizeInMB}MB (${preset?.name || 'current preset'} limit)`);
    }

    const playableType = this.detectRemotePlayableType(response, normalizedUrl, payload);
    const fileName = this.getRemotePlayableFileName(response, normalizedUrl, playableType);

    if (playableType === 'zip') {
      const zipFile = new File([payload], fileName, { type: 'application/zip' });
      await this.handleZipUpload(zipFile);
      this.setUploadedFileName(fileName);
      return { fileName, type: 'zip' };
    }

    const htmlContent = new TextDecoder('utf-8').decode(payload);
    if (!this.isValidHtmlContent(htmlContent)) {
      throw new Error('The remote file was fetched successfully, but it does not contain valid HTML.');
    }

    await this.loadHtmlContentFromString(htmlContent, fileName);
    return { fileName, type: 'html' };
  }

  // In-memory uploaded HTML content (not persisted). When set, components can preview it.
  private _uploadedContent: string | null = null;
  private _uploadedFileName: string | null = null;
  private _uploadedListeners = new Set<(content: string | null) => void>();
  private _lastUploadedSizeBytes: number | undefined;
  private _portfolioPlayableId: string | null = null;
  private _originalZipFile: File | null = null;
  
  // ZIP preview session metadata served through a dedicated service worker
  private _zipSessionId: string | null = null;
  private _zipEntryPath: string | null = null;
  private _zipPreviewUrl: string | null = null;
  private _zipPreviewListeners = new Set<(url: string | null) => void>();
  private _zipSwRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
  // Store original content separately from processed content
  private _originalUploadedContent: string | null = null;
  private _originalGithubContent: string | null = null;
  private _validationSourceContent: string | null = null;
  
  // Preview preset configuration
  private _currentPreset: PreviewPreset | null = null;
  private _presetListeners = new Set<(preset: PreviewPreset | null) => void>();
  private _selectedLanguagesByPreset = new Map<string, string>();
  private _previewLanguageListeners = new Set<(language: string | null, preset: PreviewPreset | null) => void>();
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

  getUploadedFileName(): string | null {
    return this._uploadedFileName;
  }

  setUploadedFileName(name: string | null): void {
    this._uploadedFileName = name;
  }

  getOriginalZipFile(): File | null {
    return this._originalZipFile;
  }

  getOriginalUploadedContent(): string | null {
    return this._originalUploadedContent;
  }

  getOriginalSourceContent(): string | null {
    return this._originalUploadedContent ?? this._originalGithubContent;
  }

  /**
   * Loads HTML content provided as a string (e.g. from portfolio/backend),
   * applies the current preset transformations, runs validation, and publishes
   * the processed content via the usual listeners.
   */
  async loadHtmlContentFromString(content: string, fileName?: string | null): Promise<string> {
    const preset = this.getCurrentPreset();

    // Treat as a non-ZIP HTML load; clear any existing ZIP session.
    await this.clearZipSession();
    this.setZipPreviewUrl(null);
    this._originalZipFile = null;

    // Store original content for preset switching.
    this._originalUploadedContent = content;
    this._originalGithubContent = null;
    this._validationSourceContent = content;

    const processedContent = await this.processContentWithPreset(content, preset || undefined);
    const originalSizeBytes = new Blob([content]).size;

    await this.runValidation(processedContent, originalSizeBytes);
    this._lastUploadedSizeBytes = originalSizeBytes;

    if (fileName !== undefined) {
      this.setUploadedFileName(fileName);
    }

    this.setUploadedContent(processedContent);
    return processedContent;
  }

  getPortfolioPlayableId(): string | null {
    return this._portfolioPlayableId;
  }

  setPortfolioPlayableId(id: string | null): void {
    this._portfolioPlayableId = id;
  }

  hasUnsavedChanges(): boolean {
    return !!this._uploadedFileName && !this._portfolioPlayableId;
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
    this.ensurePresetLanguageSelection(preset);
    for (const cb of Array.from(this._presetListeners)) cb(preset);
    this.notifyPreviewLanguageChange();
    
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

  getAvailableLanguagesForPreset(preset: PreviewPreset | null = this.getCurrentPreset()): NonNullable<PreviewPreset['availableLanguages']> {
    if (!preset?.supportsLanguageSwitching || !preset.availableLanguages?.length) {
      return [];
    }

    return preset.availableLanguages;
  }

  getCurrentPresetLanguage(): string | null {
    return this.getPresetLanguage(this.getCurrentPreset());
  }

  getPresetLanguage(preset: PreviewPreset | null): string | null {
    if (!preset?.supportsLanguageSwitching) {
      return null;
    }

    return this.ensurePresetLanguageSelection(preset);
  }

  setCurrentPresetLanguage(languageCode: string | null): void {
    const preset = this.getCurrentPreset();
    if (!preset?.supportsLanguageSwitching) {
      return;
    }

    const availableLanguages = this.getAvailableLanguagesForPreset(preset);
    if (availableLanguages.length === 0) {
      this._selectedLanguagesByPreset.delete(preset.id);
      this.notifyPreviewLanguageChange();
      return;
    }

    if (languageCode && availableLanguages.some(language => language.code === languageCode)) {
      this._selectedLanguagesByPreset.set(preset.id, languageCode);
    } else {
      const fallbackLanguage = this.resolvePresetDefaultLanguage(preset);
      if (fallbackLanguage) {
        this._selectedLanguagesByPreset.set(preset.id, fallbackLanguage);
      } else {
        this._selectedLanguagesByPreset.delete(preset.id);
      }
    }

    this.notifyPreviewLanguageChange();
  }

  onPreviewLanguageChange(cb: (language: string | null, preset: PreviewPreset | null) => void): () => void {
    this._previewLanguageListeners.add(cb);
    return () => this._previewLanguageListeners.delete(cb);
  }

  private notifyPreviewLanguageChange(): void {
    const preset = this.getCurrentPreset();
    const language = this.getPresetLanguage(preset);
    for (const cb of Array.from(this._previewLanguageListeners)) cb(language, preset);
  }

  private ensurePresetLanguageSelection(preset: PreviewPreset | null): string | null {
    if (!preset?.supportsLanguageSwitching) {
      return null;
    }

    const nextLanguage = this.resolvePresetLanguage(
      preset,
      this._selectedLanguagesByPreset.get(preset.id) || null,
    );

    if (nextLanguage) {
      this._selectedLanguagesByPreset.set(preset.id, nextLanguage);
      return nextLanguage;
    }

    this._selectedLanguagesByPreset.delete(preset.id);
    return null;
  }

  private resolvePresetLanguage(preset: PreviewPreset, languageCode: string | null): string | null {
    const availableLanguages = this.getAvailableLanguagesForPreset(preset);
    if (availableLanguages.length === 0) {
      return null;
    }

    if (languageCode && availableLanguages.some(language => language.code === languageCode)) {
      return languageCode;
    }

    return this.resolvePresetDefaultLanguage(preset);
  }

  private resolvePresetDefaultLanguage(preset: PreviewPreset): string | null {
    const availableLanguages = this.getAvailableLanguagesForPreset(preset);
    if (availableLanguages.length === 0) {
      return null;
    }

    if (preset.defaultLanguage && availableLanguages.some(language => language.code === preset.defaultLanguage)) {
      return preset.defaultLanguage;
    }

    return availableLanguages[0]?.code || null;
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

    const previewContextScript = this.buildPreviewContextScript(activePreset);
    if (previewContextScript) {
      console.log(`  🌐 Injecting preview context for preset ${activePreset.id}`);
      processedContent = this.injectScript(processedContent, previewContextScript, 'beforeHeadEnd');
    }

    // Inject scripts
    for (const script of activePreset.injectScripts) {
      try {
        if (this.hasScriptSourceReference(processedContent, script.source)) {
          console.log(`  ⏭️ Skipping script injection for ${script.source} because it is already referenced in HTML`);
          continue;
        }

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

  async reloadContentWithCurrentLanguage(languageCode: string): Promise<void> {
    this.setCurrentPresetLanguage(languageCode);
    const preset = this.getCurrentPreset();
    if (!preset) {
      return;
    }

    await this.reloadContentWithPreset(preset);
  }

  private buildPreviewContextScript(preset: PreviewPreset | null): string | null {
    if (!preset) {
      return null;
    }

    const language = this.getPresetLanguage(preset);
    const previewContext = {
      presetId: preset.id,
      language,
    };
    const serializedContext = JSON.stringify(previewContext).replace(/</g, '\\u003c');

    return `(() => {
  const nextContext = ${serializedContext};
  const currentContext = window.__PLAYABLETOOLS_PREVIEW_CONTEXT || {};
  const mergedContext = { ...currentContext, ...nextContext };
  window.__PLAYABLETOOLS_PREVIEW_CONTEXT = mergedContext;
  window.__PLAYABLETOOLS_PREVIEW_LANGUAGE = mergedContext.language || null;
})();`;
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

  private hasScriptSourceReference(html: string, source: string): boolean {
    const normalizedSource = source.startsWith(window.location.origin)
      ? source.slice(window.location.origin.length)
      : source;
    const escapedSource = normalizedSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`<script[^>]+src\\s*=\\s*["']${escapedSource}["']`, 'i').test(html);
  }

  /**
   * Injects script content at the specified position in HTML
   */
  private injectScript(html: string, scriptContent: string, position: string): string {
    const scriptTag = `<script>\n${scriptContent}\n</script>`;
    
    switch (position) {
      case 'afterHeadStart':
        // Inject at the very start of <head> so the script runs before any other
        // head script (e.g. the game's platform.js, which captures window.AdsBridge once at load).
        return html.replace(/<head[^>]*>/i, match => `${match}\n${scriptTag}`);
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
    this._originalZipFile = null;
    
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
      this._validationSourceContent = originalContent;

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

  private normalizePlayableSourceUrl(sourceUrl: string): string {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sourceUrl.trim());
    } catch {
      throw new Error('Please enter a valid absolute URL starting with http:// or https://');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only direct http:// and https:// URLs are supported.');
    }

    const githubRawUrl = this.githubToRawUrl(parsedUrl.toString());
    return githubRawUrl || parsedUrl.toString();
  }

  private buildRemoteFetchError(sourceUrl: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    if (/failed to fetch|load failed|networkerror/i.test(message)) {
      return new Error(`Failed to load the remote playable. The server may be unavailable or blocking cross-origin access (CORS) for ${sourceUrl}.`);
    }

    return new Error(`Failed to load the remote playable: ${message}`);
  }

  private detectRemotePlayableType(response: Response, sourceUrl: string, payload: ArrayBuffer): RemotePlayableType {
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const pathname = new URL(sourceUrl).pathname.toLowerCase();
    const signature = new Uint8Array(payload.slice(0, 4));
    const looksLikeZip = signature.length >= 4
      && signature[0] === 0x50
      && signature[1] === 0x4b
      && signature[2] === 0x03
      && signature[3] === 0x04;

    if (contentType.includes('zip') || pathname.endsWith('.zip') || looksLikeZip) {
      return 'zip';
    }

    if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml') || pathname.endsWith('.html') || pathname.endsWith('.htm')) {
      return 'html';
    }

    const decodedText = new TextDecoder('utf-8').decode(payload.slice(0, Math.min(payload.byteLength, 4096)));
    if (this.isValidHtmlContent(decodedText)) {
      return 'html';
    }

    throw new Error(`Unsupported remote file type. Expected a direct HTML or ZIP file, got ${contentType || 'an unknown content type'}.`);
  }

  private getRemotePlayableFileName(response: Response, sourceUrl: string, playableType: RemotePlayableType): string {
    const disposition = response.headers.get('content-disposition') || '';
    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    const dispositionFileName = encodedMatch?.[1] ? decodeURIComponent(encodedMatch[1]) : plainMatch?.[1];
    const urlPathName = new URL(sourceUrl).pathname.split('/').filter(Boolean).pop();
    const fallbackBaseName = playableType === 'zip' ? 'remote-playable.zip' : 'remote-playable.html';
    const rawFileName = (dispositionFileName || urlPathName || fallbackBaseName).trim();
    const sanitizedFileName = rawFileName.replace(/[\\/:*?"<>|]+/g, '-');

    if (playableType === 'zip' && !sanitizedFileName.toLowerCase().endsWith('.zip')) {
      return `${sanitizedFileName || 'remote-playable'}.zip`;
    }

    if (playableType === 'html' && !/\.html?$/i.test(sanitizedFileName)) {
      return `${sanitizedFileName || 'remote-playable'}.html`;
    }

    return sanitizedFileName || fallbackBaseName;
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

    // Store original ZIP file for saving to portfolio
    this._originalZipFile = file;
    console.log(`💾 PreviewService.handleZipUpload: Stored original ZIP file for portfolio: ${file.name} (${file.size} bytes)`);

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
    this._validationSourceContent = await this.buildZipValidationSource(zip, entries.map(entry => entry.path));

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
      case 'cjs': return 'application/javascript';
      case 'mjs': return 'application/javascript';
      case 'ts': return 'text/javascript';
      case 'tsx': return 'text/javascript';
      case 'mts': return 'text/javascript';
      case 'cts': return 'text/javascript';
      case 'css': return 'text/css';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'webp': return 'image/webp';
      case 'mp3': return 'audio/mpeg';
      case 'm4a': return 'audio/mp4';
      case 'aac': return 'audio/aac';
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'json': return 'application/json';
      case 'map': return 'application/json';
      case 'xml': return 'application/xml';
      case 'wasm': return 'application/wasm';
      case 'txt': return 'text/plain';
      default: return null;
    }
  }

  private shouldIncludeZipTextAssetForValidation(filePath: string): boolean {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    return ['html', 'htm', 'js', 'mjs', 'cjs', 'json', 'txt'].includes(ext);
  }

  private async buildZipValidationSource(zip: any, entryPaths: string[]): Promise<string> {
    const sections: string[] = [];

    for (const entryPath of entryPaths) {
      const entry = zip.files[entryPath];
      if (!entry || entry.dir || !this.shouldIncludeZipTextAssetForValidation(entryPath)) {
        continue;
      }

      try {
        const text = await entry.async('string') as string;
        sections.push(`/* FILE: ${entryPath} */\n${text}`);
      } catch (error) {
        console.warn(`PreviewService: Failed to read ZIP text asset for validation: ${entryPath}`, error);
      }
    }

    return sections.join('\n\n');
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
    this._validationSourceContent = null;
    this._originalZipFile = null;
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
    const validationSizeBytes = this._lastUploadedSizeBytes ??  new Blob([this._originalUploadedContent || this._originalGithubContent || this._uploadedContent || '']).size;

    if (this._zipSessionId && this._zipEntryPath && this._originalUploadedContent) {
      console.log(`📦 Updating ZIP session content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalUploadedContent, preset);
      await this.runValidation(processedContent, validationSizeBytes);
      this.setUploadedContent(processedContent);
      await this.updateZipEntryHtmlAsset(this._zipSessionId, this._zipEntryPath, processedContent);
      return;
    }
    
    // If we have original uploaded content, reprocess it
    if (this._originalUploadedContent) {
      console.log(`📁 Reprocessing uploaded content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalUploadedContent, preset);
      await this.runValidation(processedContent, validationSizeBytes);
      this.setUploadedContent(processedContent);
      return;
    }
    
    // If we have original GitHub content, reprocess it
    if (this._originalGithubContent) {
      console.log(`🔗 Reprocessing GitHub content with ${preset.name} preset`);
      const processedContent = await this.processContentWithPreset(this._originalGithubContent, preset);
      await this.runValidation(processedContent, validationSizeBytes);
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
   * Returns the size of the last uploaded file/zip in bytes, or 0 if not available.
   */
  getUploadedSizeBytes(): number {
    return this._lastUploadedSizeBytes ?? 0;
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

  private async postMessageToZipSw(message: any, transferables: Transferable[] = [], waitForAck = false): Promise<void> {
    const worker = await this.getZipServiceWorker();
    if (!worker) return;

    if (!waitForAck) {
      worker.postMessage(message, transferables);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const channel = new MessageChannel();
      const timeoutId = window.setTimeout(() => {
        try {
          channel.port1.close();
          channel.port2.close();
        } catch {}
        reject(new Error(`ZIP service worker did not acknowledge ${message.type || 'message'} in time`));
      }, PreviewService.zipSwAckTimeoutMs);

      channel.port1.onmessage = (event) => {
        window.clearTimeout(timeoutId);

        try {
          channel.port1.close();
          channel.port2.close();
        } catch {}

        const response = event.data;
        if (response && response.ok === false) {
          reject(new Error(response.error || 'ZIP service worker request failed'));
          return;
        }

        resolve();
      };

      try {
        worker.postMessage(message, [...transferables, channel.port2]);
      } catch (error) {
        window.clearTimeout(timeoutId);
        try {
          channel.port1.close();
          channel.port2.close();
        } catch {}
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private async registerZipSessionAssets(sessionId: string, assets: ZipAssetPayload[]): Promise<void> {
    const totalBytes = assets.reduce((sum, asset) => sum + (asset.buffer?.byteLength ?? 0), 0);
    console.debug(
      `[PreviewService] Registering ZIP session ${sessionId}: ${assets.length} assets, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB total (timeout ${PreviewService.zipSwAckTimeoutMs}ms)`,
    );
    const startedAt = performance.now();
    const transferables = assets.map(asset => asset.buffer);
    try {
      await this.postMessageToZipSw({
        type: 'ZIP_SESSION_REGISTER',
        sessionId,
        assets
      }, transferables, true);
      console.debug(`[PreviewService] ZIP session ${sessionId} registered in ${Math.round(performance.now() - startedAt)}ms`);
    } catch (err) {
      console.error(`[PreviewService] ZIP session ${sessionId} registration failed after ${Math.round(performance.now() - startedAt)}ms`, err);
      throw err;
    }
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
    }, [buffer], true);
  }

  private async clearZipSession(sessionId?: string): Promise<void> {
    const targetSession = sessionId || this._zipSessionId;
    if (!targetSession) return;
    // Clear local session state synchronously (before awaiting the service
    // worker round-trip) so callers that don't await this method — e.g.
    // clearUploadedContent() — see hasContent flip to false on the same tick.
    // Otherwise "Load New Content" needs two clicks for ZIP playables.
    if (!sessionId) {
      this._zipSessionId = null;
      this._zipEntryPath = null;
      this.setZipPreviewUrl(null);
    }
    await this.postMessageToZipSw({
      type: 'ZIP_SESSION_CLEAR',
      sessionId: targetSession
    }, [], true);
  }

  /**
   * Runs validation on the current content using appropriate validators
   */
  private async runValidation(content: string, fileSize: number): Promise<void> {
    try {
      console.log(`🔍 PreviewService: Running validation on ${fileSize} bytes`);
      const preset = this.getCurrentPreset();
      const results: ValidationResult = { categories: [] };
      const validationContext: ValidationContext = {
        presetId: preset?.id || null,
        language: this.getPresetLanguage(preset),
      };

      // Always run general validation
      const generalValidator = new GeneralValidator();
      const generalResults = generalValidator.validate(content, fileSize, validationContext);
      results.categories.push(...generalResults.categories);
      console.log(`✅ PreviewService: General validation complete, ${generalResults.categories.length} categories`);

      // Run preset-specific validation
      if (preset) {
        console.log(`⚙️ PreviewService: Running ${preset.name} preset validation`);
        switch (preset.id) {
          case 'preview-cta': {
            const ctaSdkValidator = new CtaSdkValidator();
            const ctaSdkResults = ctaSdkValidator.validate(this._originalUploadedContent || content, fileSize, validationContext);
            results.categories.push(...ctaSdkResults.categories);
            console.log(`✅ PreviewService: CTA SDK validation complete`);
            break;
          }
          case 'facebook': {
            const facebookValidator = new FacebookValidator();
            const facebookResults = facebookValidator.validate(content, fileSize, validationContext);
            results.categories.push(...facebookResults.categories);
            console.log(`✅ PreviewService: Facebook validation complete`);
            break;
          }
          case 'mraid': {
            const mraidValidator = new MraidValidator();
            const mraidResults = mraidValidator.validate(content, fileSize, validationContext);
            results.categories.push(...mraidResults.categories);
            console.log(`✅ PreviewService: MRAID validation complete`);
            break;
          }
          case 'yandex-games': {
            const yandexGamesValidator = new YandexGamesValidator();
            const yandexSourceContent = this._validationSourceContent || this._originalUploadedContent || this._originalGithubContent || content;
            const yandexResults = yandexGamesValidator.validate(yandexSourceContent, fileSize, validationContext);
            results.categories.push(...yandexResults.categories);
            console.log(`✅ PreviewService: Yandex Games validation complete`);
            break;
          }
          case 'applovin': {
            const appLovinValidator = new AppLovinValidator();
            const appLovinSourceContent = this._validationSourceContent || this._originalUploadedContent || this._originalGithubContent || content;
            const appLovinResults = appLovinValidator.validate(appLovinSourceContent, fileSize, validationContext);
            results.categories.push(...appLovinResults.categories);
            console.log(`✅ PreviewService: AppLovin validation complete`);
            break;
          }
          case 'ads-manager': {
            const adsManagerValidator = new AdsManagerValidator();
            const adsManagerSourceContent = this._validationSourceContent || this._originalUploadedContent || this._originalGithubContent || content;
            const adsManagerResults = adsManagerValidator.validate(adsManagerSourceContent, fileSize, validationContext);
            results.categories.push(...adsManagerResults.categories);
            console.log(`✅ PreviewService: AdsManager validation complete`);
            break;
          }
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

  /**
   * Captures a screenshot from the playable preview iframe and returns it as a blob
   * The screenshot includes the entire viewport content rendered in the iframe
   */
  async captureScreenshot(iframeElement?: HTMLIFrameElement): Promise<Blob> {
    const iframe = iframeElement || (document.querySelector('.playable-iframe') as HTMLIFrameElement | null);
    const iframeWindow = iframe?.contentWindow;
    const iframeDocument = iframe?.contentDocument;

    if (!iframe || !iframeWindow || !iframeDocument) {
      throw new Error('Playable iframe not found or not loaded');
    }

    await this.waitForAnimationFrames(iframeWindow, 2);

    const iframeApiBlob = await this.captureScreenshotViaIframeApi(iframeWindow);
    if (iframeApiBlob) {
      return iframeApiBlob;
    }

    const analysis = this.analyzeIframeContent(iframeDocument, iframe);
    const strategies: Array<'dom' | 'canvas'> = analysis.preferDom
      ? ['dom', 'canvas']
      : ['canvas', 'dom'];
    const failures: string[] = [];

    for (const strategy of strategies) {
      try {
        if (strategy === 'canvas') {
          return await this.captureCanvasScreenshot(analysis.primaryCanvas);
        }
        return await this.captureDomScreenshot(iframe, iframeDocument, iframeWindow);
      } catch (error) {
        failures.push(`${strategy}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const details = failures.length > 0 ? ` (${failures.join(' | ')})` : '';
    throw new Error(`Failed to capture playable screenshot${details}`);
  }

  private async captureScreenshotViaIframeApi(iframeWindow: Window): Promise<Blob | null> {
    const screenshotWindow = iframeWindow as Window & {
      __ptScreenshot?: {
        captureBlob: (callback: (error: Error | null, blob: Blob | null) => void) => Promise<void> | void;
      };
    };

    const iframeApi = await this.waitForIframeScreenshotApi(screenshotWindow, 1500);
    if (!iframeApi) {
      return null;
    }

    try {
      return await Promise.race([
        new Promise<Blob>((resolve, reject) => {
          iframeApi.captureBlob((error, blob) => {
            if (error) {
              reject(error);
              return;
            }
            if (!blob) {
              reject(new Error('Iframe screenshot API returned an empty blob.'));
              return;
            }
            resolve(blob);
          });
        }),
        new Promise<Blob>((_, reject) => {
          window.setTimeout(() => reject(new Error('Iframe screenshot API timed out.')), 10000);
        }),
      ]);
    } catch (error) {
      console.warn('PreviewService: iframe screenshot API failed, falling back to parent capture', error);
      return null;
    }
  }

  private async waitForIframeScreenshotApi(
    iframeWindow: Window & {
      __ptScreenshot?: {
        captureBlob: (callback: (error: Error | null, blob: Blob | null) => void) => Promise<void> | void;
      };
    },
    timeoutMs: number,
  ): Promise<{ captureBlob: (callback: (error: Error | null, blob: Blob | null) => void) => Promise<void> | void } | null> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (iframeWindow.__ptScreenshot) {
        return iframeWindow.__ptScreenshot;
      }
      await this.waitForAnimationFrames(iframeWindow, 1);
    }

    return iframeWindow.__ptScreenshot || null;
  }

  private logCaptureDiagnostics(track: MediaStreamTrack, requested: { requestedCursor: string; includeCursor: boolean }): void {
    try {
      const supported = navigator.mediaDevices.getSupportedConstraints?.() ?? {};
      const settings = track.getSettings();
      const constraints = track.getConstraints();
      const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : undefined;
      const trackSettingsAny = settings as Record<string, unknown>;
      const trackConstraintsAny = constraints as Record<string, unknown>;
      const cursorSupportedByUA = (supported as Record<string, unknown>).cursor === true;

      console.groupCollapsed(
        `[PreviewRecording] capture diagnostics — requested cursor=${requested.requestedCursor} (includeCursor=${requested.includeCursor})`,
      );
      console.log('UA supports "cursor" constraint:', cursorSupportedByUA);
      console.log('Applied displaySurface:', trackSettingsAny.displaySurface);
      console.log('Applied cursor:', trackSettingsAny.cursor ?? '(not reported)');
      console.log('Applied frameRate:', trackSettingsAny.frameRate);
      console.log('Applied logicalSurface:', trackSettingsAny.logicalSurface);
      console.log('track.getSettings():', settings);
      console.log('track.getConstraints():', constraints);
      console.log('track.getCapabilities():', capabilities);
      console.log('MediaDevices.getSupportedConstraints():', supported);

      const requestedCursor = requested.requestedCursor;
      const appliedCursor = trackSettingsAny.cursor ?? trackConstraintsAny.cursor;
      if (requestedCursor === 'never' && appliedCursor !== 'never') {
        console.warn(
          `[PreviewRecording] cursor constraint "never" was requested but UA reports "${appliedCursor ?? 'unknown'}". The cursor will likely appear in the recording.`,
        );
      }
      console.groupEnd();
    } catch (err) {
      console.warn('[PreviewRecording] failed to log capture diagnostics', err);
    }
  }

  private getDisplayCaptureSourceRect(
    cropElement: HTMLElement,
    previewVideo: HTMLVideoElement,
  ): { sourceX: number; sourceY: number; sourceWidth: number; sourceHeight: number } {
    const rect = cropElement.getBoundingClientRect();
    const docEl = document.documentElement;
    const viewportWidth = Math.max(docEl.clientWidth || window.innerWidth, 1);
    const viewportHeight = Math.max(docEl.clientHeight || window.innerHeight, 1);
    const scaleX = previewVideo.videoWidth / viewportWidth;

    // Account for the browser chrome captured above the viewport when CropTarget
    // is unavailable, otherwise the crop drifts vertically.
    const physicalViewportHeight = viewportHeight * scaleX;
    const estimatedTopBarHeight = Math.max(0, previewVideo.videoHeight - physicalViewportHeight);

    const sourceX = Math.max(0, Math.round(rect.left * scaleX));
    const sourceY = Math.max(0, Math.round(rect.top * scaleX) + estimatedTopBarHeight);
    const sourceWidth = Math.max(1, Math.min(previewVideo.videoWidth - sourceX, Math.round(rect.width * scaleX)));
    const sourceHeight = Math.max(1, Math.min(previewVideo.videoHeight - sourceY, Math.round(rect.height * scaleX)));

    return { sourceX, sourceY, sourceWidth, sourceHeight };
  }

  private drawDisplayCaptureFrame(
    previewVideo: HTMLVideoElement,
    cropElement: HTMLElement,
    outputCanvas: HTMLCanvasElement,
    outputContext: CanvasRenderingContext2D,
    cropSuccess: boolean,
  ): void {
    outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (cropSuccess) {
      outputContext.drawImage(
        previewVideo,
        0,
        0,
        previewVideo.videoWidth,
        previewVideo.videoHeight,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height,
      );
      return;
    }

    const { sourceX, sourceY, sourceWidth, sourceHeight } = this.getDisplayCaptureSourceRect(cropElement, previewVideo);
    outputContext.drawImage(
      previewVideo,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height,
    );
  }

  private async captureDisplayCaptureScreenshot(
    previewVideo: HTMLVideoElement,
    cropElement: HTMLElement,
    cropSuccess: boolean,
  ): Promise<Blob> {
    await this.waitForAnimationFrames(window, 2);

    if (previewVideo.videoWidth === 0 || previewVideo.videoHeight === 0) {
      throw new Error('Display capture has no video frame available for screenshot export.');
    }

    const screenshotCanvas = document.createElement('canvas');
    if (cropSuccess) {
      screenshotCanvas.width = previewVideo.videoWidth;
      screenshotCanvas.height = previewVideo.videoHeight;
    } else {
      const { sourceWidth, sourceHeight } = this.getDisplayCaptureSourceRect(cropElement, previewVideo);
      screenshotCanvas.width = sourceWidth;
      screenshotCanvas.height = sourceHeight;
    }

    const screenshotContext = screenshotCanvas.getContext('2d');
    if (!screenshotContext) {
      throw new Error('Unable to create an off-screen canvas for screenshot export.');
    }

    this.drawDisplayCaptureFrame(previewVideo, cropElement, screenshotCanvas, screenshotContext, cropSuccess);
    return this.canvasToBlob(screenshotCanvas, 'image/png');
  }

  async startPreviewRecording(cropElement: HTMLElement, options: PreviewRecordingOptions = {}): Promise<PreviewRecordingController> {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Display capture is not supported in this browser.');
    }
    if (typeof MediaRecorder === 'undefined') {
      throw new Error('MediaRecorder is not available in this browser.');
    }

    const frameRate = options.frameRate ?? 30;
    const includeCursor = options.includeCursor ?? true;
    const captureAudio = options.captureAudio ?? true;
    const videoConstraints: MediaTrackConstraints & Record<string, unknown> = {
      frameRate: { ideal: frameRate, max: frameRate },
      displaySurface: 'browser',
      cursor: includeCursor ? 'always' : 'never',
    };

    const displayMediaOptions: DisplayMediaStreamOptions & Record<string, unknown> = {
      video: videoConstraints,
      audio: captureAudio,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'exclude',
    };

    const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    const displayTrack = displayStream.getVideoTracks()[0];
    if (!displayTrack) {
      displayStream.getTracks().forEach(track => track.stop());
      throw new Error('Display capture started without a video track.');
    }

    this.logCaptureDiagnostics(displayTrack, { requestedCursor: videoConstraints.cursor as string, includeCursor });

    let cropSuccess = false;
    if ('CropTarget' in window && 'cropTo' in displayTrack) {
      try {
        const target = await (window as any).CropTarget.fromElement(cropElement);
        await (displayTrack as any).cropTo(target);
        cropSuccess = true;
      } catch (e) {
        console.warn('CropTarget failed, falling back to canvas crop', e);
      }
    }

    let previewVideo: HTMLVideoElement | null = null;
    let outputCanvas: HTMLCanvasElement | null = null;
    let captureStream: MediaStream | null = null;
    let animationFrameId = 0;

    previewVideo = document.createElement('video');
    previewVideo.srcObject = displayStream;
    previewVideo.muted = true;
    previewVideo.playsInline = true;

    await this.waitForMediaEvent(previewVideo, 'loadedmetadata');
    await previewVideo.play();

    outputCanvas = document.createElement('canvas');
    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) {
      previewVideo.pause();
      previewVideo.srcObject = null;
      displayStream.getTracks().forEach(track => track.stop());
      throw new Error('Unable to create an off-screen canvas for recording.');
    }

    const resizeOutputCanvas = () => {
      const nextSize = this.getRecordingOutputSize(cropElement, options);
      if (outputCanvas!.width !== nextSize.width || outputCanvas!.height !== nextSize.height) {
        outputCanvas!.width = nextSize.width;
        outputCanvas!.height = nextSize.height;
      }
    };

    resizeOutputCanvas();

    const drawFrame = () => {
      resizeOutputCanvas();

      this.drawDisplayCaptureFrame(previewVideo!, cropElement, outputCanvas!, outputContext!, cropSuccess);
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    drawFrame();
    captureStream = outputCanvas.captureStream(frameRate);

    const mixedStream = new MediaStream([
      ...captureStream.getVideoTracks(),
      ...displayStream.getAudioTracks(),
    ]);
    const startedAt = Date.now();
    const hasAudioTrack = mixedStream.getAudioTracks().length > 0;
    const mimeType = this.getPreferredRecordingMimeType(undefined, hasAudioTrack);
    const videoBitsPerSecond = this.getRecommendedRecordingBitrate(outputCanvas.width, outputCanvas.height, frameRate);
    const recorderOptions: MediaRecorderOptions = mimeType
      ? { mimeType, videoBitsPerSecond }
      : { videoBitsPerSecond };
    if (hasAudioTrack) {
      recorderOptions.audioBitsPerSecond = 128_000;
    }
    const recorder = new MediaRecorder(mixedStream, recorderOptions);
    const chunks: BlobPart[] = [];
    let settled = false;
    let discarded = false;
    let cleanedUp = false;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }
        if (captureStream) {
          captureStream.getTracks().forEach(track => track.stop());
        }
        mixedStream.getTracks().forEach(track => track.stop());
        displayStream.getTracks().forEach(track => track.stop());
        if (previewVideo) {
          previewVideo.pause();
          previewVideo.srcObject = null;
        }
      };

      const result = new Promise<PreviewRecordingResult>((resolve, reject) => {
        recorder.addEventListener('dataavailable', (event: BlobEvent) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        });

        recorder.addEventListener('error', (event: Event) => {
          cleanup();
          const mediaError = event as Event & { error?: DOMException };
          reject(new Error(mediaError.error?.message || 'Failed to record the playable preview.'));
        });

        recorder.addEventListener('stop', () => {
          cleanup();

          if (discarded) {
            reject(new DOMException('Recording cancelled', 'AbortError'));
            return;
          }

          const blobType = recorder.mimeType || mimeType || chunks.find(part => part instanceof Blob)?.type || 'video/webm';
          const blob = new Blob(chunks, { type: blobType });
          if (blob.size === 0) {
            reject(new Error('Recording finished without any video data.'));
            return;
          }

          resolve({
            blob,
            mimeType: blobType,
            fileExtension: this.getVideoFileExtension(blobType),
            durationMs: Date.now() - startedAt,
            width: outputCanvas.width,
            height: outputCanvas.height,
            startedAt,
          });
        });
      });

    const stopInternal = async (discard: boolean): Promise<PreviewRecordingResult> => {
      discarded = discard;
      if (!settled) {
        settled = true;
        if (animationFrameId !== 0) {
          window.cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
        if (recorder.state !== 'inactive') {
          recorder.stop();
        } else {
          cleanup();
        }
      }
      return result;
    };

    displayTrack.addEventListener('ended', () => {
      void stopInternal(false);
    }, { once: true });

    recorder.start(250);

    return {
      startedAt,
      result,
      stop: () => stopInternal(false),
      cancel: async () => {
        try {
          await stopInternal(true);
        } catch {
          // Cancellation intentionally discards the clip.
        }
      },
      captureScreenshot: async () => {
        if (cleanedUp || !previewVideo) {
          throw new Error('Recording capture session is no longer active.');
        }

        return this.captureDisplayCaptureScreenshot(previewVideo, cropElement, cropSuccess);
      },
    };
  }

  private getRecordingOutputSize(cropElement: HTMLElement, options: PreviewRecordingOptions): { width: number; height: number } {
    const rect = cropElement.getBoundingClientRect();
    const requestedWidth = options.targetWidth ?? rect.width;
    const requestedHeight = options.targetHeight ?? rect.height;
    const outputScale = Math.max(1, options.outputScale ?? 1);
    const maxOutputDimension = Math.max(2, options.maxOutputDimension ?? PreviewService.recordingMaxOutputDimension);
    const safeWidth = Math.max(2, requestedWidth * outputScale);
    const safeHeight = Math.max(2, requestedHeight * outputScale);
    const scale = Math.min(1, maxOutputDimension / Math.max(safeWidth, safeHeight));

    return this.computeEncodeDimensions(safeWidth * scale, safeHeight * scale);
  }

  private getRecommendedRecordingBitrate(width: number, height: number, frameRate: number): number {
    const estimatedBitrate = Math.round(width * height * Math.max(frameRate, 1) * PreviewService.recordingBitsPerPixelFrame);
    return Math.min(
      PreviewService.recordingMaxVideoBitrate,
      Math.max(PreviewService.recordingMinVideoBitrate, estimatedBitrate),
    );
  }

  /**
   * Computes encoder-safe output dimensions that preserve the source aspect ratio.
   *
   * The width is snapped to a multiple of 16 (the H.264 macroblock width): the luma
   * stride equals the coded width, so when a hardware AVC encoder pads a non-16
   * picture and signals the real size via an SPS crop rectangle — which some
   * encoder/muxer/player combinations silently drop — every row drifts and the
   * frame renders as diagonal "venetian-blind" garbage. A 16-aligned width needs no
   * horizontal padding, eliminating that class of corruption.
   *
   * The height is then derived from the exact source aspect ratio and rounded to an
   * even number (the 4:2:0 minimum), so the picture is never stretched. Forcing the
   * height to 16 as well would distort the aspect ratio by up to ~2%; deriving it
   * from the ratio keeps distortion under ~0.2% while still avoiding the (far less
   * severe, bottom-edge-only) vertical crop issue.
   */
  private computeEncodeDimensions(width: number, height: number): { width: number; height: number } {
    const aspect = width / Math.max(1, height);
    const safeWidth = Math.max(16, Math.round(width / 16) * 16);
    const safeHeight = Math.max(2, Math.round(safeWidth / aspect / 2) * 2);
    return { width: safeWidth, height: safeHeight };
  }

  /**
   * Trims the recorded clip and exports it as MP4.
   *
   * Prefers a fully client-side WebCodecs pipeline (via mediabunny) when the
   * browser can natively encode H.264 + AAC: it demuxes the source WebM and
   * re-encodes with hardware acceleration, which is dramatically faster than
   * the software FFmpeg encoder and avoids the ~31 MB FFmpeg core download.
   * Falls back to FFmpeg.wasm when WebCodecs encoding is unavailable (e.g.
   * Firefox) or if the WebCodecs path fails for any reason.
   */
  async trimRecordedVideo(
    sourceBlob: Blob,
    startTimeSec: number,
    endTimeSec: number,
    callbacks: Mp4ExportCallbacks = {},
  ): Promise<PreviewRecordingResult> {
    if (await this.isFastMp4ExportAvailable()) {
      try {
        return await this.trimRecordedVideoWithWebCodecs(sourceBlob, startTimeSec, endTimeSec, callbacks);
      } catch (error) {
        console.warn('PreviewService: WebCodecs MP4 export failed, falling back to FFmpeg.', error);
        callbacks.onStatus?.('Switching to the compatibility encoder...');
        callbacks.onProgress?.(0);
      }
    }

    return this.trimRecordedVideoWithFfmpeg(sourceBlob, startTimeSec, endTimeSec, callbacks);
  }

  /**
   * Detects whether the browser can encode MP4 (H.264 + AAC) natively through
   * the WebCodecs API. The result is cached because the capability never
   * changes within a session.
   */
  async isFastMp4ExportAvailable(): Promise<boolean> {
    if (this._fastMp4ExportSupported !== null) {
      return this._fastMp4ExportSupported;
    }

    this._fastMp4ExportSupported = await this.detectFastMp4ExportSupport();
    return this._fastMp4ExportSupported;
  }

  private async detectFastMp4ExportSupport(): Promise<boolean> {
    try {
      if (!('VideoEncoder' in globalThis) || !('AudioEncoder' in globalThis)) {
        return false;
      }

      const { canEncodeVideo, canEncodeAudio } = await import('mediabunny');
      const [canVideo, canAudio] = await Promise.all([
        canEncodeVideo('avc'),
        canEncodeAudio('aac'),
      ]);

      const supported = canVideo && canAudio;
      console.debug(`[PreviewService] WebCodecs MP4 export support: avc=${canVideo}, aac=${canAudio} -> ${supported}`);
      return supported;
    } catch (error) {
      console.warn('PreviewService: WebCodecs MP4 export detection failed', error);
      return false;
    }
  }

  private async trimRecordedVideoWithWebCodecs(
    sourceBlob: Blob,
    startTimeSec: number,
    endTimeSec: number,
    callbacks: Mp4ExportCallbacks = {},
  ): Promise<PreviewRecordingResult> {
    const safeStart = Math.max(0, startTimeSec);
    const safeEnd = Math.max(safeStart + 0.05, endTimeSec);
    const trimDurationSec = Math.max(0.05, safeEnd - safeStart);
    const startedAt = Date.now();

    callbacks.onProgress?.(0);
    callbacks.onStatus?.('Encoding MP4...');

    const {
      Input,
      Output,
      BlobSource,
      BufferTarget,
      Mp4OutputFormat,
      Conversion,
      ALL_FORMATS,
      QUALITY_HIGH,
    } = await import('mediabunny');

    const input = new Input({
      source: new BlobSource(sourceBlob),
      formats: ALL_FORMATS,
    });
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
      target: new BufferTarget(),
    });

    // Force the encoded output onto a 16-aligned grid. New recordings are
    // already macroblock-aligned (see normalizeVideoDimension), but clips saved
    // by older builds may be even-but-not-16 — re-encoding those at their native
    // size reintroduces the sheared-stride corruption on hardware AVC encoders.
    // Resizing to the nearest multiple of 16 keeps the coded and display sizes
    // identical regardless of source dimensions.
    const sourceMeta = await this.readVideoMetadata(sourceBlob).catch(() => ({ width: 0, height: 0, durationMs: 0 }));
    const videoOptions: { codec: 'avc'; bitrate: typeof QUALITY_HIGH; width?: number; height?: number; fit?: 'fill' } = {
      codec: 'avc',
      bitrate: QUALITY_HIGH,
    };
    if (sourceMeta.width > 0 && sourceMeta.height > 0) {
      // The target box already carries the source aspect ratio (width snapped to
      // 16, height derived from the ratio), so 'fill' resizes without stretching
      // or letterboxing — it just lands the output on a macroblock-aligned grid.
      const dims = this.computeEncodeDimensions(sourceMeta.width, sourceMeta.height);
      videoOptions.width = dims.width;
      videoOptions.height = dims.height;
      videoOptions.fit = 'fill';
    }

    const conversion = await Conversion.init({
      input,
      output,
      video: videoOptions,
      audio: { codec: 'aac', bitrate: 128_000 },
      trim: { start: safeStart, end: safeEnd },
    });

    if (!conversion.isValid) {
      const discarded = conversion.discardedTracks
        .map(track => `${track.track.type}:${track.reason}`)
        .join(', ');
      throw new Error(`WebCodecs conversion is not valid${discarded ? ` (discarded ${discarded})` : ''}.`);
    }

    conversion.onProgress = (progress: number) => {
      if (!Number.isFinite(progress)) {
        return;
      }
      const clamped = Math.min(Math.max(progress, 0), 0.99);
      callbacks.onProgress?.(clamped);
      callbacks.onStatus?.(`Encoding MP4... ${Math.round(clamped * 100)}%`);
    };

    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('WebCodecs conversion produced an empty MP4.');
    }

    callbacks.onStatus?.('Finalizing MP4...');
    const outputBlob = new Blob([buffer], { type: 'video/mp4' });
    const metadata = await this.readVideoMetadata(outputBlob);

    callbacks.onProgress?.(1);
    callbacks.onStatus?.('MP4 export complete.');

    return {
      blob: outputBlob,
      mimeType: 'video/mp4',
      fileExtension: 'mp4',
      durationMs: metadata.durationMs || Math.round(trimDurationSec * 1000),
      width: metadata.width,
      height: metadata.height,
      startedAt,
    };
  }

  private async trimRecordedVideoWithFfmpeg(
    sourceBlob: Blob,
    startTimeSec: number,
    endTimeSec: number,
    callbacks: Mp4ExportCallbacks = {},
  ): Promise<PreviewRecordingResult> {
    const safeStart = Math.max(0, startTimeSec);
    const safeEnd = Math.max(safeStart + 0.05, endTimeSec);
    const trimDurationSec = Math.max(0.05, safeEnd - safeStart);
    const startedAt = Date.now();
    const inputName = `preview-source-${this.createTempMediaId()}.${this.getVideoFileExtension(sourceBlob.type || 'video/webm')}`;
    const outputName = `preview-export-${this.createTempMediaId()}.mp4`;
    let exporter: LoadedMp4Exporter | null = null;

    this._ffmpegStatusCallback = callbacks.onStatus;
    this._ffmpegProgressCallback = callbacks.onProgress;

    callbacks.onProgress?.(0);
    callbacks.onStatus?.(this._ffmpegLoadPromise ? 'Preparing MP4 exporter...' : 'Loading MP4 exporter (~31 MB on first use)...');

    try {
      exporter = await this.getMp4Exporter();
      const { ffmpeg, fetchFile } = exporter;
      this._ffmpegRecentLogs = [];
      this._ffmpegExpectedDurationSec = trimDurationSec;

      callbacks.onStatus?.('Preparing source clip...');
      await ffmpeg.writeFile(inputName, await fetchFile(sourceBlob));

      callbacks.onStatus?.('Encoding MP4...');
      const exitCode = await ffmpeg.exec(this.buildMp4ExportArgs(inputName, outputName, safeStart, trimDurationSec));
      if (exitCode !== 0) {
        const details = this.getRecentFfmpegLogSummary();
        throw new Error(details ? `MP4 export failed with exit code ${exitCode}. ${details}` : `MP4 export failed with exit code ${exitCode}.`);
      }

      callbacks.onStatus?.('Finalizing MP4...');
      const outputData = this.toUint8Array(await ffmpeg.readFile(outputName));
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      const metadata = await this.readVideoMetadata(outputBlob);

      callbacks.onProgress?.(1);
      callbacks.onStatus?.('MP4 export complete.');

      return {
        blob: outputBlob,
        mimeType: 'video/mp4',
        fileExtension: 'mp4',
        durationMs: metadata.durationMs || Math.round(trimDurationSec * 1000),
        width: metadata.width,
        height: metadata.height,
        startedAt,
      };
    } catch (error) {
      callbacks.onStatus?.('MP4 export failed.');
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      this._ffmpegExpectedDurationSec = null;
      if (exporter) {
        try {
          await this.cleanupFfmpegFiles(exporter.ffmpeg, [inputName, outputName]);
        } catch {
          // Ignore cleanup failures.
        }
      }

      this._ffmpegStatusCallback = undefined;
      this._ffmpegProgressCallback = undefined;
    }
  }

  async prepareMp4Exporter(callbacks: Mp4ExportCallbacks = {}): Promise<void> {
    callbacks.onProgress?.(0);

    // The WebCodecs path needs no heavyweight runtime, so skip the ~31 MB
    // FFmpeg core download entirely when native MP4 encoding is available.
    if (await this.isFastMp4ExportAvailable()) {
      callbacks.onProgress?.(1);
      callbacks.onStatus?.('MP4 exporter is ready.');
      return;
    }

    this._ffmpegStatusCallback = callbacks.onStatus;
    this._ffmpegProgressCallback = callbacks.onProgress;

    callbacks.onStatus?.(this._ffmpegLoadPromise ? 'Preparing MP4 exporter...' : 'Loading MP4 exporter (~31 MB on first use)...');

    try {
      await this.getMp4Exporter();
      callbacks.onProgress?.(1);
      callbacks.onStatus?.('MP4 exporter is ready.');
    } finally {
      this._ffmpegStatusCallback = undefined;
      this._ffmpegProgressCallback = undefined;
    }
  }

  private async getMp4Exporter(): Promise<LoadedMp4Exporter> {
    if (!this._ffmpegLoadPromise) {
      this._ffmpegLoadPromise = (async () => {
        const [{ FFmpeg }, { fetchFile }] = await Promise.all([
          import("@ffmpeg/ffmpeg"),
          import("@ffmpeg/util"),
        ]);

        const progressByUrl = new Map<string, { received: number; total: number }>();
        const emitRuntimeDownloadProgress = () => {
          let totalBytes = 0;
          let receivedBytes = 0;

          for (const entry of progressByUrl.values()) {
            if (entry.total > 0) {
              totalBytes += entry.total;
              receivedBytes += Math.min(entry.received, entry.total);
            }
          }

          if (totalBytes > 0) {
            const progress = Math.min(receivedBytes / totalBytes, 0.95);
            this._ffmpegProgressCallback?.(progress);
            this._ffmpegStatusCallback?.(`Downloading MP4 exporter... ${Math.round(progress * 100)}%`);
          } else {
            this._ffmpegStatusCallback?.('Downloading MP4 exporter...');
          }
        };

        const handleRuntimeDownloadProgress = (event: DownloadProgressEvent) => {
          progressByUrl.set(String(event.url), {
            received: event.received,
            total: event.total,
          });
          emitRuntimeDownloadProgress();
        };

        if (!this._ffmpegCoreBlobUrl) {
          this._ffmpegCoreBlobUrl = await this.createBlobUrlFromFetch(
            ffmpegCoreUrl,
            'text/javascript',
            handleRuntimeDownloadProgress,
          );
        }

        if (!this._ffmpegWasmBlobUrl) {
          this._ffmpegWasmBlobUrl = await this.createBlobUrlFromFetch(
            ffmpegWasmUrl,
            'application/wasm',
            handleRuntimeDownloadProgress,
          );
        }

        if (!this._ffmpegClassWorkerUrl) {
          this._ffmpegClassWorkerUrl = this.createFfmpegWorkerBlobUrl();
        }

        const ffmpeg = new FFmpeg();
        ffmpeg.on('log', ({ message }: { message: string }) => {
          if (message.trim().length > 0) {
            const normalizedMessage = message.trim();
            this._ffmpegRecentLogs.push(normalizedMessage);
            if (this._ffmpegRecentLogs.length > 40) {
              this._ffmpegRecentLogs.shift();
            }

            const encodedSeconds = this.parseFfmpegEncodedTime(normalizedMessage);
            if (encodedSeconds !== null && this._ffmpegExpectedDurationSec && this._ffmpegExpectedDurationSec > 0) {
              const progress = Math.min(Math.max(encodedSeconds / this._ffmpegExpectedDurationSec, 0), 0.99);
              this._ffmpegProgressCallback?.(progress);
              this._ffmpegStatusCallback?.(`Encoding MP4... ${Math.round(progress * 100)}%`);
              return;
            }

            if (!/^frame=|^size=|^time=|^bitrate=|^speed=/.test(normalizedMessage)) {
              this._ffmpegStatusCallback?.(normalizedMessage);
            }
          }
        });
        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
          if (Number.isFinite(progress)) {
            this._ffmpegProgressCallback?.(Math.min(Math.max(progress, 0), 1));
          }
        });

        this._ffmpegStatusCallback?.('Initializing MP4 runtime...');
        this._ffmpegProgressCallback?.(0.98);
        const loadAbortController = new AbortController();
        const loadTimeoutId = window.setTimeout(() => {
          loadAbortController.abort();
        }, 20000);

        try {
          await ffmpeg.load({
            coreURL: this._ffmpegCoreBlobUrl,
            wasmURL: this._ffmpegWasmBlobUrl,
            classWorkerURL: this._ffmpegClassWorkerUrl,
          }, { signal: loadAbortController.signal });
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('MP4 runtime initialization timed out. The FFmpeg worker failed to start.');
          }
          throw error;
        } finally {
          window.clearTimeout(loadTimeoutId);
        }

        this._ffmpegProgressCallback?.(1);

        return { ffmpeg, fetchFile };
      })().catch((error) => {
        this._ffmpegLoadPromise = null;
        this._ffmpegCoreBlobUrl = null;
        this._ffmpegWasmBlobUrl = null;
        this._ffmpegClassWorkerUrl = null;
        throw error;
      });
    }

    return this._ffmpegLoadPromise;
  }

  private async createBlobUrlFromFetch(
    sourceUrl: string,
    mimeType: string,
    onProgress?: (event: DownloadProgressEvent) => void,
  ): Promise<string> {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ${sourceUrl}: ${response.status} ${response.statusText}`);
    }

    const contentLength = Number.parseInt(response.headers.get('Content-Length') || '-1', 10);
    const contentEncoding = (response.headers.get('Content-Encoding') || 'identity').toLowerCase();
    const reader = response.body?.getReader();

    if (!reader) {
      const fallbackBuffer = await response.arrayBuffer();
      onProgress?.({
        url: sourceUrl,
        received: fallbackBuffer.byteLength,
        total: fallbackBuffer.byteLength,
      });
      return URL.createObjectURL(new Blob([fallbackBuffer], { type: mimeType }));
    }

    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (!value || value.length === 0) {
        continue;
      }

      chunks.push(value);
      received += value.length;
      onProgress?.({
        url: sourceUrl,
        received,
        total: contentLength,
      });
    }

    const shouldValidateExactLength = contentLength > 0 && (contentEncoding === 'identity' || contentEncoding === '');
    if (shouldValidateExactLength && received !== contentLength) {
      throw new Error(`Incomplete download for ${sourceUrl}: received ${received} of ${contentLength} bytes.`);
    }

    const data = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress?.({
      url: sourceUrl,
      received,
      total: contentLength > 0 ? contentLength : received,
    });

    return URL.createObjectURL(new Blob([data], { type: mimeType }));
  }

  private createFfmpegWorkerBlobUrl(): string {
    const rewrittenWorkerSource = ffmpegWorkerSource
      .replace(/import\s+\{\s*CORE_URL,\s*FFMessageType\s*\}\s+from\s+["']\.\/const\.js["'];?\s*/m, '')
      .replace(/import\s+\{\s*ERROR_UNKNOWN_MESSAGE_TYPE,\s*ERROR_NOT_LOADED,\s*ERROR_IMPORT_FAILURE,\s*\}\s+from\s+["']\.\/errors\.js["'];?\s*/m, '');

    const rewrittenSource = [
      ffmpegConstSource,
      ffmpegErrorsSource,
      rewrittenWorkerSource,
    ].join('\n');

    return URL.createObjectURL(new Blob([rewrittenSource], { type: 'text/javascript' }));
  }

  private buildMp4ExportArgs(inputName: string, outputName: string, startTimeSec: number, durationSec: number): string[] {
    const args: string[] = ['-y'];
    if (startTimeSec > 0.001) {
      args.push('-ss', this.formatFfmpegTime(startTimeSec));
    }

    args.push('-i', inputName);

    if (durationSec > 0.05) {
      args.push('-t', this.formatFfmpegTime(durationSec));
    }

    args.push(
      '-map', '0:v:0',
      '-map', '0:a?',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-profile:v', 'main',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '48000',
      '-ac', '2',
      '-movflags', '+faststart',
      outputName,
    );

    return args;
  }

  private getRecentFfmpegLogSummary(): string {
    if (this._ffmpegRecentLogs.length === 0) {
      return '';
    }

    const tail = this._ffmpegRecentLogs.slice(-6).join(' | ');
    return `FFmpeg log: ${tail}`;
  }

  private parseFfmpegEncodedTime(message: string): number | null {
    const match = message.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!match) {
      return null;
    }

    const hours = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);
    const seconds = Number.parseFloat(match[3]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return null;
    }

    return (hours * 3600) + (minutes * 60) + seconds;
  }

  private formatFfmpegTime(seconds: number): string {
    return seconds.toFixed(3);
  }

  private createTempMediaId(): string {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private toUint8Array(data: string | Uint8Array): Uint8Array<ArrayBuffer> {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
    }

    // ffmpeg.wasm's threaded build can back data with a SharedArrayBuffer, which is
    // not assignable to BlobPart. Reuse the buffer when it's a plain ArrayBuffer,
    // otherwise copy into a fresh ArrayBuffer-backed view.
    if (data.buffer instanceof ArrayBuffer) {
      return data as Uint8Array<ArrayBuffer>;
    }

    return new Uint8Array(data);
  }

  private async cleanupFfmpegFiles(ffmpeg: BrowserFFmpeg, paths: string[]): Promise<void> {
    await Promise.all(paths.map(async (path) => {
      try {
        await ffmpeg.deleteFile(path);
      } catch {
        // File may not exist if export failed before writing it.
      }
    }));
  }

  private async readVideoMetadata(blob: Blob): Promise<{ durationMs: number; width: number; height: number }> {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = url;
    video.playsInline = true;

    try {
      await this.waitForMediaEvent(video, 'loadedmetadata');
      return {
        durationMs: Number.isFinite(video.duration) && video.duration > 0 ? Math.round(video.duration * 1000) : 0,
        width: video.videoWidth,
        height: video.videoHeight,
      };
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
  }

  private analyzeIframeContent(documentRef: Document, iframe: HTMLIFrameElement): {
    primaryCanvas: HTMLCanvasElement | null;
    preferDom: boolean;
  } {
    const primaryCanvas = this.findPrimaryCanvas(documentRef);
    const viewportArea = Math.max(iframe.clientWidth || documentRef.documentElement.clientWidth || 1, 1)
      * Math.max(iframe.clientHeight || documentRef.documentElement.clientHeight || 1, 1);
    const primaryCanvasRect = primaryCanvas?.getBoundingClientRect();
    const primaryCanvasCoverage = primaryCanvasRect
      ? Math.min(primaryCanvasRect.width * primaryCanvasRect.height, viewportArea) / viewportArea
      : 0;
    const meaningfulDomElements = this.countMeaningfulDomElements(documentRef);

    return {
      primaryCanvas,
      preferDom: !primaryCanvas || primaryCanvasCoverage < 0.78 || meaningfulDomElements >= 3,
    };
  }

  private findPrimaryCanvas(documentRef: Document): HTMLCanvasElement | null {
    let bestCanvas: HTMLCanvasElement | null = null;
    let bestArea = 0;
    const view = documentRef.defaultView;

    for (const canvas of Array.from(documentRef.querySelectorAll('canvas'))) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) continue;

      const computed = view?.getComputedStyle(canvas);
      if (computed && (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0)) {
        continue;
      }

      const area = rect.width * rect.height;
      if (area > bestArea) {
        bestArea = area;
        bestCanvas = canvas;
      }
    }

    return bestCanvas;
  }

  private countMeaningfulDomElements(documentRef: Document): number {
    const body = documentRef.body;
    const view = documentRef.defaultView;
    if (!body || !view) return 0;

    const walker = documentRef.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
    let count = 0;

    while (walker.nextNode()) {
      const element = walker.currentNode as Element;
      const tag = element.tagName.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'noscript', 'canvas'].includes(tag)) continue;

      const rect = typeof (element as HTMLElement).getBoundingClientRect === 'function'
        ? (element as HTMLElement).getBoundingClientRect()
        : null;
      if (!rect || rect.width < 12 || rect.height < 12) continue;

      const computed = view.getComputedStyle(element);
      if (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0) {
        continue;
      }

      const hasText = (element.textContent || '').trim().length > 0;
      const hasGraphicContent = tag === 'img'
        || tag === 'svg'
        || computed.backgroundImage !== 'none'
        || (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent');

      if (!hasText && !hasGraphicContent && element.children.length === 0) continue;

      count += 1;
      if (count >= 4) {
        return count;
      }
    }

    return count;
  }

  private async captureCanvasScreenshot(canvas: HTMLCanvasElement | null): Promise<Blob> {
    if (!canvas) {
      throw new Error('No visible canvas was found in the playable.');
    }
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('The playable canvas is empty.');
    }
    return this.canvasToBlob(canvas, 'image/png');
  }

  private async captureDomScreenshot(
    iframe: HTMLIFrameElement,
    documentRef: Document,
    iframeWindow: Window,
  ): Promise<Blob> {
    const root = documentRef.documentElement;
    const viewportWidth = Math.max(iframe.clientWidth || root.clientWidth || 1, 1);
    const viewportHeight = Math.max(iframe.clientHeight || root.clientHeight || 1, 1);
    const backgroundColor = this.resolveScreenshotBackground(documentRef);

    const canvas = await html2canvas(root, {
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scale: Math.min(2, iframeWindow.devicePixelRatio || 1),
      width: viewportWidth,
      height: viewportHeight,
      windowWidth: viewportWidth,
      windowHeight: viewportHeight,
      scrollX: iframeWindow.scrollX,
      scrollY: iframeWindow.scrollY,
      x: 0,
      y: 0,
    });

    return this.canvasToBlob(canvas, 'image/png');
  }

  private resolveScreenshotBackground(documentRef: Document): string | null {
    const view = documentRef.defaultView;
    if (!view) return '#ffffff';

    const candidates = [documentRef.body, documentRef.documentElement];
    for (const element of candidates) {
      if (!element) continue;
      const backgroundColor = view.getComputedStyle(element).backgroundColor;
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        return backgroundColor;
      }
    }

    return '#ffffff';
  }

  private async waitForAnimationFrames(targetWindow: Window, frameCount: number): Promise<void> {
    for (let index = 0; index < frameCount; index += 1) {
      await new Promise<void>(resolve => targetWindow.requestAnimationFrame(() => resolve()));
    }
  }

  private async canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(result => resolve(result), type, quality);
    });
    if (!blob) {
      throw new Error('Canvas export failed.');
    }
    return blob;
  }

  private waitForMediaEvent(mediaElement: HTMLMediaElement, eventName: 'loadedmetadata' | 'seeked'): Promise<void> {
    if (eventName === 'loadedmetadata' && mediaElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(mediaElement.error?.message || `Media failed while waiting for ${eventName}.`));
      };
      const cleanup = () => {
        mediaElement.removeEventListener(eventName, onSuccess);
        mediaElement.removeEventListener('error', onError);
      };

      mediaElement.addEventListener(eventName, onSuccess, { once: true });
      mediaElement.addEventListener('error', onError, { once: true });
    });
  }

  private getPreferredRecordingMimeType(preferredMimeType?: string, includeAudio: boolean = true): string {
    const filteredCandidates = includeAudio
      ? [...PreviewService.recordingMimeTypeCandidates]
      : PreviewService.recordingMimeTypeCandidates.filter(candidate => !/(opus|mp4a)/i.test(candidate));
    const candidates = [preferredMimeType, ...filteredCandidates];
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return preferredMimeType || '';
    }

    for (const candidate of candidates) {
      if (candidate && MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }

    return '';
  }

  private getVideoFileExtension(mimeType: string): string {
    return mimeType.includes('mp4') ? 'mp4' : 'webm';
  }
}
