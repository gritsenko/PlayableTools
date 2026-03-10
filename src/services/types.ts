export interface PlatformConfig {
  Name: string;
  InjeectScripts?: string[];
  format?: string;
  ExtractScripts?: boolean;
  OutputIndexHtmlName?: string;
  ExtraFiles?: { from: string; to: string }[];
  Sizes?: Record<string, string>;
  replaceTokens?: Record<string, string>;
}

export interface PlayableProcessOptions {
  name?: string;
  title?: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  suffix?: string;
  outputDirectory?: FileSystemDirectoryHandle;
  onProgress?: (progress: number, platform?: string) => void;
  selectedPlatforms?: string[];
}

export interface PublishLaunchContext {
  playableTitle?: string;
  fileName?: string;
  htmlContent?: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  projectId?: string;
  projectName?: string;
  sourceLabel?: string;
}

export interface PublishValidationIssue {
  level: "error" | "warning";
  message: string;
}

export interface GeneratedPlatformArtifact {
  platformName: string;
  platformLabel: string;
  format: "html" | "zip";
  outputFileName: string;
  directoryName: string;
  htmlFileName: string;
  htmlContent: string;
  blob: Blob;
}

export interface PreviewScript {
  source: string;
  position: 'beforeHeadEnd' | 'afterBodyStart' | 'beforeBodyEnd';
}

export interface PreviewPreset {
  id: string;
  name: string;
  description: string;
  maxFileSizeMB: number;
  injectScripts: PreviewScript[];
  replaceTokens: Record<string, string>;
}

export interface PreviewPresetsConfig {
  presets: PreviewPreset[];
}

export interface PreviewServiceOptions {
  preset?: PreviewPreset;
  customMaxFileSizeMB?: number;
  customInjectScripts?: PreviewScript[];
  customReplaceTokens?: Record<string, string>;
}
