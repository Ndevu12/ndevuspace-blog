import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from 'utils/apiResponse';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

/**
 * Handle authentication-specific API errors with user-friendly messages
 */
function getAuthErrorMessage(error: string | null, code?: string): string {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid username or password';
    case 'USER_NOT_FOUND':
      return 'User not found';
    case 'USER_ALREADY_EXISTS':
      return 'User with this email already exists';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again';
    case 'UNAUTHORIZED':
      return 'You are not authorized to perform this action';
    default:
      return error || 'Authentication failed';
  }
}

export class AuthService {
  
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const result = await safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // Important to allow cookies to be set by the server
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
    
    if (!result.success) {
      const errorMessage = getAuthErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
    
    return result.data as AuthResponse;
  }
  
  // Logout user
  async logout(): Promise<void> {
    const result = await safeFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies to logout properly
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!result.success) {
      const errorMessage = getAuthErrorMessage(result.error, result.code);
      throw new Error(errorMessage);
    }
  }
  
  // Get current user (check if authenticated)
  async getCurrentUser(): Promise<User | null> {
    const result = await safeFetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!result.success) {
      // If not authenticated or error, return null (don't throw error)
      return null;
    }
    
    return result.data as User;
  }
}

// Export a singleton instance
export const authService = new AuthService();