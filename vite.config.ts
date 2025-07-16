import { defineConfig } from "vite";
import string from "vite-plugin-string";
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
  plugins: [string({ include: ["**/*.md"], compress: false })],
}));
