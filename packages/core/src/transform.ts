// Token replacement + script injection — ported from src/services/PlayablePublishService.ts.
// The only change: injected scripts are read from the embedded PUBLISH_ASSETS map
// instead of being fetched over HTTP, so this is synchronous and browser-free.
import type { PackOptions } from "./types.js";
import { GLOBAL_DEFAULTS, type NetworkConfig } from "./networks.js";
import { PUBLISH_ASSETS } from "./generated/publish-assets.js";

export function applyReplaceTokens(html: string, replaceTokens: Record<string, string>): string {
  if (!replaceTokens || Object.keys(replaceTokens).length === 0) {
    return html;
  }

  const escapedTokens = Object.keys(replaceTokens).map((token) =>
    token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(escapedTokens.join("|"), "g");
  return html.replace(regex, (match) => replaceTokens[match] ?? match);
}

export function applyGlobalTokens(html: string): string {
  if (!GLOBAL_DEFAULTS.replaceTokens) {
    return html;
  }
  return applyReplaceTokens(html, GLOBAL_DEFAULTS.replaceTokens);
}

export function injectScripts(
  html: string,
  scripts: string[],
  replaceTokens?: Record<string, string>
): string {
  let result = html;

  const scriptTags = scripts
    .map((scriptSrc) => {
      const raw = PUBLISH_ASSETS[scriptSrc];
      if (raw === undefined) {
        return null;
      }
      let scriptContent = raw;
      if (replaceTokens && Object.keys(replaceTokens).length > 0) {
        scriptContent = applyReplaceTokens(scriptContent, replaceTokens);
      }
      return `<script>\n${scriptContent}\n</script>`;
    })
    .filter((tag): tag is string => tag !== null);

  for (const scriptTag of scriptTags) {
    if (/<head[^>]*>/i.test(result)) {
      const headMatch = result.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i);
      if (headMatch) {
        const headContent = headMatch[2];
        const firstScriptMatch = headContent.match(/<script[^>]*>/i);
        if (firstScriptMatch) {
          const insertIndex =
            headMatch.index! + headMatch[1].length + headContent.indexOf(firstScriptMatch[0]);
          result = `${result.slice(0, insertIndex)}\n${scriptTag}\n${result.slice(insertIndex)}`;
        } else {
          result = result.replace(/<\/head>/i, `${scriptTag}\n</head>`);
        }
      }
    } else if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${scriptTag}\n</body>`);
    } else {
      result += scriptTag;
    }
  }

  return result;
}

/** Apply a network's token map (+ store URLs) and inject its scripts. */
export function processHtml(html: string, network: NetworkConfig, options?: PackOptions): string {
  let resultHtml = html;
  const effectiveTokens: Record<string, string> = {};
  if (network.replaceTokens) {
    Object.assign(effectiveTokens, network.replaceTokens);
  }
  if (options?.storeUrls?.android) {
    effectiveTokens["{{google}}"] = options.storeUrls.android;
  }
  if (options?.storeUrls?.ios) {
    effectiveTokens["{{apple}}"] = options.storeUrls.ios;
  }

  if (Object.keys(effectiveTokens).length > 0) {
    resultHtml = applyReplaceTokens(resultHtml, effectiveTokens);
  }

  if (network.InjeectScripts && Array.isArray(network.InjeectScripts)) {
    resultHtml = injectScripts(resultHtml, network.InjeectScripts, effectiveTokens);
  }

  return resultHtml;
}
