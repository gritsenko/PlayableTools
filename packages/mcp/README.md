# @gritsenko/cta-mcp

An [MCP](https://modelcontextprotocol.io) (Model Context Protocol) stdio server
that exposes the headless playable-ad packer to agents and IDEs. It wraps
[`@gritsenko/cta-pack`](https://www.npmjs.com/package/@gritsenko/cta-pack) — the
same engine behind the [PlayableTools](https://tools.gritsenko.biz/) `/publish`
page — so an agent can pack an already-built HTML5 playable into per-network
builds and get a machine-readable validation report. No browser, no clicks.

## Install & register

Register the stdio server in your MCP client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "cta": { "command": "npx", "args": ["-y", "@gritsenko/cta-mcp"] }
  }
}
```

Or install it and point at the binary:

```sh
npm install -g @gritsenko/cta-mcp
```

```json
{ "mcpServers": { "cta": { "command": "cta-mcp" } } }
```

## Tools

- `list_networks()` → `[{ id, output, maxBytes, notes }]`
- `pack_playable({ source, networks?, outDir?, options?, validate? })` → `{ builds, report }`
- `validate_build({ source, networks? })` → `report`

`source` is a filesystem path **or** base64-encoded HTML, so an agent can pack a
build inline or from disk. `pack_playable` validates by default.

## License

MIT
