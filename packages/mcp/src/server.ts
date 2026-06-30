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

function buildsFromReport(report: Report) {
  return report.networks.map((n) => ({
    network: n.id,
    path: n.path,
    sizeBytes: n.sizeBytes,
    format: n.output,
  }));
}

const server = new McpServer({ name: "cta-mcp", version: "0.1.0" });

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
      let report: Report;
      if (await isPath(source)) {
        report = await pack({ source, networks, out, validate: doValidate, options: opts });
      } else {
        const bundle = bundleFromBase64Html(source);
        if (!bundle.entryHtml.includes("<")) {
          throw new Error("`source` is neither an existing path nor valid base64 HTML.");
        }
        report = await runPack(bundle, {
          networks,
          out,
          validate: doValidate,
          options: { name: "Playable", ...opts },
        });
      }
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
      let report: Report;
      if (await isPath(source)) {
        report = await validateBuild({ source, networks, options: opts });
      } else {
        const bundle = bundleFromBase64Html(source);
        if (!bundle.entryHtml.includes("<")) {
          throw new Error("`source` is neither an existing path nor valid base64 HTML.");
        }
        report = await runPack(bundle, {
          networks,
          validate: true,
          options: { name: "Playable", ...opts },
        });
      }
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
