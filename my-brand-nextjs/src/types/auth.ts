export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  errors?: Record<string, string>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}

// Validation interfaces
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Permission and Role interfaces
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}
