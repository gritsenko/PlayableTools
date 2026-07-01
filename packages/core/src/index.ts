// @gritsenko/cta-core — headless, browser-free playable packing core.
// Zero browser APIs, zero node-fs. Hosts (web / node / mcp) supply and persist bytes.
export const CORE_VERSION = "0.1.0";

export type {
  Asset,
  PlayableBundle,
  CompressMode,
  ImbaEncoding,
  PackOptions,
  NetworkOutput,
  NetworkConstraints,
  NetworkAdapter,
  PackedArtifact,
  IssueLevel,
  ValidationIssue,
  NetworkReport,
  Report,
} from "./types.js";

export {
  NETWORKS,
  GLOBAL_DEFAULTS,
  getNetworks,
  getNetworkConfig,
  selectNetworks,
  toAdapter,
  isMraid,
  type NetworkConfig,
} from "./networks.js";

export { packForNetwork, packBundle } from "./pack.js";
export { validateArtifact } from "./validate.js";
export { packImba } from "./imba.js";
export { extractInlineScripts, type ExtractedAssetsResult } from "./assets-extractor.js";
export { utf8Encode, utf8ByteLength, bytesToBase64 } from "./text.js";
export {
  applyReplaceTokens,
  applyGlobalTokens,
  processHtml,
  injectScripts,
} from "./transform.js";
