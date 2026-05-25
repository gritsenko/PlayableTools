import type { Validator, ValidationResult, ValidationCategory } from './types';

export class GeneralValidator implements Validator {
  validate(content: string, _fileSize: number, _context?: unknown): ValidationResult {
    const allowedExternalScriptPattern = /(?:mraid\.js|\/\/tpc\.googlesyndication\.com\/pagead\/gadgets\/html5\/api\/exitapi\.js|https:\/\/sdk\.games\.s3\.yandex\.net\/sdk\.js|(?:\.\/)?sdk\.js|\/sdk\.js)/;
    const externalScriptMatches = Array.from(content.matchAll(/<script[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/ig));
    const hasDisallowedExternalScript = externalScriptMatches.some(match => !allowedExternalScriptPattern.test(match[1]));

    const categories: ValidationCategory[] = [
      {
        name: 'General',
        checks: [
          {
            name: 'Not using "window.top" access',
            passed: !content.includes('window.top'),
            details: content.includes('window.top')
              ? 'Playable contains window.top access which may cause issues in ad environments'
              : undefined
          },
          {
            name: 'No external script loading (except mraid.js, exitapi.js, Yandex sdk.js)',
            passed: !hasDisallowedExternalScript,
            details: hasDisallowedExternalScript
              ? 'External scripts detected (except mraid.js, exitapi.js, Yandex sdk.js) - consider bundling all scripts'
              : undefined
          },
          {
            name: 'Valid HTML structure',
            passed: /<html[^>]*>[\s\S]*<\/html>/i.test(content),
            details: !/<html[^>]*>[\s\S]*<\/html>/i.test(content)
              ? 'Missing proper HTML structure'
              : undefined
          }
        ]
      }
    ];

    return { categories };
  }
}