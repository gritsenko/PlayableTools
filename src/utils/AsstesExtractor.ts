/**
 * Utilities for extracting inline assets from HTML.
 *
 * Provides a static `extractScripts` method that takes HTML content as input,
 * extracts all inline <script>...</script> blocks (those without a src attribute),
 * replaces them with <script src="..."></script> links, and returns the
 * processed HTML and a map of generated JS filenames to their contents.
 */

export type ExtractedAssetsResult = {
	html: string;
	files: Record<string, string>; // filename -> content
};

export class AsstesExtractor {
	/**
	 * Extracts inline scripts from the provided HTML string.
	 * - Inline scripts (no src attribute) are combined into a single file
	 *   (order preserved). A single `<script src="..."></script>` is injected
	 *   before `</body>` (or appended at the end if no body tag exists).
	 * - External scripts (with `src`) are left untouched and stay in place.
	 *
	 * Returns an object with the processed HTML and a map of filenames -> contents.
	 */
	static extractScripts(htmlContent: string): ExtractedAssetsResult {
		if (!htmlContent) return { html: htmlContent, files: {} };

		const files: Record<string, string> = {};

		// Collect inline scripts in order and remove them from the HTML.
		const inlineScripts: Array<{ content: string; type?: string }> = [];
		const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

		const strippedHtml = htmlContent.replace(scriptRegex, (fullMatch, attrs, inner) => {
			// If script tag has a src attribute, leave it as-is
			if (/\bsrc\s*=\s*["'][^"']+["']/i.test(attrs)) {
				return fullMatch;
			}

			// Inline script: record its content and type (if present), then remove it
			const typeMatch = /\btype\s*=\s*(['"])(.*?)\1/i.exec(attrs);
			inlineScripts.push({ content: inner, type: typeMatch ? typeMatch[2] : undefined });
			return ""; // remove the inline script from original location
		});

		if (inlineScripts.length === 0) {
			return { html: strippedHtml, files };
		}

		// Combine all inline scripts into a single file, preserving order.
		const fileName = `script-1.js`;
		let combined = "";
		for (const s of inlineScripts) {
			combined += s.content + "\n";
		}
		files[fileName] = combined;

		// If any inline script used type="module", mark the combined script as module.
		const needsModule = inlineScripts.some(s => s.type && s.type.toLowerCase() === "module");
		const typeAttr = needsModule ? ` type="module"` : "";
		const scriptTag = `<script src="${fileName}"${typeAttr}></script>`;

		// Inject the single combined script before </body>. If no </body>, append at end.
		if (/<\/body>/i.test(strippedHtml)) {
			const newHtml = strippedHtml.replace(/<\/body>/i, scriptTag + "</body>");
			return { html: newHtml, files };
		}

		return { html: strippedHtml + scriptTag, files };
	}
}

