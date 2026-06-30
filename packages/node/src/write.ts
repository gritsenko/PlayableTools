// Filesystem artifact writer — the Node adapter's output port.
import { promises as fs } from "node:fs";
import path from "node:path";
import type { PackedArtifact } from "@gritsenko/cta-core";

/**
 * Write each artifact to <outDir>/<networkId>/<outputFileName>.
 * Returns a map of network id -> written path (posix-normalized, as given).
 */
export async function writeArtifacts(
  outDir: string,
  artifacts: PackedArtifact[]
): Promise<Map<string, string>> {
  const paths = new Map<string, string>();
  for (const artifact of artifacts) {
    const dir = path.join(outDir, artifact.network);
    await fs.mkdir(dir, { recursive: true });
    let primary = "";
    for (const file of artifact.files) {
      const filePath = path.join(dir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.bytes);
      if (!primary) primary = filePath;
    }
    paths.set(artifact.network, primary.split(path.sep).join("/"));
  }
  return paths;
}
