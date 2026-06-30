// Core smoke test: packs the repo test playables through every network adapter
// and asserts the transforms + validation. Run after `npm run build -w @gritsenko/cta-core`.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import {
  getNetworks,
  packForNetwork,
  validateArtifact,
  getNetworkConfig,
} from "../dist/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

let failures = 0;
function check(name, cond, detail = "") {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const td = new TextDecoder();

async function zipMembers(bytes) {
  const zip = await JSZip.loadAsync(bytes);
  return Object.keys(zip.files);
}

async function main() {
  const entryHtml = await fs.readFile(path.join(repoRoot, "test-playable.html"), "utf8");
  const bundle = { entryHtml, assets: [] };
  const opts = {
    name: "MyGame",
    suffix: "EN",
    storeUrls: { android: "https://play.google.com/x", ios: "https://apps.apple.com/x" },
  };

  console.log(`Networks: ${getNetworks().map((n) => n.id).join(", ")}`);
  check("13 networks registered", getNetworks().length === 13, `got ${getNetworks().length}`);

  for (const adapter of getNetworks()) {
    console.log(`\n[${adapter.id}] output=${adapter.output} maxBytes=${adapter.constraints.maxBytes}`);
    const art = await packForNetwork(bundle, adapter.id, opts);
    check("packs to expected output", art.output === adapter.output);
    check("sizeBytes > 0", art.sizeBytes > 0);
    check("CTA SDK injected into entry html", art.entryHtml.includes("document.CTA"));

    if (adapter.output === "single-html") {
      check("single file emitted", art.files.length === 1 && art.files[0].mime === "text/html");
      const htmlOut = td.decode(art.files[0].bytes);
      check("deliverable == entry html (uncompressed)", htmlOut === art.entryHtml);
    } else {
      const members = await zipMembers(art.files[0].bytes);
      check("zip deliverable", art.files[0].mime === "application/zip");
      const cfg = getNetworkConfig(adapter.id);
      const expectedHtml = cfg.OutputIndexHtmlName.replace("%name%", "MyGame");
      check(`zip has ${expectedHtml}`, members.includes(expectedHtml), members.join(","));
      if (cfg.ExtractScripts) check("zip has script-1.js", members.includes("script-1.js"), members.join(","));
      for (const extra of cfg.ExtraFiles ?? []) {
        const to = extra.to.replace("./", "");
        check(`zip has extra ${to}`, members.includes(to), members.join(","));
      }
    }

    // Facebook-family token rewrite.
    if (adapter.id === "facebook" || adapter.id === "moloco") {
      check("XMLHttpRequest token rewritten", !/\bXMLHttpRequest\b/.test(art.entryHtml.replace(/atob\([^)]*\)/g, "")));
    }

    const issues = validateArtifact(art, adapter.id);
    const codes = issues.map((i) => i.code);
    console.log(`  issues: ${codes.join(", ") || "(none)"}`);
    check("NO_CTA_HOOK flagged (test playable has no CTA call)", codes.includes("NO_CTA_HOOK"));
    check("no SIZE_EXCEEDED on tiny playable", !codes.includes("SIZE_EXCEEDED"));
  }

  // Google literal ad.size meta injection (faithful, unsubstituted).
  const g = await packForNetwork(bundle, "google", opts);
  check("\nGoogle injects ad.size meta literally", g.entryHtml.includes('name="ad.size"'));

  // imba compression: produces a self-contained loader.
  const fbImba = await packForNetwork(bundle, "facebook", { ...opts, compress: "imba" });
  check("imba loader contains decodePayload", td.decode(fbImba.files[0].bytes).includes("decodePayload"));
  check("imba loader contains pako", td.decode(fbImba.files[0].bytes).includes("pako"));
  check("imba artifact flagged compressed", fbImba.compressed === true);
  const fbImba122 = await packForNetwork(bundle, "facebook", { ...opts, compress: "imba", imbaEncoding: "base122" });
  check("imba base122 loader has data-payload", td.decode(fbImba122.files[0].bytes).includes("imba-packed-payload"));

  // SIZE_EXCEEDED on an oversized input (facebook limit 2MB).
  const big = { entryHtml: entryHtml + "<!--" + "x".repeat(3 * 1024 * 1024) + "-->", assets: [] };
  const bigArt = await packForNetwork(big, "facebook", opts);
  const bigIssues = validateArtifact(bigArt, "facebook");
  const sizeIssue = bigIssues.find((i) => i.code === "SIZE_EXCEEDED");
  check("SIZE_EXCEEDED fires on >2MB facebook", !!sizeIssue && sizeIssue.level === "error", JSON.stringify(sizeIssue));
  check("SIZE_EXCEEDED has limit+actual", !!sizeIssue && sizeIssue.limit === 2 * 1024 * 1024 && sizeIssue.actual > sizeIssue.limit);

  // MISSING_STORE_URL on an mraid network with unresolved tokens.
  const mraidBundle = { entryHtml: entryHtml.replace("</body>", '<a href="{{google}}">play</a></body>'), assets: [] };
  const liftoffArt = await packForNetwork(mraidBundle, "liftoff", { name: "X" }); // no storeUrls
  const liftoffIssues = validateArtifact(liftoffArt, "liftoff");
  const storeIssue = liftoffIssues.find((i) => i.code === "MISSING_STORE_URL");
  check("MISSING_STORE_URL error on mraid w/o store urls", !!storeIssue && storeIssue.level === "error", JSON.stringify(liftoffIssues));

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
