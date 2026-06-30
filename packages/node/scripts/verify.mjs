// Node API smoke test: exercises the report contract + exit-code semantics
// against the repo test playables. Run after building core + node.
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pack, runPack, validateBuild, getNetworks } from "../dist/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

let failures = 0;
function check(name, cond, detail = "") {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${cond ? "" : ` — ${detail}`}`);
  if (!cond) failures++;
}

function exitCodeFor(report) {
  return report.ok ? 0 : 2;
}

async function main() {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), "cta-verify-"));
  const storeUrls = { android: "https://play.google.com/store/apps/details?id=x", ios: "https://apps.apple.com/app/id1" };

  // 1) All networks, valid input (store URLs provided) -> ok, exit 0.
  const full = await pack({
    source: path.join(repoRoot, "test-playable.html"),
    out: path.join(out, "all"),
    validate: true,
    options: { storeUrls },
  });
  check("13 networks in report", full.networks.length === 13, String(full.networks.length));
  check("report.ok with store URLs", full.ok === true, JSON.stringify(full.networks.filter((n) => !n.ok)));
  check("exit code 0", exitCodeFor(full) === 0);
  check("every network has a path + sizeBytes", full.networks.every((n) => n.path && n.sizeBytes > 0));
  const missing = [];
  for (const n of full.networks) {
    const onDisk = await fs
      .stat(path.resolve(repoRoot, n.path))
      .then((s) => s.isFile())
      .catch(() => false);
    if (!onDisk) missing.push(n.id);
  }
  check("all 13 artifact files written to disk", missing.length === 0, `missing: ${missing.join(",")}`);

  // 2) MRAID networks without store URLs -> error, exit 2.
  const noStore = await validateBuild({
    source: path.join(repoRoot, "public", "test-simple-playable.html"),
    networks: ["liftoff", "chartboost", "google"],
  });
  check("report.ok false without store URLs", noStore.ok === false);
  check("exit code 2", exitCodeFor(noStore) === 2);
  const liftoff = noStore.networks.find((n) => n.id === "liftoff");
  check(
    "liftoff has MISSING_STORE_URL error",
    !!liftoff && (liftoff.issues ?? []).some((i) => i.code === "MISSING_STORE_URL" && i.level === "error"),
    JSON.stringify(liftoff)
  );
  check("google ok (non-mraid)", noStore.networks.find((n) => n.id === "google")?.ok === true);

  // 3) Oversized input -> SIZE_EXCEEDED error (in-memory, no write).
  const bigHtml = "<!DOCTYPE html><html><head><title>x</title></head><body>" + "x".repeat(3 * 1024 * 1024) + "</body></html>";
  const big = await runPack({ entryHtml: bigHtml, assets: [] }, { networks: ["facebook"], validate: true });
  const fb = big.networks[0];
  const sizeIssue = (fb.issues ?? []).find((i) => i.code === "SIZE_EXCEEDED");
  check("SIZE_EXCEEDED error on >2MB facebook", !!sizeIssue && sizeIssue.level === "error");
  check("SIZE_EXCEEDED has limit+actual", !!sizeIssue && sizeIssue.limit === 2 * 1024 * 1024 && sizeIssue.actual > sizeIssue.limit);
  check("exit code 2 on oversize", exitCodeFor(big) === 2);

  // 4) imba compress option flows through.
  const imba = await runPack({ entryHtml: bigHtml, assets: [] }, { networks: ["facebook"], validate: true, options: { compress: "imba" } });
  check("imba shrinks the >2MB input under 2MB", imba.networks[0].sizeBytes < 2 * 1024 * 1024, String(imba.networks[0].sizeBytes));
  check("imba run is ok (exit 0)", imba.ok === true);

  check("getNetworks() exported from node API", getNetworks().length === 13);

  await fs.rm(out, { recursive: true, force: true });
  console.log(`\n${failures === 0 ? "ALL CLI/API CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
