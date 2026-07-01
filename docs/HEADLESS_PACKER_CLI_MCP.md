# Headless Packer — Core, CLI & MCP

## Overview

The packing engine behind the web `/publish` page is also available **without a
browser**, published as three npm packages so it can run in Node, CI, or an AI
coding agent:

| Package | Path | Role |
|---|---|---|
| [`@gritsenko/cta-core`](https://www.npmjs.com/package/@gritsenko/cta-core) | [`packages/core`](../packages/core) | Browser-free core: per-network transforms + validation, over in-memory HTML/asset data |
| [`@gritsenko/cta-pack`](https://www.npmjs.com/package/@gritsenko/cta-pack) | [`packages/node`](../packages/node) | Node adapter: filesystem I/O, a CLI (`cta-pack`), and a programmatic API |
| [`@gritsenko/cta-mcp`](https://www.npmjs.com/package/@gritsenko/cta-mcp) | [`packages/mcp`](../packages/mcp) | Thin MCP stdio server wrapping `cta-pack`; three tools for agents |

This is a universal **post-build packer**, not a bundler. Input is an
already-built playable — a single `.html`, or a folder with `index.html` +
relative assets. Output is one build per ad network plus a machine-readable
validation report. The network registry in
[`packages/core/src/networks.ts`](../packages/core/src/networks.ts) is the single
source of truth shared by the web app, CLI, and MCP server.

The web app consumes `@gritsenko/cta-core` as a workspace dependency; the root
`build:packages` script builds it before the Vite build. `build:tools` builds all
three packages and `verify:tools` builds them and runs the DoD verification
scripts (`packages/*/scripts/verify.mjs`).

## Publishing

All three are published to the public npm registry under the `@gritsenko` scope
(MIT). Each declares `publishConfig.access: "public"`, and inter-package deps are
pinned to `^0.1.0` so consumers resolve the sibling packages correctly. Publish
in dependency order — core → pack → mcp:

```bash
npm publish -w @gritsenko/cta-core
npm publish -w @gritsenko/cta-pack
npm publish -w @gritsenko/cta-mcp
```

> Local-dev note: because the packages are npm workspaces, the `cta-pack` /
> `cta-mcp` bin shims live in the repo's `node_modules/.bin`. If `npx` inside the
> repo reports `'cta-mcp' is not recognized`, re-run `npm install` at the root to
> regenerate the workspace bin shims.

## CLI — `cta-pack`

Implemented in [`packages/node/src/cli.ts`](../packages/node/src/cli.ts) on top of
the Node API in [`packages/node/src/api.ts`](../packages/node/src/api.ts).

```bash
npx -y @gritsenko/cta-pack <source> [options]
```

| Option | Meaning |
|---|---|
| `<source>` | Folder (`index.html` + assets) or a single `.html` file |
| `--networks <a,b,c>` | Comma-separated network ids/names (default: all) |
| `--out <dir>` | Output directory (default: `builds`) |
| `--validate` | Run per-network validation and include issues |
| `--report <pretty\|json>` | Report format (default: `pretty`) |
| `--compress <imba>` | Inline a pako-compressed loader to shrink the entry HTML |
| `--name <name>` | Playable name for output file naming (default: from source) |
| `--suffix <suffix>` | Locale/variant suffix (default: `EN`) |
| `--android-url <url>` | Google Play URL (`{{google}}` token) |
| `--ios-url <url>` | App Store URL (`{{apple}}` token) |
| `--list-networks` | Print supported networks and exit |
| `-h`, `--help` | Show help |

**Exit codes:** `0` ok · `2` built but validation failed · `1` fatal error —
suitable for gating a CI pipeline.

Example:

```bash
npx -y @gritsenko/cta-pack ./dist \
  --networks facebook,google,unity \
  --out ./builds --validate --report json \
  --android-url "https://play.google.com/store/apps/details?id=..." \
  --ios-url "https://apps.apple.com/app/id..."
```

Builds land in `builds/<network>/`.

## MCP server — `cta-mcp`

Implemented in [`packages/mcp/src/server.ts`](../packages/mcp/src/server.ts) using
`@modelcontextprotocol/sdk` over `StdioServerTransport`. Registers three tools.

Register the server in an MCP client (works from any directory):

```json
{
  "mcpServers": {
    "cta": { "command": "npx", "args": ["-y", "@gritsenko/cta-mcp"] }
  }
}
```

For Claude Code: `claude mcp add cta -- npx -y @gritsenko/cta-mcp`.

### Tools

- **`list_networks()`** → `[{ id, output, maxBytes, notes }]`
- **`pack_playable({ source, networks?, outDir?, validate?, options? })`** → `{ builds, report }`
  - `validate` defaults to `true`.
  - Returns `builds` (`[{ network, path, sizeBytes, format }]`) plus the full `report`.
- **`validate_build({ source, networks?, options? })`** → `report` (no files written)

`source` is a filesystem path **or** base64-encoded HTML. Source resolution is
strict (`resolveSource`): raw HTML is rejected with a hint to base64-encode it,
and non-base64 garbage is rejected rather than silently decoded.

`options` schema:

```ts
{
  name?: string;
  suffix?: string;
  compress?: "none" | "imba";
  imbaEncoding?: "base64" | "base122";
  storeUrls?: { android?: string; ios?: string };
}
```

> The MCP `options.storeUrls.{android,ios}` map to the CLI's
> `--android-url` / `--ios-url`, and `options.compress` maps to `--compress`.

## Report contract

Shared by the CLI (`--report json`) and both MCP tools:

```json
{
  "ok": false,
  "networks": [
    { "id": "google", "ok": true, "output": "zip", "path": "builds/google/Game_Google_EN.zip", "sizeBytes": 1803 },
    { "id": "adcolony", "ok": false, "output": "single-html", "path": "builds/adcolony/Game_AdColony_EN.html", "sizeBytes": 5610000,
      "issues": [
        { "code": "SIZE_EXCEEDED", "level": "error", "limit": 2097152, "actual": 5610000,
          "hint": "compress=imba or reduce inlined assets by ~3.4MB" }
      ] }
  ]
}
```

**Issue codes:** `SIZE_EXCEEDED`, `MISSING_STORE_URL`, `NO_CTA_HOOK`,
`EXTERNAL_SCRIPT`, `BLOCKED_API`, `MISSING_DOCTYPE`, `INVALID_HTML`.

## Supported networks

`single-html`: `facebook` 5MB · `moloco` 5MB · `ironsource` 5MB · `adcolony` 2MB ·
`unity` 5MB · `applovin` 5MB · `liftoff` 5MB · `chartboost` 3MB

`zip`: `facebook_zip` 5MB · `mintegral` 5MB · `vungle` 5MB · `tiktok` 5MB ·
`google` 5MB

Run `npx -y @gritsenko/cta-pack --list-networks` for the live list.

## Sizing & the non-destructive rule

Size limits are **per network** (2–5 MB) and validation is per network, so a build
that exceeds one network's limit is still valid for the others. Two consequences
worth encoding into any automation:

- **Target only the networks you actually ship to.** Mixing a stricter-limit network
  (`adcolony` 2 MB, `chartboost` 3 MB) into a target list for a 5 MB creative makes
  `report.ok` false and tempts an agent to over-optimize the whole build.
- **The packer's only size lever is `--compress imba` — a lossless inline loader.**
  It never re-encodes or drops art. If a build is still over a network's limit
  *after* imba, that network needs a smaller creative. The correct move is to **drop
  the network or rebuild the creative smaller — not to degrade the shared build.**
  Reducing/re-encoding assets is a creative decision, out of scope for a post-build
  packer, and an agent should stop and ask rather than do it silently.

## Recommended workflow — an npm script, not ad-hoc prompts

For an npm-based playable, add `@gritsenko/cta-pack` as a devDependency and wire a
`pack` script once, so every build is a single `npm run pack`:

```json
{
  "devDependencies": { "@gritsenko/cta-pack": "^0.1.0" },
  "scripts": {
    "pack": "cta-pack dist --networks unity,ironsource,applovin,google --out builds --validate --report pretty"
  }
}
```

Installed as a dependency, `cta-pack` resolves from local `node_modules` (no `npx`
inside the script). Add `--compress imba` / `--android-url` / `--ios-url` as the
targeted networks require. The non-zero exit code (`2` on validation failure) makes
`npm run pack` fail CI when a targeted network doesn't pass.

## Driving it with an AI agent

The website mirror of this guide lives at [`/headless-packer`](https://tools.gritsenko.biz/headless-packer)
(source: [`src/assets/agent-packer.md`](../src/assets/agent-packer.md) +
[`src/pages/agent-packer-page.ts`](../src/pages/agent-packer-page.ts)) and includes
copy-paste prompts. The recommended prompt has the agent perform **one-time setup**
(add the devDependency + `pack` script for the networks the project ships to) rather
than re-deriving a build each time.

**Prerequisite — CTA SDK integration.** The playable must call the CTA SDK:
`document["CTA"].onClick()` (or `document.CTA.onClick()`, with/without `?.`) in the
CTA/Install button handler. This is exactly what `NO_CTA_HOOK` scans the source for, and
without it the ad can't route to the store. Store URLs are **packer flags**
(`--android-url` / `--ios-url` → `{{google}}`/`{{apple}}` tokens), not game code — surfaced
as `MISSING_STORE_URL`. If the hook is missing the agent should add it before packing; see
[CTA SDK integration](../src/assets/cta-sdk.md) for the full API (lifecycle `gameReady`/
`gameEnd`, Applovin analytics, MRAID mute/unmute, platform detection).

The loop it should run:

1. Pack + `validate` for the **targeted** networks only.
2. Read the per-network report and apply **lossless** fixes: `MISSING_STORE_URL` →
   `storeUrls`; `NO_CTA_HOOK` → call `document["CTA"].onClick()`;
   `EXTERNAL_SCRIPT`/`BLOCKED_API` → inline/remove; `SIZE_EXCEEDED` → `compress: "imba"`.
3. If a build is still over a network's limit after imba, **stop and ask** whether to
   drop that network or rebuild the creative smaller — never degrade assets to force a fit.

See also [CTA SDK integration](../src/assets/cta-sdk.md) for how the playable
itself should trigger the store and signal game events.
