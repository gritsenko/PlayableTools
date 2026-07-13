import type { Validator, ValidationResult, ValidationCategory } from './types';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Validates a playable against AppLovin's MAX playable requirements:
 * a single self-contained HTML file (<= 5MB) that renders inside an MRAID
 * container and routes its CTA / store click through mraid.open().
 */
export class AppLovinValidator implements Validator {
  validate(content: string, fileSize: number, _context?: unknown): ValidationResult {
    const hasMraid = content.includes('mraid');
    const hasMraidScriptTag = /<script[^>]+src\s*=\s*["'][^"']*mraid\.js["']/i.test(content);
    const usesMraidOpen = /mraid\s*\.\s*open\s*\(/.test(content);
    const handlesReady = content.includes('addEventListener') && content.includes('ready');

    // Single-file: no external <script src="http...">, <link href="http...">,
    // or remote asset references. Data URIs / relative refs are fine.
    const externalScript = /<script[^>]+src\s*=\s*["'](https?:)?\/\//i.test(content);
    const externalLink = /<link[^>]+href\s*=\s*["'](https?:)?\/\//i.test(content);
    const externalMedia = /<(?:img|audio|video|source)[^>]+src\s*=\s*["'](https?:)?\/\//i.test(content);
    const hasExternalResources = externalScript || externalLink || externalMedia;

    const usesRemoteNetwork = /XMLHttpRequest|fetch\s*\(/.test(content);

    const categories: ValidationCategory[] = [
      {
        name: 'AppLovin MAX',
        checks: [
          {
            name: `HTML file size < ${MAX_SIZE_MB}MB`,
            passed: fileSize <= MAX_SIZE_BYTES,
            details: `File size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB${
              fileSize > MAX_SIZE_BYTES ? ` (max: ${MAX_SIZE_MB}MB)` : ''
            }`,
          },
          {
            name: 'Valid HTML5 doctype',
            passed: /<!DOCTYPE html>/i.test(content),
            details: !/<!DOCTYPE html>/i.test(content)
              ? 'Missing HTML5 doctype declaration'
              : undefined,
          },
          {
            name: 'Single self-contained HTML file',
            passed: !hasExternalResources,
            details: hasExternalResources
              ? 'External resource reference detected (http(s):// or //). AppLovin requires a single self-contained HTML with all assets inlined (data URIs).'
              : 'No external resource references found',
          },
          {
            name: 'MRAID environment used',
            passed: hasMraid,
            isWarning: !hasMraid,
            details: !hasMraid
              ? 'No mraid reference found. AppLovin renders playables in an MRAID container — the creative should integrate with mraid.'
              : undefined,
          },
          {
            name: 'mraid.js script tag added',
            passed: hasMraidScriptTag,
            isWarning: !hasMraidScriptTag,
            details: !hasMraidScriptTag
              ? 'Playable does not include a <script src="mraid.js"> tag. Valid but not recommended — AppLovin injects mraid at runtime.'
              : undefined,
          },
          {
            name: 'MRAID ready event handled',
            passed: handlesReady,
            isWarning: !handlesReady,
            details: !handlesReady
              ? 'No MRAID ready handler found. The creative should wait for the ready event before starting.'
              : undefined,
          },
          {
            name: 'CTA routed through mraid.open()',
            passed: usesMraidOpen,
            isWarning: !usesMraidOpen,
            details: !usesMraidOpen
              ? 'No mraid.open() call found. AppLovin requires the store/CTA click to go through mraid.open() so MAX can attribute the click.'
              : undefined,
          },
          {
            name: 'No remote network requests',
            passed: !usesRemoteNetwork,
            isWarning: usesRemoteNetwork,
            details: usesRemoteNetwork
              ? 'XMLHttpRequest/fetch usage detected. Remote requests are discouraged in AppLovin playables and may be blocked.'
              : undefined,
          },
        ],
      },
    ];

    return { categories };
  }
}
