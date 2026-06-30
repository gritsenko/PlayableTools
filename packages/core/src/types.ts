// Public data model for the headless playable packing core.
// The core operates purely on in-memory structures — it never knows where the
// bytes came from or where they will go (that is the host adapter's job).

export interface Asset {
  /** POSIX-relative path of the file inside the bundle / output package. */
  path: string;
  bytes: Uint8Array;
  mime: string;
}

export interface PlayableBundle {
  /** The entry HTML document (index.html), as text. */
  entryHtml: string;
  /** Non-entry assets carried alongside (folder sources). Empty for single-HTML sources. */
  assets: Asset[];
}

export type CompressMode = "none" | "imba";
export type ImbaEncoding = "base64" | "base122";

export interface PackOptions {
  /** Playable name used for output file naming (default "Playable"). */
  name?: string;
  /** Locale/variant suffix used for output file naming (default "EN"). */
  suffix?: string;
  /** Store URLs substituted into the {{google}} / {{apple}} tokens. */
  storeUrls?: { android?: string; ios?: string };
  /** Optional compression of the entry HTML. "imba" inlines a pako-compressed loader. */
  compress?: CompressMode;
  /** Encoding for the imba inline payload (default "base64"). */
  imbaEncoding?: ImbaEncoding;
}

export type NetworkOutput = "single-html" | "zip";

export interface NetworkConstraints {
  /** Maximum size of the delivered artifact in bytes (the zip size for zip networks). */
  maxBytes?: number;
}

export interface NetworkAdapter {
  /** Stable lowercase id used by the CLI / MCP / report. */
  id: string;
  /** Display name (matches the legacy platform config Name). */
  name: string;
  output: NetworkOutput;
  constraints: NetworkConstraints;
  notes?: string;
  /** True when the network expects MRAID (store URLs required). */
  mraid: boolean;
}

export interface PackedArtifact {
  /** Network id. */
  network: string;
  /** Playable name used for this build. */
  name: string;
  output: NetworkOutput;
  /** File name of the delivered artifact (e.g. index.html, Name_Google_EN.zip). */
  outputFileName: string;
  /** Transformed entry HTML (post token + script injection, pre-compression) — used for validation. */
  entryHtml: string;
  /** Original source HTML before any transform — used for source-intent checks (e.g. CTA hook). */
  sourceHtml: string;
  /** The deliverable file(s) to write. v1 always one (the html or the zip). */
  files: Asset[];
  /** Total bytes of the deliverable (== sum of files[].bytes lengths). */
  sizeBytes: number;
  /** True when the entry HTML was imba-compressed. */
  compressed: boolean;
}

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  /** Machine-actionable code, e.g. SIZE_EXCEEDED. */
  code: string;
  level: IssueLevel;
  /** Human + agent oriented remediation hint. */
  hint: string;
  /** Optional longer message. */
  message?: string;
  limit?: number;
  actual?: number;
  which?: "android" | "ios";
}

export interface NetworkReport {
  id: string;
  ok: boolean;
  output: NetworkOutput;
  /** Path of the written artifact (filled by host adapters that write to disk). */
  path?: string;
  sizeBytes: number;
  issues?: ValidationIssue[];
}

export interface Report {
  ok: boolean;
  networks: NetworkReport[];
}
