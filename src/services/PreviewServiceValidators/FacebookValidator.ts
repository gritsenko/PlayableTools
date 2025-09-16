import type { Validator, ValidationResult, ValidationCategory } from './types';

export class FacebookValidator implements Validator {
  validate(content: string, fileSize: number): ValidationResult {
    const categories: ValidationCategory[] = [
      {
        name: 'Facebook',
        checks: [
          {
            name: 'HTML file size < 5MB',
            passed: fileSize <= 5 * 1024 * 1024,
            details: fileSize > 5 * 1024 * 1024
              ? `File size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB (max: 5MB)`
              : `File size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB`
          },
          {
            name: 'No XMLHttpRequest usage',
            passed: !content.includes('XMLHttpRequest') && !content.includes('fetch('),
            details: content.includes('XMLHttpRequest') || content.includes('fetch(')
              ? 'XMLHttpRequest/fetch usage detected - Facebook blocks these APIs'
              : undefined
          },
          {
            name: 'No localStorage/sessionStorage',
            passed: !content.includes('localStorage') && !content.includes('sessionStorage'),
            details: content.includes('localStorage') || content.includes('sessionStorage')
              ? 'localStorage/sessionStorage usage detected - may not work in Facebook environment'
              : undefined
          },
          {
            name: 'Valid HTML5 doctype',
            passed: /<!DOCTYPE html>/i.test(content),
            details: !/<!DOCTYPE html>/i.test(content)
              ? 'Missing HTML5 doctype declaration'
              : undefined
          }
        ]
      }
    ];

    return { categories };
  }
}