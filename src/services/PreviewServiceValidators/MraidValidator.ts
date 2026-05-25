import type { Validator, ValidationResult, ValidationCategory } from './types';

export class MraidValidator implements Validator {
  validate(content: string, fileSize: number, _context?: unknown): ValidationResult {
    const categories: ValidationCategory[] = [
      {
        name: 'MRAID',
        checks: [
          {
            name: 'HTML file size < 5MB',
            passed: fileSize <= 5 * 1024 * 1024,
            details: fileSize > 5 * 1024 * 1024
              ? `File size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB (max: 5MB)`
              : `File size: ${(fileSize / (1024 * 1024)).toFixed(1)}MB`
          },
          {
            name: 'MRAID script tag added',
            passed: content.includes('mraid.js'),
            isWarning: !content.includes('mraid.js'),
            details: !content.includes('mraid.js')
              ? 'Playable does not include mraid.js. This is valid but not recommended for MRAID environments.'
              : undefined
          },
          {
            name: 'viewableChange handler present',
            passed: content.includes('viewableChange') || content.includes('mraid.addEventListener'),
            details: !content.includes('viewableChange') && !content.includes('mraid.addEventListener')
              ? 'No viewableChange event handler found'
              : undefined
          },
          {
            name: 'MRAID ready event handled',
            passed: content.includes('mraid.addEventListener') && content.includes('ready'),
            details: !(content.includes('mraid.addEventListener') && content.includes('ready'))
              ? 'MRAID ready event handler not found'
              : undefined
          },
          {
            name: 'No direct DOM manipulation without MRAID',
            passed: !content.includes('document.body') || content.includes('mraid'),
            details: content.includes('document.body') && !content.includes('mraid')
              ? 'Direct body manipulation detected - use MRAID APIs instead'
              : undefined
          },
        ]
      }
    ];

    return { categories };
  }
}