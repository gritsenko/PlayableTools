export interface PlatformConfig {
  Name: string;
  InjeectScripts?: string[];
  format?: string;
  ExtractScripts?: boolean;
  OutputIndexHtmlName?: string;
  ExtraFiles?: { from: string; to: string }[];
  Sizes?: Record<string, string>;
}

export interface PlayableProcessOptions {
  name?: string;
  // Add more options as needed
}
