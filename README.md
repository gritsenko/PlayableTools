# <img src="./media/small-logo.jpg" width="28" style="border-radius:16px;"/> PlayableTools

PlayableTools is a web-based toolkit for preparing and publishing HTML5 playable ads across multiple ad platforms. It's a developer-focused single-page app built with Vite, TypeScript and Lit web components and packaged as a Progressive Web App for easy local testing and offline use.

Quick link: https://gritsenko.biz/PlayableTools/
<p align="center">
	<a href="https://gritsenko.biz/PlayableTools/"><img src="./media/pwa.png" width="200" alt="PWA Badge"/></a>
</p>

## Screenshots

<p align="center">
	<img src="media/app-screenshots/previewer.jpg" alt="Playable Previewer Screenshot" width="600"/>
</p>

<p align="center">
	<img src="media/app-screenshots/base64.png" alt="Base64 Converter Screenshot" width="600"/>
</p>

## What this repo provides
- A Vite + TypeScript app using Lit components (light DOM) and a small in-repo framework under `src/fw/`.
- Tools for: converting files to Base64, compressing HTML (Imba-style packing), and publishing/playable packaging per platform rules.
- PWA support (service worker + version checking) and example test files under `public/`.

## Tech stack
- Vite (dev server & build)
- TypeScript (strict)
- Lit for web components
- Pico.css for lightweight styling
- Small in-repo framework in `src/fw/` for DI and routing
- JSZip + Pako (used at runtime for ZIP/deflate tasks)

## Main features
- Upload or drag-and-drop an HTML playable file and related assets
- Configure metadata (title, store URLs, optional suffix)
- Publish for multiple ad platforms with platform-specific transforms (single HTML outputs or ZIP packages)
- Progress reporting per-platform and per-step
- Preview playable in-browser and quick export/download of generated artifacts

## Supported / included platforms (current)
The app contains platform adapters and packaging scripts for a number of common ad networks. Current adapters in the repo include (non-exhaustive):

- Facebook (single HTML)
- Facebook ZIP variant
- Google (ZIP with multi-size variants)
- Moloco
- Mintegral
- IronSource
- AdColony
- Unity
- Applovin
- Vungle
- TikTok

Note: Some platforms require extra configuration or platform-specific assets; check the `src/pages/publish` UI for details and platform options.

## File naming convention
By default outputs are named like: {PlayableTitle}_{Platform}_{Suffix}.{html|zip}

## Run locally
1. Install dependencies

```powershell
npm install
```

2. Start dev server (Vite)

```powershell
npm run dev
```

3. Open http://localhost:5173/ (or the URL shown by Vite). The app supports installing as a PWA and will show a version/update prompt when a new build is available (see `src/fw/version-checker.ts`).

## Quick test files
- `public/test-playable.html` — a simple playable to exercise the publisher
- `public/test-simple-playable.html` — minimal example
- `test-facebook-validator.html` — helper for validating Facebook output

## ZIP preview flow
- The Preview page now accepts `.zip` packages that contain an `index.html` (or any `.html`) entry point plus relative assets (JS, CSS, images, audio, video, JSON, etc.).
- When you upload a ZIP, PlayableTools extracts the archive in-memory and passes every file to a dedicated service worker (`/zip-preview-sw.js`). The playable itself runs at a virtual URL like `/zip-preview/<session-id>/index.html`, so all relative asset requests resolve exactly as they would inside the exported ZIP.
- This approach means scripts that perform `fetch()`/XHR/file loads by relative path continue to work without any code changes. It also avoids blob: URIs entirely, so browser devtools show real URLs for debugging.
- To verify locally: run `npm run dev`, open the Preview page, upload a playable ZIP, and confirm the iframe src switches to `/zip-preview/...`. Clearing the preview or uploading a new file tears down the previous session and its assets automatically.


<p align="center">
	<a href="https://gritsenko.biz/PlayableTools/"><img src="./media/pwa.png" width="200" alt="PWA Badge"/></a>
</p>

## Developer notes
- Project conventions and small framework are documented in `.github/copilot-instructions.md` (component patterns, DI, routing). Keep components under `src/pages/` and services under `src/services/`.
- Service worker and version checking live under `src/sw-version-handler.js` and `src/fw/version-checker.ts`.
- To add a platform adapter, follow existing `publish` page adapters and leverage `PlayablePublishService`.

## Contributing
Contributions welcome. Open an issue or PR outlining the change and tests or sample assets where applicable.

## License
MIT
