import { defineConfig } from "vite";
import string from "vite-plugin-string";
import { VitePWA } from "vite-plugin-pwa";
// Use manifest path string instead of importing
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/PlayableTools/",
  resolve: {
    alias: {
      fw: resolve(__dirname, "src/fw"),
    },
  },
  plugins: [
    string({ include: ["**/*.md"], compress: false }),
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
            src: "/PlayableTools/vite.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "/PlayableTools/vite.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      },
      includeAssets: ["vite.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"]
      },
      devOptions: {
        enabled: command === "serve"
      }
    })
  ],
}));
