import { injectable, ServiceLifetime } from "fw";
import type {
  GeneratedPlatformArtifact,
  PlatformConfig,
  PlayableProcessOptions,
  PublishLaunchContext,
  PublishValidationIssue,
} from "./types";
import { UrlUtils } from "../utils/url-utils";
import { AsstesExtractor } from "../utils/AsstesExtractor";
// @ts-ignore
import platformsConfig from "../assets/platforms-config.json";

@injectable(ServiceLifetime.Singleton)
export class PlayablePublishService {
  private config: PlatformConfig[] = [];
  private globalDefaults: { replaceTokens?: Record<string, string> } = {};
  private launchContext: PublishLaunchContext | null = null;

  constructor() {
    this.loadConfig(platformsConfig);
  }

  loadConfig(configJson: any) {
    if (!Array.isArray(configJson.platforms)) {
      throw new Error("Invalid config: platforms array missing");
    }

    this.config = configJson.platforms;
    if (configJson.globalDefaults && typeof configJson.globalDefaults === "object") {
      this.globalDefaults = configJson.globalDefaults;
    }
  }

  getPlatforms(): PlatformConfig[] {
    return this.config;
  }

  getPlatformByName(platformName: string): PlatformConfig | undefined {
    return this.config.find((platform) => platform.Name === platformName);
  }

  getAvailablePlatforms(): string[] {
    return this.config.map((platform) => platform.Name);
  }

  getPlatformLabel(platformName: string): string {
    const platform = this.getPlatformByName(platformName);
    return `${platformName} (${platform?.format === "zip" ? "ZIP" : "HTML"})`;
  }

  setLaunchContext(context: PublishLaunchContext | null): void {
    this.launchContext = context ? { ...context } : null;
  }

  getLaunchContext(): PublishLaunchContext | null {
    return this.launchContext ? { ...this.launchContext } : null;
  }

  consumeLaunchContext(): PublishLaunchContext | null {
    const context = this.getLaunchContext();
    this.launchContext = null;
    return context;
  }

