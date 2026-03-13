import type { Validator, ValidationResult, ValidationCategory } from './types';

export class CtaSdkValidator implements Validator {
  validate(content: string, _fileSize: number): ValidationResult {
    const source = content;
    const sdkMethods: Array<{ label: string; patterns: RegExp[] }> = [
      { label: 'CTA.onClick', patterns: [/(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?onClick/] },
      { label: 'CTA.gameReady', patterns: [/(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?gameReady/] },
      { label: 'CTA.gameEnd', patterns: [/(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?gameEnd/] },
      {
        label: 'CTA.analytics.trackEvent',
        patterns: [
          /(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?analytics(?:\.|\?\.)?\.?\[?['"]?trackEvent/,
          /(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?track(?:Event)?/,
        ]
      },
      { label: 'CTA.mute / unmute', patterns: [/(?:window\.|document\.)?CTA\??(?:\.|\?\.)?\.?\[?['"]?(?:un)?mute/] },
    ];

    const checks = sdkMethods.map(({ label, patterns }) => {
      const found = patterns.some((pattern) => pattern.test(source));
      return {
        name: label,
        passed: found,
        isWarning: !found,
        details: found ? undefined : 'Not found in source — optional if your playable does not use this method'
      };
    });

    const anyFound = checks.some((check) => check.passed);
    const categories: ValidationCategory[] = [{
      name: 'CTA SDK',
      checks: anyFound
        ? checks
        : [{
            name: 'No CTA SDK calls detected',
            passed: false,
            isWarning: true,
            details: 'The playable does not appear to call CTA SDK methods. Make sure it integrates document.CTA or window.CTA.'
          }]
    }];

    return { categories };
  }
}