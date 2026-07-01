// Filesystem source reader — the Node adapter's input port.
// A folder => entry index.html + every other file carried as an asset.
// A single .html file => entry html, no assets.
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Asset, PlayableBundle } from "@gritsenko/cta-core";

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain",
};

function mimeFor(filePath: string): string {
  return MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

export interface LoadedSource {
  bundle: PlayableBundle;
  /** Suggested base name for the playable (folder name or html basename, no extension). */
  baseName: string;
}

export async function readSource(source: string): Promise<LoadedSource> {
  const stat = await fs.stat(source).catch(() => {
    throw new Error(`Source not found: ${source}`);
  });

  if (stat.isFile()) {
    if (!/\.html?$/i.test(source)) {
      throw new Error(`Source file must be .html / .htm: ${source}`);
    }
    const entryHtml = await fs.readFile(source, "utf8");
    return {
      bundle: { entryHtml, assets: [] },
      baseName: path.basename(source).replace(/\.html?$/i, ""),
    };
  }

  // Directory source.
  const files = await walk(source);
  const rels = files.map((f) => path.relative(source, f).split(path.sep).join("/"));

  let entryRel = rels.find((r) => r.toLowerCase() === "index.html");
  if (!entryRel) {
    const rootHtmls = rels.filter((r) => /\.html?$/i.test(r) && !r.includes("/"));
    if (rootHtmls.length === 1) entryRel = rootHtmls[0];
  }
  if (!entryRel) {
    throw new Error(
      `No entry HTML found in folder "${source}" (expected a root index.html or a single root .html).`
    );
  }

  const entryHtml = await fs.readFile(path.join(source, entryRel), "utf8");
  const assets: Asset[] = [];
  for (const rel of rels) {
    if (rel === entryRel) continue;
    const bytes = new Uint8Array(await fs.readFile(path.join(source, rel)));
    assets.push({ path: rel, bytes, mime: mimeFor(rel) });
  }

  return {
    bundle: { entryHtml, assets },
    baseName: path.basename(source),
  };
}

/** Build an in-memory bundle from base64-encoded HTML (used by the MCP server). */
export function bundleFromBase64Html(base64Html: string): PlayableBundle {
  const entryHtml = Buffer.from(base64Html, "base64").toString("utf8");
  return { entryHtml, assets: [] };
}
