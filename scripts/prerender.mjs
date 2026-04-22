import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(rootDir, "src", "seo", "route-manifest.json");
const siteOrigin = (process.env.SEO_SITE_ORIGIN || "https://tools.gritsenko.biz").replace(/\/$/, "");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webmanifest", "application/manifest+json"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function readManifest() {
  const content = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(content);
}

async function createStaticServer() {
  const indexHtml = await fs.readFile(path.join(distDir, "index.html"));

  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
      const normalizedPath = decodeURIComponent(requestUrl.pathname);
      let filePath = path.join(distDir, normalizedPath);

      if (normalizedPath.endsWith("/")) {
        filePath = path.join(filePath, "index.html");
      }

      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, "index.html");
        }

        const data = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": mimeTypes.get(ext) || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(data);
        return;
      } catch {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(indexHtml);
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(error instanceof Error ? error.message : "Unknown server error");
    }
  });

  const port = await new Promise((resolve, reject) => {
    const handleError = (error) => reject(error);
    server.once("error", handleError);

    server.listen(0, "127.0.0.1", () => {
      server.off("error", handleError);
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to determine prerender server port."));
        return;
      }
      resolve(address.port);
    });
  });

  return { server, port };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writePrerenderedHtml(routePath, html) {
  const normalizedHtml = html.trimStart().toLowerCase().startsWith("<!doctype")
    ? html
    : `<!doctype html>\n${html}`;

  if (routePath === "/") {
    await fs.writeFile(path.join(distDir, "index.html"), normalizedHtml, "utf8");
    return;
  }

  const outputDir = path.join(distDir, routePath.replace(/^\/+/, ""));
  await ensureDir(outputDir);
  await fs.writeFile(path.join(outputDir, "index.html"), normalizedHtml, "utf8");
}

function buildSitemap(routes) {
  const urls = routes.map((route) => {
    const url = `${siteOrigin}${route.canonicalPath || route.routePath}`;
    return `  <url>\n    <loc>${url}</loc>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

async function main() {
  const manifest = await readManifest();
  const prerenderRoutes = manifest.filter((entry) => entry.indexable && entry.prerender);
  const browserExecutable = resolveBrowserExecutable();

  if (!browserExecutable) {
    throw new Error(
      "Could not find a Chromium-based browser for prerender. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH or CHROME_BIN."
    );
  }

  const { server, port } = await createStaticServer();
  const browser = await chromium.launch({
    executablePath: browserExecutable,
    headless: true,
  });

  try {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const page = await context.newPage();

    for (const route of prerenderRoutes) {
      const url = `http://127.0.0.1:${port}${route.routePath}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForFunction(() => {
        const description = document.head.querySelector('meta[name="description"]');
        const robots = document.head.querySelector('meta[name="robots"]');
        const canonical = document.head.querySelector('link[rel="canonical"]');
        return (
          document.title.trim().length > 0 &&
          !!description &&
          !!robots &&
          !!canonical &&
          document.body.innerText.trim().length > 120
        );
      }, undefined, { timeout: 30000 });

      const html = await page.content();
      await writePrerenderedHtml(route.routePath, html);
    }

    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }

  await fs.copyFile(path.join(distDir, "index.html"), path.join(distDir, "404.html"));
  await fs.writeFile(path.join(distDir, "sitemap.xml"), buildSitemap(prerenderRoutes), "utf8");
  await fs.writeFile(
    path.join(distDir, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