  detectCtaIntegration(htmlContent: string): boolean {
    return /document\s*\[\s*["']CTA["']\s*\]\s*(?:\?\.)?\s*onClick\s*(?:\?\.)?\s*\(/i.test(htmlContent)
      || /document\s*\.\s*CTA\s*(?:\?\.)?\s*\.\s*onClick\s*(?:\?\.)?\s*\(/i.test(htmlContent);
  }

  validatePublishRequest(htmlContent: string, options: PlayableProcessOptions): PublishValidationIssue[] {
    const issues: PublishValidationIssue[] = [];
    const selectedPlatforms = options.selectedPlatforms ?? [];

    if (!options.title?.trim()) {
      issues.push({ level: "error", message: "Playable title is required." });
    }

    if (selectedPlatforms.length === 0) {
      issues.push({ level: "error", message: "Select at least one platform to publish." });
    }

    const selectedConfigs = this.resolvePlatforms(selectedPlatforms);
    const requiresMraidUrls = selectedConfigs.some((platform) =>
      (platform.InjeectScripts ?? []).some((script) => /mraid/i.test(script))
    );

    if (requiresMraidUrls && !options.googlePlayUrl?.trim()) {
      issues.push({ level: "error", message: "Google Play URL is required for MRAID-based platforms." });
    }

    if (requiresMraidUrls && !options.appStoreUrl?.trim()) {
      issues.push({ level: "error", message: "App Store URL is required for MRAID-based platforms." });
    }

    if (!this.detectCtaIntegration(htmlContent)) {
      issues.push({
        level: "warning",
        message: 'CTA SDK hook was not detected. Expected one of: document["CTA"].onClick(), document["CTA"]?.onClick?.(), or document.CTA.onClick().',
      });
    }

    return issues;
  }

  async processHtml(
    htmlContent: string,
    platformName: string,
    options?: PlayableProcessOptions
  ): Promise<string> {
    const platform = this.getPlatformByName(platformName);
    if (!platform) {
      throw new Error(`Platform '${platformName}' not found in config`);
    }

    let resultHtml = htmlContent;
    const effectiveTokens: Record<string, string> = {};
    if (platform.replaceTokens) {
      Object.assign(effectiveTokens, platform.replaceTokens);
    }
    if (options?.googlePlayUrl) {
      effectiveTokens["{{google}}"] = options.googlePlayUrl;
    }
    if (options?.appStoreUrl) {
      effectiveTokens["{{apple}}"] = options.appStoreUrl;
    }

    if (Object.keys(effectiveTokens).length > 0) {
      resultHtml = this.applyReplaceTokens(resultHtml, effectiveTokens);
    }

    if (platform.InjeectScripts && Array.isArray(platform.InjeectScripts)) {
      resultHtml = await this.injectScripts(resultHtml, platform.InjeectScripts, effectiveTokens);
    }

    return resultHtml;
  }

  async processAllPlatforms(htmlContent: string, options: PlayableProcessOptions): Promise<void> {
    if (!options.outputDirectory) {
      throw new Error("Output directory is required");
    }

    const artifacts = await this.buildPlatformArtifacts(htmlContent, options);
    for (let index = 0; index < artifacts.length; index++) {
      const artifact = artifacts[index];
      const directory = await this.createPlatformDirectory(options.outputDirectory, artifact.directoryName);
      await this.saveBlobToDirectory(artifact.blob, artifact.outputFileName, directory);
      options.onProgress?.(30 + ((index + 1) / artifacts.length) * 70, artifact.platformName);
    }
  }

  async buildPlatformArtifacts(
    htmlContent: string,
    options: PlayableProcessOptions
  ): Promise<GeneratedPlatformArtifact[]> {
    const playableName = options.name || "Playable";
    const suffix = options.suffix || "EN";
    const globalProcessedHtml = this.applyGlobalTokens(htmlContent);
    const platforms = this.resolvePlatforms(options.selectedPlatforms);
    const artifacts: GeneratedPlatformArtifact[] = [];

    for (const platform of platforms) {
      const processedHtml = await this.processHtml(globalProcessedHtml, platform.Name, options);
      const htmlFileName = this.generateFileName(playableName, platform.Name, suffix, platform, true);
      const zipBaseHtmlName = this.generateFileName(playableName, platform.Name, suffix, platform, false);
      const outputFileName = platform.format === "zip"
        ? zipBaseHtmlName.replace(/\.html$/i, ".zip")
        : htmlFileName;
      const blob = platform.format === "zip"
        ? await this.buildZipPackageBlob(processedHtml, htmlFileName, platform)
        : new Blob([processedHtml], { type: "text/html" });

      artifacts.push({
        platformName: platform.Name,
        platformLabel: this.getPlatformLabel(platform.Name),
        format: platform.format === "zip" ? "zip" : "html",
        outputFileName,
        directoryName: platform.Name,
        htmlFileName,
        htmlContent: processedHtml,
        blob,
      });
    }

    return artifacts;
  }

  async buildAggregateZipBlob(htmlContent: string, options: PlayableProcessOptions): Promise<Blob> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const artifacts = await this.buildPlatformArtifacts(htmlContent, options);

    for (const artifact of artifacts) {
      zip.file(`${artifact.directoryName}/${artifact.outputFileName}`, await artifact.blob.arrayBuffer());
    }

    return this.generateZipBlob(zip);
  }

  async downloadAggregateZip(htmlContent: string, options: PlayableProcessOptions): Promise<void> {
    const blob = await this.buildAggregateZipBlob(htmlContent, options);
    const fileName = `${options.name || "Playable"}_${options.suffix || "EN"}_all-platforms.zip`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async requestOutputDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!("showDirectoryPicker" in window)) {
      throw new Error(
        "File System Access API is not supported in this browser. Please use Chrome, Edge, or another supported browser."
      );
    }

    try {
      // @ts-ignore
      return await window.showDirectoryPicker();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Directory selection was cancelled");
      }
      throw new Error(`Failed to select directory: ${error}`);
    }
  }

  private applyGlobalTokens(htmlContent: string): string {
    if (!this.globalDefaults.replaceTokens) {
      return htmlContent;
    }
    return this.applyReplaceTokens(htmlContent, this.globalDefaults.replaceTokens);
  }

  private resolvePlatforms(selectedPlatforms?: string[]): PlatformConfig[] {
    if (!selectedPlatforms || selectedPlatforms.length === 0) {
      return this.config;
    }
    return this.config.filter((platform) => selectedPlatforms.includes(platform.Name));
  }

