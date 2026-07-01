# @gritsenko/cta-pack

Headless **CLI + Node API** for packing HTML5 playable ads for ad networks — a
universal **post-build packer** with per-network validation. Feed it an
already-built playable (a single `.html` or a folder with `index.html` +
relative assets) and it produces per-network builds plus a machine-readable
validation report. No browser, no clicks.

Built on [`@gritsenko/cta-core`](https://www.npmjs.com/package/@gritsenko/cta-core),
the same engine behind the [PlayableTools](https://tools.gritsenko.biz/)
`/publish` page.

## Install

```sh
npm install -g @gritsenko/cta-pack   # or: npx @gritsenko/cta-pack ...
```

## CLI

```sh
cta-pack <source> --networks facebook,google,unity --out ./builds --validate --report json
```

- `<source>` — a folder (entry `index.html` + relative assets) or a single `.html` file.
- `--networks a,b,c` — comma list of network ids (omit for all). `--list-networks` prints them.
- `--validate` — run per-network checks; pair with `--report json` or `--report pretty`.
- `--compress imba` — inline a pako-compressed loader to shrink the entry HTML.
- `--android-url` / `--ios-url` — fill the `{{google}}` / `{{apple}}` store tokens.
- `--name` / `--suffix` — output file naming (default: source name / `EN`).
- **Exit codes:** `0` ok · `2` built but validation failed · `1` fatal error.

Builds land in `builds/<network>/`.

## Node API

```ts
import { packPlayable, validateBuild } from "@gritsenko/cta-pack";

const { builds, report } = await packPlayable({
  source: "./dist",
  networks: ["facebook", "google"],
  outDir: "./builds",
  validate: true,
});
```

## Report contract

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

Issue codes: `SIZE_EXCEEDED`, `MISSING_STORE_URL`, `NO_CTA_HOOK`, `EXTERNAL_SCRIPT`, `BLOCKED_API`, `MISSING_DOCTYPE`, `INVALID_HTML`.

## License

MIT
