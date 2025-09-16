import type { Validator, ValidationResult, ValidationCategory } from './types';

export class GeneralValidator implements Validator {
  validate(content: string, _fileSize: number): ValidationResult {
    const categories: ValidationCategory[] = [
      {
        name: 'General',
        checks: [
          {
            name: 'Not using "window.top" access',
            passed: !content.includes('window.top') && !content.includes('top.'),
            details: content.includes('window.top') || content.includes('top.')
              ? 'Playable contains window.top access which may cause issues in ad environments'
              : undefined
          },
          {
            name: 'No external script loading',
            passed: !/<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/.test(content),
            details: /<script[^>]*src\s*=\s*["'][^"']*["'][^>]*>/.test(content)
              ? 'External scripts detected - consider bundling all scripts'
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