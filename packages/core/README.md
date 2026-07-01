# @gritsenko/cta-core

Headless, browser-free core for packing HTML5 playable ads for ad networks:
per-network transforms + validation. This is the same engine behind the
[PlayableTools](https://tools.gritsenko.biz/) `/publish` page, extracted so it
can run in Node, CI, or an agent — no browser, no DOM.

It is a universal **post-build packer**, not a bundler: feed it an
already-built playable and it produces per-network builds plus a
machine-readable validation report.

## Install

```sh
npm install @gritsenko/cta-core
```

## Usage

```ts
import { listNetworks, pack, validate } from "@gritsenko/cta-core";

const networks = listNetworks(); // [{ id, output, maxBytes, notes }]

const result = await pack(html, {
  networks: ["facebook", "google", "unity"],
  validate: true,
});
```

The package ships pure functions over in-memory HTML/asset data. For a CLI or a
filesystem-oriented Node API, use [`@gritsenko/cta-pack`](https://www.npmjs.com/package/@gritsenko/cta-pack);
for an MCP server, use [`@gritsenko/cta-mcp`](https://www.npmjs.com/package/@gritsenko/cta-mcp).

## Supported networks

- **single-html:** `facebook` 5MB · `moloco` 5MB · `ironsource` 5MB · `adcolony` 2MB · `unity` 5MB · `applovin` 5MB · `liftoff` 5MB · `chartboost` 3MB
- **zip:** `facebook_zip` 5MB · `mintegral` 5MB · `vungle` 5MB · `tiktok` 5MB · `google` 5MB

The network registry lives in `src/networks.ts` and is the single source of
truth shared by the web app, CLI, and MCP server.

## License

MIT
