#!/usr/bin/env node
// cta-mcp — MCP server exposing the headless playable packer over stdio.
// Thin wrapper over @gritsenko/cta-pack (the Node adapter). Three tools:
//   list_networks() · pack_playable({...}) · validate_build({...})
import { stat } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getNetworks,
  pack,
  runPack,
  validateBuild,
  bundleFromBase64Html,
  type PackOptions,
  type PlayableBundle,
  type Report,
} from "@gritsenko/cta-pack";

const optionsSchema = z
  .object({
    name: z.string().optional(),
    suffix: z.string().optional(),
    storeUrls: z
      .object({ android: z.string().optional(), ios: z.string().optional() })
      .optional(),
    compress: z.enum(["none", "imba"]).optional(),
    imbaEncoding: z.enum(["base64", "base122"]).optional(),
  })
  .optional();

function json(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function fail(error: unknown) {
  return {
    content: [
      { type: "text" as const, text: error instanceof Error ? error.message : String(error) },
    ],
    isError: true,
  };
}

async function isPath(source: string): Promise<boolean> {
  try {
    await stat(source);
    return true;
  } catch {
    return false;
  }
}

function looksBase64(value: string): boolean {
  const t = value.trim();
  return t.length >= 8 && t.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(t);
}

function looksHtml(value: string): boolean {
  return /<\s*(?:!doctype|html|head|body|div|script|canvas|meta|section|main|a\b|img)/i.test(value);
}

type ResolvedSource =
  | { kind: "path"; path: string }
  | { kind: "bundle"; bundle: PlayableBundle };

/**
 * Resolve `source` (an existing filesystem path OR base64-encoded HTML) with strict
 * validation, so arbitrary non-base64 strings are rejected instead of silently
 * decoded into garbage.
 */
async function resolveSource(source: string): Promise<ResolvedSource> {
  if (await isPath(source)) {
    return { kind: "path", path: source };
  }
  if (looksHtml(source)) {
    throw new Error("`source` looks like raw HTML; pass it base64-encoded, or a filesystem path.");
  }
  if (!looksBase64(source)) {
    throw new Error("`source` is neither an existing path nor base64-encoded HTML.");
  }
  const bundle = bundleFromBase64Html(source);
  if (!looksHtml(bundle.entryHtml)) {
    throw new Error("Decoded base64 `source` does not look like HTML.");
  }
  return { kind: "bundle", bundle };
}

function buildsFromReport(report: Report) {
  return report.networks.map((n) => ({
    network: n.id,
    path: n.path,
    sizeBytes: n.sizeBytes,
    format: n.output,
  }));
}

const server = new McpServer({ name: "cta-mcp", version: "0.1.1" });

server.registerTool(
  "list_networks",
  {
    title: "List networks",
    description: "List the supported ad networks with output type, max size and notes.",
    inputSchema: {},
  },
  async () => {
    const networks = getNetworks().map((n) => ({
      id: n.id,
      output: n.output,
      maxBytes: n.constraints.maxBytes,
      notes: n.notes,
    }));
    return json(networks);
  }
);

server.registerTool(
  "pack_playable",
  {
    title: "Pack playable",
    description:
      "Pack a playable for one or more ad networks and write the builds. `source` is a path " +
      "(folder with index.html, or a single .html) OR base64-encoded HTML. Returns builds + report.",
    inputSchema: {
      source: z.string().describe("Filesystem path OR base64-encoded HTML."),
      networks: z.array(z.string()).optional().describe("Network ids/names; omit for all."),
      outDir: z.string().optional().describe("Output directory (default: ./builds)."),
      validate: z.boolean().optional().describe("Run validation (default: true)."),
      options: optionsSchema,
    },
  },
  async ({ source, networks, outDir, validate, options }) => {
    try {
      const out = outDir ?? "builds";
      const doValidate = validate ?? true;
      const opts = (options ?? {}) as PackOptions;
      const resolved = await resolveSource(source);
      const report: Report =
        resolved.kind === "path"
          ? await pack({ source: resolved.path, networks, out, validate: doValidate, options: opts })
          : await runPack(resolved.bundle, {
              networks,
              out,
              validate: doValidate,
              options: { name: "Playable", ...opts },
            });
      return json({ builds: buildsFromReport(report), report });
    } catch (error) {
      return fail(error);
    }
  }
);

server.registerTool(
  "validate_build",
  {
    title: "Validate build",
    description:
      "Validate a playable for one or more networks WITHOUT writing builds. `source` is a path " +
      "or base64-encoded HTML. Returns the report.",
    inputSchema: {
      source: z.string().describe("Filesystem path OR base64-encoded HTML."),
      networks: z.array(z.string()).optional().describe("Network ids/names; omit for all."),
      options: optionsSchema,
    },
  },
  async ({ source, networks, options }) => {
    try {
      const opts = (options ?? {}) as PackOptions;
      const resolved = await resolveSource(source);
      const report: Report =
        resolved.kind === "path"
          ? await validateBuild({ source: resolved.path, networks, options: opts })
          : await runPack(resolved.bundle, {
              networks,
              validate: true,
              options: { name: "Playable", ...opts },
            });
      return json(report);
    } catch (error) {
      return fail(error);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logs; stdout is the MCP channel.
  console.error("cta-mcp ready (stdio): list_networks, pack_playable, validate_build");
}

main().catch((error) => {
  console.error(`cta-mcp fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
