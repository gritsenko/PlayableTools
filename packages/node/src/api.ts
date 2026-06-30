// Node API — the programmatic entry point (also used by the CLI and the MCP server).
import {
  getNetworks,
  packBundle,
  selectNetworks,
  type PackOptions,
  type PlayableBundle,
  type Report,
} from "@gritsenko/cta-core";
import { readSource } from "./source.js";
import { writeArtifacts } from "./write.js";
import { buildReport } from "./report.js";

export interface RunPackParams {
  /** Networks to build (ids or display names). Omit / empty => all. */
  networks?: string[];
  /** Output directory. Omit => do not write (validate-only / in-memory). */
  out?: string;
  /** Run per-network validation and include issues in the report. */
  validate?: boolean;
  options?: PackOptions;
}

function assertKnownNetworks(networks?: string[]): void {
  const { unknown } = selectNetworks(networks);
  if (unknown.length > 0) {
    throw new Error(
      `Unknown network(s): ${unknown.join(", ")}. Known: ${getNetworks()
        .map((n) => n.id)
        .join(", ")}`
    );
  }
}

/** Pack an in-memory bundle (optionally writing to disk) and build the report. */
export async function runPack(bundle: PlayableBundle, params: RunPackParams): Promise<Report> {
  assertKnownNetworks(params.networks);
  const { configs } = selectNetworks(params.networks);
  const artifacts = await packBundle(bundle, configs, params.options ?? {});
  const pathByNetwork = params.out
    ? await writeArtifacts(params.out, artifacts)
    : new Map<string, string>();
  return buildReport(artifacts, params.validate ?? false, pathByNetwork);
}

export interface PackParams extends RunPackParams {
  /** Path to a folder (entry index.html + assets) or a single .html file. */
  source: string;
}

/** Read a filesystem source, pack it and (optionally) write the builds. */
export async function pack(params: PackParams): Promise<Report> {
  assertKnownNetworks(params.networks);
  const { bundle, baseName } = await readSource(params.source);
  // Derived baseName is the default; an explicit options.name wins (but a
  // spread-in `name: undefined` from the CLI must not clobber the default).
  const options: PackOptions = { ...params.options, name: params.options?.name ?? baseName };
  return runPack(bundle, {
    networks: params.networks,
    out: params.out,
    validate: params.validate,
    options,
  });
}

/** Validate a filesystem source without writing builds. */
export async function validateBuild(params: {
  source: string;
  networks?: string[];
  options?: PackOptions;
}): Promise<Report> {
  return pack({ ...params, out: undefined, validate: true });
}

export { readSource, bundleFromBase64Html } from "./source.js";
export { getNetworks } from "@gritsenko/cta-core";
