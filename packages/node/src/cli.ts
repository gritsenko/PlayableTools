#!/usr/bin/env node
// cta-pack — headless CLI for packing HTML5 playables for ad networks.
import { parseArgs } from "node:util";
import { getNetworks } from "@gritsenko/cta-core";
import type { CompressMode, Report } from "@gritsenko/cta-core";
import { pack } from "./api.js";

const HELP = `cta-pack — post-build packer for HTML5 playable ads

Usage:
  cta-pack <source> [options]

Arguments:
  <source>                 Folder (entry index.html + assets) or a single .html file

Options:
  --networks <a,b,c>       Comma-separated network ids or names (default: all)
  --out <dir>              Output directory (default: ./builds)
  --validate               Run per-network validation and include issues
  --report <pretty|json>   Report format (default: pretty)
  --compress <imba>        Compress the entry HTML (imba inline loader)
  --name <name>            Playable name for output file naming (default: from source)
  --suffix <suffix>        Locale/variant suffix (default: EN)
  --android-url <url>      Google Play URL ({{google}} token)
  --ios-url <url>          App Store URL ({{apple}} token)
  --list-networks          Print the supported networks and exit
  -h, --help               Show this help

Exit codes: 0 ok · 2 built but validation failed · 1 fatal error`;

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${bytes}B`;
}

function printPretty(report: Report): void {
  for (const network of report.networks) {
    const status = network.ok ? "OK " : "ERR";
    const where = network.path ? `  ${network.path}` : "";
    console.log(
      `[${status}] ${network.id.padEnd(13)} ${network.output.padEnd(11)} ${humanBytes(
        network.sizeBytes
      ).padStart(9)}${where}`
    );
    for (const issue of network.issues ?? []) {
      const nums =
        issue.limit !== undefined && issue.actual !== undefined
          ? ` (limit ${humanBytes(issue.limit)}, actual ${humanBytes(issue.actual)})`
          : "";
      console.log(`        ${issue.level.toUpperCase()} ${issue.code}${nums} — ${issue.hint}`);
    }
  }
  console.log(report.ok ? "\nAll networks OK." : "\nValidation reported errors.");
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      networks: { type: "string" },
      out: { type: "string", default: "builds" },
      validate: { type: "boolean", default: false },
      report: { type: "string", default: "pretty" },
      compress: { type: "string" },
      name: { type: "string" },
      suffix: { type: "string" },
      "android-url": { type: "string" },
      "ios-url": { type: "string" },
      "list-networks": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(HELP);
    return 0;
  }

  if (values["list-networks"]) {
    for (const network of getNetworks()) {
      console.log(
        `${network.id.padEnd(13)} ${network.output.padEnd(11)} max ${humanBytes(
          network.constraints.maxBytes ?? 0
        ).padStart(8)}  ${network.notes ?? ""}`
      );
    }
    return 0;
  }

  const source = positionals[0];
  if (!source) {
    console.error("Error: missing <source>.\n");
    console.error(HELP);
    return 1;
  }

  if (values.compress && values.compress !== "imba" && values.compress !== "none") {
    console.error(`Error: --compress must be "imba" or "none" (got "${values.compress}").`);
    return 1;
  }

  const networks = values.networks
    ? values.networks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const report = await pack({
    source,
    networks,
    out: values.out,
    validate: values.validate,
    options: {
      name: values.name,
      suffix: values.suffix,
      storeUrls: { android: values["android-url"], ios: values["ios-url"] },
      compress: (values.compress as CompressMode | undefined) ?? "none",
    },
  });

  if (values.report === "json") {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    printPretty(report);
  }

  // 0 = ok; 2 = built but validation failed.
  return report.ok ? 0 : 2;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(`Fatal: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
