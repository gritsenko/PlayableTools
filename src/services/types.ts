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
