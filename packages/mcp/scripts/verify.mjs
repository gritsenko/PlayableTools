// MCP smoke test: spawns the built server over stdio and exercises the 3 tools.
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(pkgDir, "..", "..");

let failures = 0;
function check(name, cond, detail = "") {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${cond ? "" : ` — ${detail}`}`);
  if (!cond) failures++;
}

function parse(result) {
  if (result.isError) throw new Error(`tool error: ${result.content?.[0]?.text}`);
  return JSON.parse(result.content[0].text);
}

async function main() {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), "cta-mcp-"));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(pkgDir, "dist", "server.js")],
    cwd: repoRoot,
  });
  const client = new Client({ name: "cta-mcp-verify", version: "0.0.0" });
  await client.connect(transport);

  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  console.log(`tools: ${tools.join(", ")}`);
  check("3 tools registered", tools.length === 3);
  check("has list_networks/pack_playable/validate_build",
    ["list_networks", "pack_playable", "validate_build"].every((t) => tools.includes(t)));

  // list_networks
  const networks = parse(await client.callTool({ name: "list_networks", arguments: {} }));
  check("list_networks returns 13", networks.length === 13, String(networks.length));
  check("network entry has id/output/maxBytes", !!networks[0].id && !!networks[0].output && !!networks[0].maxBytes);

  // pack_playable (path source) -> builds + report, exit-0 equivalent
  const packed = parse(await client.callTool({
    name: "pack_playable",
    arguments: {
      source: "test-playable.html",
      networks: ["facebook", "google"],
      outDir: path.join(out, "p"),
      validate: true,
      options: { storeUrls: { android: "https://play.google.com/x", ios: "https://apps.apple.com/x" } },
    },
  }));
  check("pack_playable builds has 2 entries", packed.builds.length === 2, JSON.stringify(packed.builds));
  check("pack_playable report.ok", packed.report.ok === true);
  check("pack_playable builds carry network/path/sizeBytes/format",
    packed.builds.every((b) => b.network && b.path && b.sizeBytes > 0 && b.format));
  for (const b of packed.builds) {
    const onDisk = await fs.stat(b.path).then((s) => s.isFile()).catch(() => false);
    check(`pack_playable wrote ${b.network}`, onDisk, b.path);
  }

  // pack_playable (base64 source)
  const html = "<!DOCTYPE html><html><head><title>b64</title></head><body><button onclick=\"document.CTA.onClick()\">go</button></body></html>";
  const b64 = Buffer.from(html, "utf8").toString("base64");
  const packedB64 = parse(await client.callTool({
    name: "pack_playable",
    arguments: { source: b64, networks: ["facebook"], outDir: path.join(out, "b64"), validate: true },
  }));
  check("pack_playable base64 ok", packedB64.report.ok === true && packedB64.builds.length === 1, JSON.stringify(packedB64.report));
  check("pack_playable base64 no NO_CTA_HOOK (html has hook)",
    !(packedB64.report.networks[0].issues ?? []).some((i) => i.code === "NO_CTA_HOOK"));

  // validate_build (mraid w/o store urls) -> ok false, MISSING_STORE_URL error, no writes
  const validated = parse(await client.callTool({
    name: "validate_build",
    arguments: { source: "public/test-simple-playable.html", networks: ["liftoff", "google"] },
  }));
  check("validate_build report.ok false", validated.ok === false);
  const liftoff = validated.networks.find((n) => n.id === "liftoff");
  check("validate_build liftoff MISSING_STORE_URL error",
    (liftoff.issues ?? []).some((i) => i.code === "MISSING_STORE_URL" && i.level === "error"));
  check("validate_build does not write paths", validated.networks.every((n) => n.path === undefined));

  await client.close();
  await fs.rm(out, { recursive: true, force: true });
  console.log(`\n${failures === 0 ? "ALL MCP CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
