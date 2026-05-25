export interface ValidationCheck {
  name: string;
  passed: boolean;
  details?: string;
  isWarning?: boolean;
}

export interface ValidationCategory {
  name: string;
  checks: ValidationCheck[];
}

export interface ValidationResult {
  categories: ValidationCategory[];
}

export interface ValidationContext {
  presetId?: string | null;
  language?: string | null;
}

export interface Validator {
  validate(content: string, fileSize: number, context?: ValidationContext): ValidationResult;
}

export interface ValidatorFactory {
  create(): Validator;
}