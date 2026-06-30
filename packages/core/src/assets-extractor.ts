// Ported verbatim from src/utils/AsstesExtractor.ts (pure string logic).
// Extracts inline <script> blocks (no src) into a single sibling file and links it.

export type ExtractedAssetsResult = {
  html: string;
  files: Record<string, string>; // filename -> content
};

export function extractInlineScripts(htmlContent: string): ExtractedAssetsResult {
  if (!htmlContent) return { html: htmlContent, files: {} };

  const files: Record<string, string> = {};

  const inlineScripts: Array<{ content: string; type?: string }> = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  const strippedHtml = htmlContent.replace(scriptRegex, (fullMatch, attrs, inner) => {
    // If script tag has a src attribute, leave it as-is.
    if (/\bsrc\s*=\s*["'][^"']+["']/i.test(attrs)) {
      return fullMatch;
    }

    const typeMatch = /\btype\s*=\s*(['"])(.*?)\1/i.exec(attrs);
    inlineScripts.push({ content: inner, type: typeMatch ? typeMatch[2] : undefined });
    return ""; // remove the inline script from its original location
  });

  if (inlineScripts.length === 0) {
    return { html: strippedHtml, files };
  }

  const fileName = `script-1.js`;
  let combined = "";
  for (const s of inlineScripts) {
    combined += s.content + "\n";
  }
  files[fileName] = combined;

  const needsModule = inlineScripts.some((s) => s.type && s.type.toLowerCase() === "module");
  const typeAttr = needsModule ? ` type="module"` : "";
  const scriptTag = `<script src="${fileName}"${typeAttr}></script>`;

  if (/<\/body>/i.test(strippedHtml)) {
    const newHtml = strippedHtml.replace(/<\/body>/i, scriptTag + "</body>");
    return { html: newHtml, files };
  }

  return { html: strippedHtml + scriptTag, files };
}
