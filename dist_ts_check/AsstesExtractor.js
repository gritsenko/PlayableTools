"use strict";
/**
 * Utilities for extracting inline assets from HTML.
 *
 * Provides a static `extractScripts` method that takes HTML content as input,
 * extracts all inline <script>...</script> blocks (those without a src attribute),
 * replaces them with <script src="..."></script> links, and returns the
 * processed HTML and a map of generated JS filenames to their contents.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsstesExtractor = void 0;
var AsstesExtractor = /** @class */ (function () {
    function AsstesExtractor() {
    }
    /**
     * Extracts inline scripts from the provided HTML string.
     * - Inline scripts (no src attribute) are combined into a single file
     *   (order preserved). A single `<script src="..."></script>` is injected
     *   before `</body>` (or appended at the end if no body tag exists).
     * - External scripts (with `src`) are left untouched and stay in place.
     *
     * Returns an object with the processed HTML and a map of filenames -> contents.
     */
    AsstesExtractor.extractScripts = function (htmlContent) {
        if (!htmlContent)
            return { html: htmlContent, files: {} };
        var files = {};
        // Collect inline scripts in order and remove them from the HTML.
        var inlineScripts = [];
        var scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
        var strippedHtml = htmlContent.replace(scriptRegex, function (fullMatch, attrs, inner) {
            // If script tag has a src attribute, leave it as-is
            if (/\bsrc\s*=\s*["'][^"']+["']/i.test(attrs)) {
                return fullMatch;
            }
            // Inline script: record its content and type (if present), then remove it
            var typeMatch = /\btype\s*=\s*(['"])(.*?)\1/i.exec(attrs);
            inlineScripts.push({ content: inner, type: typeMatch ? typeMatch[2] : undefined });
            return ""; // remove the inline script from original location
        });
        if (inlineScripts.length === 0) {
            return { html: strippedHtml, files: files };
        }
        // Combine all inline scripts into a single file, preserving order.
        var fileName = "script-1.js";
        var combined = "";
        for (var _i = 0, inlineScripts_1 = inlineScripts; _i < inlineScripts_1.length; _i++) {
            var s = inlineScripts_1[_i];
            combined += s.content + "\n";
        }
        files[fileName] = combined;
        // If any inline script used type="module", mark the combined script as module.
        var needsModule = inlineScripts.some(function (s) { return s.type && s.type.toLowerCase() === "module"; });
        var typeAttr = needsModule ? " type=\"module\"" : "";
        var scriptTag = "<script src=\"".concat(fileName, "\"").concat(typeAttr, "></script>");
        // Inject the single combined script before </body>. If no </body>, append at end.
        if (/<\/body>/i.test(strippedHtml)) {
            var newHtml = strippedHtml.replace(/<\/body>/i, scriptTag + "</body>");
            return { html: newHtml, files: files };
        }
        return { html: strippedHtml + scriptTag, files: files };
    };
    return AsstesExtractor;
}());
exports.AsstesExtractor = AsstesExtractor;
