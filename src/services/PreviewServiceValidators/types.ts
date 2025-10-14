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

export interface Validator {
  validate(content: string, fileSize: number): ValidationResult;
}

export interface ValidatorFactory {
  create(): Validator;
}