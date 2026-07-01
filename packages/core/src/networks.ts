// Network registry — ported faithfully from the legacy src/assets/platforms-config.json,
// extended with a stable lowercase `id` and a `maxBytes` constraint sourced from the
// repo's own ad-network requirements page (src/pages/validate-page.ts).
import type { NetworkAdapter, NetworkOutput } from "./types.js";

const MB = 1024 * 1024;

export interface NetworkConfig {
  /** Stable lowercase id (CLI / MCP / report). */
  id: string;
  /** Legacy display name (also accepted on the CLI, case-insensitive). */
  Name: string;
  /** Absent => single-html output. */
  format?: "zip";
  /** Max delivered artifact size in bytes. */
  maxBytes: number;
  InjeectScripts?: string[];
  ExtractScripts?: boolean;
  OutputIndexHtmlName?: string;
  ExtraFiles?: { from: string; to: string }[];
  replaceTokens?: Record<string, string>;
  /** Declared but unused by the transform today (kept for fidelity). */
  Sizes?: Record<string, string>;
  notes?: string;
}

export const GLOBAL_DEFAULTS: { replaceTokens: Record<string, string> } = {
  replaceTokens: {
    '<script type="module" crossorigin>': "<script>",
  },
};

export const NETWORKS: NetworkConfig[] = [
  {
    id: "facebook",
    Name: "Facebook",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.Facebook.js"],
    replaceTokens: { XMLHttpRequest: "_xrq_" },
    notes: "Single HTML. 5MB (HTML/ZIP, per Meta). Blocks XMLHttpRequest/fetch.",
  },
  {
    id: "moloco",
    Name: "Moloco",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.Moloco.js"],
    replaceTokens: { XMLHttpRequest: "_xrq_" },
    notes: "Single HTML. Uses Facebook's format/API; no XMLHttpRequest.",
  },
  {
    id: "facebook_zip",
    Name: "Facebook_Zip",
    format: "zip",
    maxBytes: 5 * MB,
    OutputIndexHtmlName: "index.html",
    ExtractScripts: true,
    InjeectScripts: ["cta.Facebook_Zip.js"],
    replaceTokens: { XMLHttpRequest: "_xrq_" },
    notes: "ZIP. 5MB. Inline scripts extracted to a sibling .js.",
  },
  {
    id: "mintegral",
    Name: "Mintegral",
    format: "zip",
    maxBytes: 5 * MB,
    OutputIndexHtmlName: "%name%.html",
    InjeectScripts: ["cta.Mintegral.js"],
    notes: "ZIP. 5MB. Archive name must match the main file inside.",
  },
  {
    id: "ironsource",
    Name: "IronSource",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.IronSource.js"],
    notes: "Single HTML. 5MB.",
  },
  {
    id: "adcolony",
    Name: "AdColony",
    maxBytes: 2 * MB,
    InjeectScripts: ["cta.AdColony.js"],
    notes: "Single HTML. 2MB.",
  },
  {
    id: "unity",
    Name: "Unity",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.Unity.js"],
    notes: "Single HTML. 5MB.",
  },
  {
    id: "applovin",
    Name: "Applovin",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.Applovin.js"],
    notes: "Single HTML. 5MB. External requests need AppLovin approval.",
  },
  {
    id: "liftoff",
    Name: "liftoff",
    maxBytes: 5 * MB,
    InjeectScripts: ["cta.Mraid2.js"],
    notes: "Single HTML. 5MB. MRAID2 — needs store URLs.",
  },
  {
    id: "chartboost",
    Name: "chartboost",
    maxBytes: 3 * MB,
    InjeectScripts: ["cta.Mraid2.js"],
    notes: "Single HTML. 3MB. MRAID2 — needs store URLs.",
  },
  {
    id: "vungle",
    Name: "Vungle",
    format: "zip",
    maxBytes: 5 * MB,
    OutputIndexHtmlName: "ad.html",
    ExtraFiles: [{ from: "./Vungle/index.html", to: "./index.html" }],
    InjeectScripts: ["cta.Vungle.js"],
    notes: "ZIP. 5MB. Wrapper index.html points to ad.html.",
  },
  {
    id: "tiktok",
    Name: "TikTok",
    format: "zip",
    maxBytes: 5 * MB,
    OutputIndexHtmlName: "index.html",
    ExtraFiles: [{ from: "./TikTok/config.json", to: "./config.json" }],
    InjeectScripts: ["cta.TikTok.js"],
    notes: "ZIP. 5MB. config.json (orientation/languages) required in root.",
  },
  {
    id: "google",
    Name: "Google",
    format: "zip",
    maxBytes: 5 * MB,
    OutputIndexHtmlName: "index.html",
    Sizes: {
      "320x480": "width=320,height=480",
      "480x320": "width=480,height=320",
      "300x250": "width=300,height=250",
    },
    InjeectScripts: ["cta.Google.js"],
    replaceTokens: {
      "</title>":
        '</title> <meta name="ad.size" content="{{ad.size}}"><meta name="ad.orientation" content="landscape">',
    },
    notes: "ZIP. 5MB. Google Ads / H5.",
  },
];

export function isMraid(config: NetworkConfig): boolean {
  return /mraid/i.test((config.InjeectScripts ?? []).join(" "));
}

export function toAdapter(config: NetworkConfig): NetworkAdapter {
  const output: NetworkOutput = config.format === "zip" ? "zip" : "single-html";
  return {
    id: config.id,
    name: config.Name,
    output,
    constraints: { maxBytes: config.maxBytes },
    notes: config.notes,
    mraid: isMraid(config),
  };
}

/** Public adapter list (for list_networks). */
export function getNetworks(): NetworkAdapter[] {
  return NETWORKS.map(toAdapter);
}

/** Resolve a token (id or display Name, case-insensitive) to a config. */
export function getNetworkConfig(token: string): NetworkConfig | undefined {
  const t = token.trim().toLowerCase();
  return NETWORKS.find((n) => n.id.toLowerCase() === t || n.Name.toLowerCase() === t);
}

/**
 * Resolve a list of tokens (or undefined => all) to configs.
 * Returns the resolved configs plus any unknown tokens.
 */
export function selectNetworks(tokens?: string[]): { configs: NetworkConfig[]; unknown: string[] } {
  if (!tokens || tokens.length === 0) {
    return { configs: [...NETWORKS], unknown: [] };
  }
  const configs: NetworkConfig[] = [];
  const unknown: string[] = [];
  for (const token of tokens) {
    const config = getNetworkConfig(token);
    if (config) {
      if (!configs.includes(config)) configs.push(config);
    } else {
      unknown.push(token);
    }
  }
  return { configs, unknown };
}
