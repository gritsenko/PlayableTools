// Per-network validation producing machine-actionable issues for the report contract.
// Heuristics ported from the preview validators (FacebookValidator / GeneralValidator /
// MraidValidator) and detectCtaIntegration() from PlayablePublishService.
import type { PackedArtifact, ValidationIssue } from "./types.js";
import { type NetworkConfig, getNetworkConfig, isMraid } from "./networks.js";

function resolveConfig(network: string | NetworkConfig): NetworkConfig {
  if (typeof network !== "string") return network;
  const config = getNetworkConfig(network);
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}

// Ported from PlayablePublishService.detectCtaIntegration().
function detectCtaIntegration(html: string): boolean {
  return (
    /document\s*\[\s*["']CTA["']\s*\]\s*(?:\?\.)?\s*onClick\s*(?:\?\.)?\s*\(/i.test(html) ||
    /document\s*\.\s*CTA\s*(?:\?\.)?\s*\.\s*onClick\s*(?:\?\.)?\s*\(/i.test(html)
  );
}

// Ported from GeneralValidator.
const ALLOWED_EXTERNAL_SCRIPT =
  /(?:mraid\.js|\/\/tpc\.googlesyndication\.com\/pagead\/gadgets\/html5\/api\/exitapi\.js|https:\/\/sdk\.games\.s3\.yandex\.net\/sdk\.js|(?:\.\/)?sdk\.js|\/sdk\.js)/;

function hasDisallowedExternalScript(html: string): boolean {
  const matches = Array.from(html.matchAll(/<script[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/gi));
  return matches.some((match) => !ALLOWED_EXTERNAL_SCRIPT.test(match[1]));
}

/**
 * Validate a packed artifact for a network. Size is checked against the delivered
 * artifact bytes; content heuristics run on the transformed entry HTML.
 */
export function validateArtifact(
  artifact: PackedArtifact,
  network: string | NetworkConfig
): ValidationIssue[] {
  const config = resolveConfig(network);
  const issues: ValidationIssue[] = [];
  const html = artifact.entryHtml;

  // SIZE_EXCEEDED (error)
  if (config.maxBytes && artifact.sizeBytes > config.maxBytes) {
    const deficit = artifact.sizeBytes - config.maxBytes;
    const hint = artifact.compressed
      ? `Reduce inlined assets by ~${humanBytes(deficit)} (already imba-compressed).`
      : `compress=imba or reduce inlined assets by ~${humanBytes(deficit)}.`;
    issues.push({
      code: "SIZE_EXCEEDED",
      level: "error",
      limit: config.maxBytes,
      actual: artifact.sizeBytes,
      hint,
      message: `Artifact is ${humanBytes(artifact.sizeBytes)} (max ${humanBytes(config.maxBytes)}).`,
    });
  }

  // MISSING_STORE_URL — unresolved {{google}}/{{apple}} placeholders.
  const mraid = isMraid(config);
  const storeLevel = mraid ? "error" : "warning";
  if (html.includes("{{google}}")) {
    issues.push({
      code: "MISSING_STORE_URL",
      level: storeLevel,
      which: "android",
      hint: "Provide storeUrls.android (Google Play URL) to fill the {{google}} token.",
    });
  }
  if (html.includes("{{apple}}")) {
    issues.push({
      code: "MISSING_STORE_URL",
      level: storeLevel,
      which: "ios",
      hint: "Provide storeUrls.ios (App Store URL) to fill the {{apple}} token.",
    });
  }

  // NO_CTA_HOOK (warning) — checked against the SOURCE playable, not the SDK-injected
  // output (some injected SDK scripts contain their own onClick() call).
  if (!detectCtaIntegration(artifact.sourceHtml)) {
    issues.push({
      code: "NO_CTA_HOOK",
      level: "warning",
      hint: 'Call document["CTA"].onClick() (or document.CTA.onClick()) on your CTA button.',
    });
  }

  // EXTERNAL_SCRIPT (warning) — disallowed external <script src>.
  if (hasDisallowedExternalScript(html)) {
    issues.push({
      code: "EXTERNAL_SCRIPT",
      level: "warning",
      hint: "Bundle/inline external scripts; only mraid.js, exitapi.js and Yandex sdk.js are allowed.",
    });
  }

  // INVALID_HTML (warning) — no <html>...</html>.
  if (!/<html[^>]*>[\s\S]*<\/html>/i.test(html)) {
    issues.push({
      code: "INVALID_HTML",
      level: "warning",
      hint: "Wrap the document in a proper <html>…</html> structure.",
    });
  }

  // MISSING_DOCTYPE (warning)
  if (!/<!DOCTYPE html>/i.test(html)) {
    issues.push({
      code: "MISSING_DOCTYPE",
      level: "warning",
      hint: "Add a <!DOCTYPE html> declaration.",
    });
  }

  // BLOCKED_API (warning) — Facebook-family blocks XHR/fetch.
  const blocksXhrFetch = !!config.replaceTokens && "XMLHttpRequest" in config.replaceTokens;
  if (blocksXhrFetch && (html.includes("XMLHttpRequest") || html.includes("fetch("))) {
    issues.push({
      code: "BLOCKED_API",
      level: "warning",
      hint: "Facebook/Moloco block XMLHttpRequest and fetch(); remove them (e.g. from PixiJS/Howler).",
    });
  }

  return issues;
}
