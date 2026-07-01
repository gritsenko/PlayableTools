// Assembles the shared JSON report contract from packed artifacts + validation.
import {
  validateArtifact,
  type NetworkReport,
  type PackedArtifact,
  type Report,
} from "@gritsenko/cta-core";

export function buildReport(
  artifacts: PackedArtifact[],
  validate: boolean,
  pathByNetwork: Map<string, string>
): Report {
  const networks: NetworkReport[] = artifacts.map((artifact) => {
    const issues = validate ? validateArtifact(artifact, artifact.network) : [];
    const ok = !issues.some((issue) => issue.level === "error");
    const report: NetworkReport = {
      id: artifact.network,
      ok,
      output: artifact.output,
      sizeBytes: artifact.sizeBytes,
    };
    const path = pathByNetwork.get(artifact.network);
    if (path) report.path = path;
    if (issues.length > 0) report.issues = issues;
    return report;
  });

  return {
    ok: networks.every((network) => network.ok),
    networks,
  };
}