  private applyReplaceTokens(html: string, replaceTokens: Record<string, string>): string {
    if (!replaceTokens || Object.keys(replaceTokens).length === 0) {
      return html;
    }

    const escapedTokens = Object.keys(replaceTokens).map((token) =>
      token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(escapedTokens.join("|"), "g");
    return html.replace(regex, (match) => replaceTokens[match] ?? match);
  }

  private async injectScripts(
    html: string,
    scripts: string[],
    replaceTokens?: Record<string, string>
  ): Promise<string> {
    let result = html;
    const scriptTags = (await Promise.all(
      scripts.map(async (scriptSrc) => {
        try {
          const fetchUrl = UrlUtils.buildFetchUrl("publish-data/", scriptSrc);
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            return null;
          }

          let scriptContent = await response.text();
          if (replaceTokens && Object.keys(replaceTokens).length > 0) {
            scriptContent = this.applyReplaceTokens(scriptContent, replaceTokens);
          }
          return `<script>\n${scriptContent}\n</script>`;
        } catch {
          return null;
        }
      })
    )).filter(Boolean) as string[];

    for (const scriptTag of scriptTags) {
      if (/<head[^>]*>/i.test(result)) {
        const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);
        if (headMatch) {
          const headContent = headMatch[2];
          const firstScriptMatch = headContent.match(/<script[^>]*>/i);
          if (firstScriptMatch) {
            const insertIndex = headMatch.index! + headMatch[1].length + headContent.indexOf(firstScriptMatch[0]);
            result = `${result.slice(0, insertIndex)}\n${scriptTag}\n${result.slice(insertIndex)}`;
          } else {
            result = result.replace(/<\/head>/i, `${scriptTag}\n</head>`);
          }
        }
      } else if (/<\/body>/i.test(result)) {
        result = result.replace(/<\/body>/i, `${scriptTag}\n</body>`);
      } else {
        result += scriptTag;
      }
    }

    return result;
  }

  private generateFileName(
    playableName: string,
    platformName: string,
    suffix: string,
    platform: PlatformConfig,
    useOutputIndexHtmlName: boolean
  ): string {
    if (useOutputIndexHtmlName && platform.OutputIndexHtmlName) {
      if (platform.OutputIndexHtmlName.includes("%name%")) {
        return platform.OutputIndexHtmlName.replace("%name%", playableName);
      }
      return platform.OutputIndexHtmlName;
    }
    return `${playableName}_${platformName}_${suffix}.html`;
  }

  private async createPlatformDirectory(
    parentDir: FileSystemDirectoryHandle,
    platformName: string
  ): Promise<FileSystemDirectoryHandle> {
    return parentDir.getDirectoryHandle(platformName, { create: true });
  }

  private async saveBlobToDirectory(
    blob: Blob,
    fileName: string,
    directory: FileSystemDirectoryHandle
  ): Promise<void> {
    const fileHandle = await directory.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  private async buildZipPackageBlob(
    htmlContent: string,
    htmlFileName: string,
    platform: PlatformConfig
  ): Promise<Blob> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    if (platform.ExtractScripts) {
      try {
        const extracted = AsstesExtractor.extractScripts(htmlContent);
        zip.file(htmlFileName, extracted.html);
        for (const [fileName, content] of Object.entries(extracted.files)) {
          zip.file(fileName, content);
        }
      } catch {
        zip.file(htmlFileName, htmlContent);
      }
    } else {
      zip.file(htmlFileName, htmlContent);
    }

    if (platform.ExtraFiles) {
      for (const extraFile of platform.ExtraFiles) {
        try {
          const publicPath = `/publish-data/${extraFile.from.replace("./", "")}`;
          const response = await fetch(publicPath);
          if (response.ok) {
            zip.file(extraFile.to.replace("./", ""), await response.text());
          }
        } catch {
          // Ignore missing extra files and keep remaining artifacts intact.
        }
      }
    }

    return this.generateZipBlob(zip);
  }

  private async generateZipBlob(zip: { generateAsync: (options: any) => Promise<any> }): Promise<Blob> {
    return zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    });
  }
}
