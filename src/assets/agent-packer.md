# Headless Packer & MCP — build playables with your AI agent

The same engine behind the [Publish](/publish) page also runs **without a browser**.
It ships as three published npm packages so an AI coding agent (Claude Code,
Cursor, Copilot, …) or a CI job can pack an already‑built HTML5 playable into
per‑network builds and get a **machine‑readable validation report** — no clicks.

This is a universal **post‑build packer**, not a bundler: you feed it a finished
playable (a single `.html`, or a folder with `index.html` + relative assets) and
it produces one build per ad network plus a report of what passed and what to fix.

| Package | What it is | Use it for |
|---|---|---|
| [`@gritsenko/cta-core`](https://www.npmjs.com/package/@gritsenko/cta-core) | Browser‑free core (transforms + validation) | Embedding in your own tooling |
| [`@gritsenko/cta-pack`](https://www.npmjs.com/package/@gritsenko/cta-pack) | CLI + Node API | Terminal & CI builds |
| [`@gritsenko/cta-mcp`](https://www.npmjs.com/package/@gritsenko/cta-mcp) | MCP server (stdio) | Letting an AI agent build for you |

---

## How sizing works — read this first

Each network has its **own** size limit, and they differ a lot:

- **2 MB:** `adcolony`
- **3 MB:** `chartboost`
- **5 MB:** everyone else (`facebook`, `facebook_zip`, `google`, `unity`, `ironsource`, `applovin`, `moloco`, `mintegral`, `vungle`, `tiktok`, `liftoff`)

Validation is **per network** — a build that is too big for `adcolony` (2 MB) is
still perfectly valid for the 5 MB networks. So **target only the networks you
actually ship to**, sized to your creative's budget. Don't pull a 2 MB network in
"just in case" and then crush a 5 MB creative to fit it.

The packer's **only** size lever is `--compress imba` — a *lossless* inline loader
that never re-encodes or drops your art. If a build is still over a network's limit
*after* imba, that network simply needs a smaller creative: **drop the network, or
rebuild the creative smaller — never degrade the shared build to satisfy the
strictest target.**

## Integrate the CTA SDK in your playable (validated as `NO_CTA_HOOK`)

Before packing, the playable has to talk to the **CTA SDK** — the tiny per-network
bridge the packer injects into every build. The validator flags a missing call as
`NO_CTA_HOOK`, and a playable without it simply can't send the user to the store. If
your creative isn't wired up yet, this is the part an agent should add.

**Required — call the CTA from your Install / Play / Download button:**

```js
// inside the click handler of your CTA button:
document["CTA"]?.onClick?.();   // routes the user to the app store, on every network
```

That is exactly what `NO_CTA_HOOK` scans for — `document["CTA"].onClick()` or
`document.CTA.onClick()`, with or without `?.`. The optional chaining keeps it safe in
local dev, where `document.CTA` is `undefined` (the SDK only exists once injected).

**Store URLs are a packer flag, not game code.** The injected CTA script fills the
store target from `--android-url` / `--ios-url` (the `{{google}}` / `{{apple}}`
tokens). Missing ones show up as `MISSING_STORE_URL` (an *error* on MRAID networks like
`liftoff`, `chartboost`). Don't hard-code store links in the game — just call `onClick()`.

**Optional, when the network calls for it:**

```js
document["CTA"]?.gameReady?.();                       // ad is loaded & interactive (Mintegral)
document["CTA"]?.gameEnd?.();                          // gameplay finished (Mintegral)
document["CTA"]?.analytics?.trackEvent?.("DISPLAYED"); // Applovin analytics; safe no-op elsewhere
```

Branch on `document.CTA?.platform` / `document.CTA?.sdk` only if you need
network-specific behaviour. Full API — lifecycle, MRAID mute/unmute, analytics events,
platform table — is in the **[CTA SDK documentation](/cta-sdk)**.

## Set it up in your project (recommended)

For an npm-based playable, wire packing into `package.json` once — then every build
is a single `npm run pack`, no re-prompting:

```json
{
  "devDependencies": {
    "@gritsenko/cta-pack": "^0.1.0"
  },
  "scripts": {
    "build": "…your existing playable build…",
    "pack": "cta-pack dist --networks unity,ironsource,applovin,google --out builds --validate --report pretty"
  }
}
```

```bash
npm install -D @gritsenko/cta-pack
npm run build && npm run pack
```

Tune the `pack` script to your project: list only the networks you ship to, add
`--compress imba` if a target needs it, and `--android-url … --ios-url …` for MRAID
networks (`liftoff`, `chartboost`). Installed as a dependency, `cta-pack` resolves
from your local `node_modules` — no `npx` needed inside the script.

---

## ⭐ Copy this prompt into your agent

Prefer the **setup prompt**: it wires the `pack` script into your project once (so
future builds are just `npm run pack`) and encodes the sizing rules above, so the
agent won't degrade your creative to satisfy a stricter network.

### Prompt — set up packing in my project (recommended)

```text
Set up repeatable ad-network packing for my HTML5 playable using @gritsenko/cta-pack.

1. Add it to devDependencies:  npm install -D @gritsenko/cta-pack
2. Make sure the playable is wired to the CTA SDK: the Install/Play button must call
   document["CTA"]?.onClick?.() (this is exactly what the packer's NO_CTA_HOOK check looks
   for). If it's missing, add it in the button's click handler. Do NOT hard-code store URLs
   in the game — the packer injects them (step 4). Optionally call document["CTA"]?.gameReady?.()
   when interactive and document["CTA"]?.gameEnd?.() when gameplay ends (Mintegral).
3. Find my build output dir (e.g. ./dist) and confirm the networks I ship to. Each network
   has its OWN size limit — run `npx @gritsenko/cta-pack --list-networks` (adcolony 2 MB,
   chartboost 3 MB, the rest 5 MB incl. facebook). Pick ONLY networks that fit my creative's
   size budget; ask me if unsure.
4. Add an npm script:
     "pack": "cta-pack <buildDir> --networks <list> --out builds --validate --report pretty"
   Add --android-url/--ios-url for MRAID networks (liftoff, chartboost).
5. Run `npm run pack` and read the report. Validation is PER network. Fix only lossless
   issues and re-run: NO_CTA_HOOK (see step 2), MISSING_STORE_URL (add store URLs),
   EXTERNAL_SCRIPT/BLOCKED_API (inline/remove), and SIZE_EXCEEDED via `--compress imba`
   (lossless — the ONLY size lever this tool has).
6. If a build is STILL over a network's limit after --compress imba, STOP. Do NOT shrink,
   re-encode, or drop my assets to force a fit. Tell me which networks don't fit and by how
   much, and ask whether to drop those networks or rebuild the creative smaller.
```

### Prompt — one-off build (no project changes)

```text
Package my HTML5 playable for ad networks using the headless tool @gritsenko/cta-pack.
Built playable: ./dist  (a single .html file, or a folder with index.html + relative assets).
Networks I ship to: <list only the networks you actually target — see their size limits>.

Run: npx -y @gritsenko/cta-pack ./dist --networks <list> --out ./builds --validate --report json
Sizes are checked PER network, so a build over one network's limit is fine for the others.
Fix only lossless issues and re-run: MISSING_STORE_URL (--android-url/--ios-url),
NO_CTA_HOOK (call document["CTA"]?.onClick?.()), EXTERNAL_SCRIPT/BLOCKED_API, and
SIZE_EXCEEDED via --compress imba (lossless).
If a build is still over a limit AFTER --compress imba, do NOT degrade my assets to fit —
report which networks don't fit and ask whether to drop them or rebuild the creative smaller.
```

### Prompt — MCP (for agents with MCP support)

First register the server (see the **MCP setup** section below), then paste:

```text
Use the "cta" MCP server (@gritsenko/cta-mcp) to package my HTML5 playable.
Call list_networks, then pack_playable({ source: "./dist", networks: [<networks I ship to>],
outDir: "./builds", validate: true }). Sizes are PER network — a build over one network's
limit is still valid for the others, so target only the networks I actually ship to.
Fix only lossless issues and call pack_playable again:
  - MISSING_STORE_URL -> options.storeUrls: { android: "<play-url>", ios: "<appstore-url>" }
  - NO_CTA_HOOK       -> make the CTA button call document["CTA"].onClick()
  - SIZE_EXCEEDED      -> options.compress: "imba"  (lossless — the only size lever)
If a build is still over a network's limit after compress:"imba", STOP and ask me whether to
drop those networks or rebuild the creative smaller — do NOT degrade the assets to force a fit.
```

---

## MCP setup

Register the stdio server in your MCP client. This works from any directory —
`npx` fetches the published package on first use:

```json
{
  "mcpServers": {
    "cta": { "command": "npx", "args": ["-y", "@gritsenko/cta-mcp"] }
  }
}
```

For **Claude Code**, one command does it:

```bash
claude mcp add cta -- npx -y @gritsenko/cta-mcp
```

### MCP tools

- `list_networks()` → `[{ id, output, maxBytes, notes }]`
- `pack_playable({ source, networks?, outDir?, validate?, options? })` → `{ builds, report }` (validates by default)
- `validate_build({ source, networks?, options? })` → `report` (no files written)

`source` is a filesystem path **or** base64‑encoded HTML, so an agent can pack a
build from disk or inline. `options` accepts `{ name, suffix, compress: "none"|"imba", storeUrls: { android, ios } }`.

---

## CLI reference

```bash
npx -y @gritsenko/cta-pack <source> [options]
```

| Option | Meaning |
|---|---|
| `<source>` | Folder (`index.html` + assets) or a single `.html` file |
| `--networks a,b,c` | Comma list of network ids/names (omit for all) |
| `--out <dir>` | Output directory (default `./builds`) |
| `--validate` | Run per‑network checks; include issues in the report |
| `--report pretty\|json` | Report format (default `pretty`) |
| `--compress imba` | Inline a pako‑compressed loader to shrink the entry HTML |
| `--android-url` / `--ios-url` | Fill the `{{google}}` / `{{apple}}` store tokens |
| `--name` / `--suffix` | Output file naming (default: source name / `EN`) |
| `--list-networks` | Print supported networks and exit |

**Exit codes:** `0` ok · `2` built but validation failed · `1` fatal error. This
makes it drop‑in for CI — fail the pipeline on a non‑zero exit.

---

## Report contract

Both the CLI (`--report json`) and the MCP tools return the same shape:

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

---

## Supported networks

| id | output | max size |
|---|---|---|
| `facebook` | single‑html | 5 MB |
| `moloco` | single‑html | 5 MB |
| `ironsource` | single‑html | 5 MB |
| `adcolony` | single‑html | 2 MB |
| `unity` | single‑html | 5 MB |
| `applovin` | single‑html | 5 MB |
| `liftoff` | single‑html | 5 MB |
| `chartboost` | single‑html | 3 MB |
| `facebook_zip` | zip | 5 MB |
| `mintegral` | zip | 5 MB |
| `vungle` | zip | 5 MB |
| `tiktok` | zip | 5 MB |
| `google` | zip | 5 MB |

The network registry is shared by the web app, the CLI, and the MCP server — see
[`packages/core/src/networks.ts`](https://github.com/gritsenko/PlayableTools/blob/main/packages/core/src/networks.ts).
Run `npx -y @gritsenko/cta-pack --list-networks` for the live list.

For how the playable itself should call the store / signal game events, see the
[CTA SDK documentation](/cta-sdk).
