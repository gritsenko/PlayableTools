import { injectable, ServiceLifetime } from "fw";
import type {
  GeneratedPlatformArtifact,
  PlayableProcessOptions,
  PublishLaunchContext,
  PublishValidationIssue,
} from "./types";
import {
  getNetworks,
  getNetworkConfig,
  isMraid,
  packForNetwork,
} from "@gritsenko/cta-core";
import type { PackOptions, PlayableBundle } from "@gritsenko/cta-core";

/**
 * Browser adapter over @gritsenko/cta-core.
 *
 * All packing/transform logic lives in the headless core; this service only
 * bridges the browser-specific I/O: reading the upload (done by the page),
 * wrapping the core's Uint8Array output in Blobs, and writing them out via the
 * download anchor / File System Access API. The public surface is unchanged so
 * the publish page, preview and portfolio pages keep working as before.
 */
@injectable(ServiceLifetime.Singleton)
export class PlayablePublishService {
  private launchContext: PublishLaunchContext | null = null;

  // --- platform listing (kept in "Name" space for UI/localStorage compatibility) ---

  getAvailablePlatforms(): string[] {
    return getNetworks().map((network) => network.name);
  }

  getPlatformByName(platformName: string) {
    return getNetworks().find((network) => network.name === platformName);
  }

  getPlatforms() {
    return getNetworks();
  }

  getPlatformLabel(platformName: string): string {
    const adapter = this.getPlatformByName(platformName);
    return `${platformName} (${adapter?.output === "zip" ? "ZIP" : "HTML"})`;
  }

  // --- launch context (pure state, browser-agnostic) ---

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

  // --- input validation (pre-publish) ---

  detectCtaIntegration(htmlContent: string): boolean {
    return (
      /document\s*\[\s*["']CTA["']\s*\]\s*(?:\?\.)?\s*onClick\s*(?:\?\.)?\s*\(/i.test(htmlContent) ||
      /document\s*\.\s*CTA\s*(?:\?\.)?\s*\.\s*onClick\s*(?:\?\.)?\s*\(/i.test(htmlContent)
    );
  }

  validatePublishRequest(
    htmlContent: string,
    options: PlayableProcessOptions
  ): PublishValidationIssue[] {
    const issues: PublishValidationIssue[] = [];
    const selectedPlatforms = options.selectedPlatforms ?? [];

    if (!options.title?.trim()) {
      issues.push({ level: "error", message: "Playable title is required." });
    }

    if (selectedPlatforms.length === 0) {
      issues.push({ level: "error", message: "Select at least one platform to publish." });
    }

    const requiresMraidUrls = selectedPlatforms
      .map((name) => getNetworkConfig(name))
      .some((config) => config !== undefined && isMraid(config));

    if (requiresMraidUrls && !options.googlePlayUrl?.trim()) {
      issues.push({ level: "error", message: "Google Play URL is required for MRAID-based platforms." });
    }

    if (requiresMraidUrls && !options.appStoreUrl?.trim()) {
      issues.push({ level: "error", message: "App Store URL is required for MRAID-based platforms." });
    }

    if (!this.detectCtaIntegration(htmlContent)) {
      issues.push({
        level: "warning",
        message:
          'CTA SDK hook was not detected. Expected one of: document["CTA"].onClick(), document["CTA"]?.onClick?.(), or document.CTA.onClick().',
      });
    }

    return issues;
  }

  // --- core bridging ---

  private toPackOptions(options?: PlayableProcessOptions): PackOptions {
    return {
      name: options?.name,
      suffix: options?.suffix,
      storeUrls: {
        android: options?.googlePlayUrl,
        ios: options?.appStoreUrl,
      },
    };
  }

  /** Single-platform transform — returns the transformed HTML string. */
  async processHtml(
    htmlContent: string,
    platformName: string,
    options?: PlayableProcessOptions
  ): Promise<string> {
    const config = getNetworkConfig(platformName);
    if (!config) {
      throw new Error(`Platform '${platformName}' not found in config`);
    }
    const bundle: PlayableBundle = { entryHtml: htmlContent, assets: [] };
    const artifact = await packForNetwork(bundle, config, this.toPackOptions(options));
    return artifact.entryHtml;
  }

  async buildPlatformArtifacts(
    htmlContent: string,
    options: PlayableProcessOptions
  ): Promise<GeneratedPlatformArtifact[]> {
    const names =
      options.selectedPlatforms && options.selectedPlatforms.length > 0
        ? options.selectedPlatforms
        : this.getAvailablePlatforms();
    const bundle: PlayableBundle = { entryHtml: htmlContent, assets: [] };
    const packOptions = this.toPackOptions(options);
    const artifacts: GeneratedPlatformArtifact[] = [];

    for (const platformName of names) {
      const config = getNetworkConfig(platformName);
      if (!config) {
        continue;
      }
      const packed = await packForNetwork(bundle, config, packOptions);
      const isZip = packed.output === "zip";
      const blob = new Blob([packed.files[0].bytes as BlobPart], {
        type: isZip ? "application/zip" : "text/html",
      });

      artifacts.push({
        platformName,
        platformLabel: this.getPlatformLabel(platformName),
        format: isZip ? "zip" : "html",
        outputFileName: packed.outputFileName,
        directoryName: platformName,
        htmlFileName: packed.outputFileName,
        htmlContent: packed.entryHtml,
        blob,
      });
    }

    return artifacts;
  }

  async processAllPlatforms(htmlContent: string, options: PlayableProcessOptions): Promise<void> {
    if (!options.outputDirectory) {
      throw new Error("Output directory is required");
    }

    const artifacts = await this.buildPlatformArtifacts(htmlContent, options);
    for (let index = 0; index < artifacts.length; index++) {
      const artifact = artifacts[index];
      const directory = await options.outputDirectory.getDirectoryHandle(artifact.directoryName, {
        create: true,
      });
      const fileHandle = await directory.getFileHandle(artifact.outputFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(artifact.blob);
      await writable.close();
      options.onProgress?.(30 + ((index + 1) / artifacts.length) * 70, artifact.platformName);
    }
  }

  async buildAggregateZipBlob(htmlContent: string, options: PlayableProcessOptions): Promise<Blob> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const artifacts = await this.buildPlatformArtifacts(htmlContent, options);

    for (const artifact of artifacts) {
      zip.file(`${artifact.directoryName}/${artifact.outputFileName}`, await artifact.blob.arrayBuffer());
    }

    return zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    });
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
}
