
import { defineConfig } from "vite";
import rewriteBaseHrefPlugin from "./vite-plugin-rewrite-base-href";
import string from "vite-plugin-string";
import { VitePWA } from "vite-plugin-pwa";
import yandexMetrikaPlugin from "./vite-plugin-yandex-metrika";
import viteVersionPlugin from "./vite-plugin-version";
import { readFileSync } from "fs";
// Use manifest path string instead of importing
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/PlayableTools/",
  resolve: {
    alias: {
      fw: resolve(__dirname, "src/fw"),
    },
  },
  plugins: [
    string({ include: ["**/*.md"], compress: false }),
    rewriteBaseHrefPlugin(),
    yandexMetrikaPlugin(),
    viteVersionPlugin({
      version: packageJson.version
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Playable Ads Tools",
        short_name: "PlayableTools",
        start_url: "/PlayableTools/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        description: "Open-source tools for HTML5 playable ads developers.",
        icons: [
          {
            src: "/PlayableTools/playable-tools.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "/PlayableTools/playable-tools.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      },
      includeAssets: ["playable-tools.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        // Exclude version.json from caching to ensure fresh checks
        globIgnores: ["**/version.json"],
        runtimeCaching: [
          {
            // Ensure version.json is never cached
            urlPattern: /\/version\.json$/,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: {
        enabled: command === "serve"
      }
    })
  ],
}));
