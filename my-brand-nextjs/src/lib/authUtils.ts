import { useState, useCallback } from 'react';
import { ValidationResult, ValidationRule, LoginCredentials } from '@/types/auth';

// Validation rules for login only
export const authValidationRules = {
  username: [
    { required: true, message: 'Username is required' },
    { minLength: 3, message: 'Username must be at least 3 characters' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 4, message: 'Password must be at least 4 characters' },
  ],
};

// Validation utility functions
export function isValidString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    // Check if value is a valid string first
    if (!isValidString(value)) {
      if (rule.required) {
        return rule.message || 'This field is required';
      }
      continue;
    }

    if (rule.required && value.trim().length === 0) {
      return rule.message || 'This field is required';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Must be less than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }
  }

  return null;
}

export function validateLoginForm(credentials: LoginCredentials): ValidationResult {
  const errors: Record<string, string> = {};

  const usernameError = validateField(credentials.username, authValidationRules.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validateField(credentials.password, authValidationRules.password);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Custom hook for form validation - login only
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateForm = useCallback((data: LoginCredentials): ValidationResult => {
    setIsValidating(true);
    
    const result = validateLoginForm(data);
    
    setErrors(result.errors);
    setIsValidating(false);
    
    return result;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  return {
    errors,
    isValidating,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
  };
}

// Simple password validation for basic security (optional use)
export function isPasswordValid(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!isValidString(password)) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 4) {
    return { isValid: false, message: 'Password must be at least 4 characters' };
  }

  return { isValid: true };
}

// Form field state management
export function useFormField(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (touched && error) {
      setError('');
    }
  }, [touched, error]);

  const onBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const validate = useCallback((rules: ValidationRule[]) => {
    const validationError = validateField(value, rules);
    setError(validationError || '');
    return !validationError;
  }, [value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    validate,
    reset,
    hasError: touched && !!error,
  };
}

// Debounce hook for real-time validation
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}

// Local storage utilities for auth
export const authStorage = {
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_remember_me');
  },

  getRememberMe: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('auth_remember_me') === 'true';
  },

  setRememberMe: (remember: boolean): void => {
    if (typeof window === 'undefined') return;
    if (remember) {
      localStorage.setItem('auth_remember_me', 'true');
    } else {
      localStorage.removeItem('auth_remember_me');
    }
  },
};

const authUtils = {
  validateField,
  validateLoginForm,
  isPasswordValid,
  isValidString,
  authStorage,
};export default authUtils;
