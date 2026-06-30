// Packing orchestration — ported from buildPlatformArtifacts / buildZipPackageBlob
// in src/services/PlayablePublishService.ts. ZIP bytes are produced via JSZip's
// universal `uint8array` type (no Blob), so this runs in any environment.
import JSZip from "jszip";
import type { Asset, PackedArtifact, PackOptions, PlayableBundle } from "./types.js";
import { type NetworkConfig, getNetworkConfig } from "./networks.js";
import { applyGlobalTokens, processHtml } from "./transform.js";
import { extractInlineScripts } from "./assets-extractor.js";
import { packImba } from "./imba.js";
import { PUBLISH_ASSETS } from "./generated/publish-assets.js";
import { utf8Encode } from "./text.js";

function resolveConfig(network: string | NetworkConfig): NetworkConfig {
  if (typeof network !== "string") return network;
  const config = getNetworkConfig(network);
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

// Ported from generateFileName().
function generateFileName(
  playableName: string,
  network: NetworkConfig,
  suffix: string,
  useOutputIndexHtmlName: boolean
): string {
  if (useOutputIndexHtmlName && network.OutputIndexHtmlName) {
    if (network.OutputIndexHtmlName.includes("%name%")) {
      return network.OutputIndexHtmlName.replace("%name%", playableName);
    }
    return network.OutputIndexHtmlName;
  }
  return `${playableName}_${network.Name}_${suffix}.html`;
}

async function buildZipBytes(
  html: string,
  htmlFileName: string,
  network: NetworkConfig,
  bundle: PlayableBundle,
  compressed: boolean
): Promise<Uint8Array> {
  const zip = new JSZip();

  if (network.ExtractScripts && !compressed) {
    try {
      const extracted = extractInlineScripts(html);
      zip.file(htmlFileName, extracted.html);
      for (const [fileName, content] of Object.entries(extracted.files)) {
        zip.file(fileName, content);
      }
    } catch {
      zip.file(htmlFileName, html);
    }
  } else {
    zip.file(htmlFileName, html);
  }

  if (network.ExtraFiles) {
    for (const extraFile of network.ExtraFiles) {
      const key = extraFile.from.replace("./", "");
      const content = PUBLISH_ASSETS[key];
      if (content !== undefined) {
        zip.file(extraFile.to.replace("./", ""), content);
      }
    }
  }

  // Carry folder-source assets verbatim into the ZIP (no-op for single-HTML sources).
  for (const asset of bundle.assets) {
    zip.file(asset.path, asset.bytes);
  }

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  });
}

export async function packForNetwork(
  bundle: PlayableBundle,
  network: string | NetworkConfig,
  options: PackOptions = {}
): Promise<PackedArtifact> {
  const config = resolveConfig(network);
  const name = options.name || "Playable";
  const suffix = options.suffix || "EN";

  const globalHtml = applyGlobalTokens(bundle.entryHtml);
  const processedHtml = processHtml(globalHtml, config, options);

  const htmlFileName = generateFileName(name, config, suffix, true);
  const zipBaseHtmlName = generateFileName(name, config, suffix, false);
  const isZip = config.format === "zip";
  const outputFileName = isZip ? zipBaseHtmlName.replace(/\.html$/i, ".zip") : htmlFileName;

  let compressed = false;
  let deliverableHtml = processedHtml;
  if (options.compress === "imba") {
    deliverableHtml = packImba(processedHtml, htmlFileName, options.imbaEncoding ?? "base64").html;
    compressed = true;
  }

  let files: Asset[];
  if (isZip) {
    const zipBytes = await buildZipBytes(deliverableHtml, htmlFileName, config, bundle, compressed);
    files = [{ path: outputFileName, bytes: zipBytes, mime: "application/zip" }];
  } else {
    files = [{ path: outputFileName, bytes: utf8Encode(deliverableHtml), mime: "text/html" }];
  }

  const sizeBytes = files.reduce((sum, file) => sum + file.bytes.length, 0);

  return {
    network: config.id,
    name,
    output: isZip ? "zip" : "single-html",
    outputFileName,
    entryHtml: processedHtml,
    sourceHtml: bundle.entryHtml,
    files,
    sizeBytes,
    compressed,
  };
}

export async function packBundle(
  bundle: PlayableBundle,
  networks: Array<string | NetworkConfig>,
  options: PackOptions = {}
): Promise<PackedArtifact[]> {
  const artifacts: PackedArtifact[] = [];
  for (const network of networks) {
    artifacts.push(await packForNetwork(bundle, network, options));
  }
  return artifacts;
}
