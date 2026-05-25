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

export interface PreviewLanguageOption {
  code: string;
  label: string;
}

export interface PreviewPreset {
  id: string;
  name: string;
  description: string;
  maxFileSizeMB: number;
  injectScripts: PreviewScript[];
  replaceTokens: Record<string, string>;
  supportsLanguageSwitching?: boolean;
  availableLanguages?: PreviewLanguageOption[];
  defaultLanguage?: string;
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

export interface PreviewRecordingResult {
  blob: Blob;
  mimeType: string;
  fileExtension: string;
  durationMs: number;
  width: number;
  height: number;
  startedAt: number;
}

export interface PreviewRecordingController {
  startedAt: number;
  result: Promise<PreviewRecordingResult>;
  stop: () => Promise<PreviewRecordingResult>;
  cancel: () => Promise<void>;
}
