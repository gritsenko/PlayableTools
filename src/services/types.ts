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
  // Add more options as needed
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
