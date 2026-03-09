"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  AuthState,
  AuthContextType,
  AuthAction,
  LoginCredentials,
} from "../types/auth";
import { authService } from "../services/authService";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload.error,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      const result = await authService.login(credentials);

      // Immediately set the user in the state
      if (result.user) {
        dispatch({ type: "AUTH_SUCCESS", payload: { user: result.user } });
      } else {
        // If no user data returned, fetch it
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: "AUTH_SUCCESS", payload: { user } });
        } else {
          throw new Error("Failed to get user data after login");
        }
      }
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: {
          error: error instanceof Error ? error.message : "Login failed",
        },
      });
      throw error; // Re-throw so login page can handle it
    }
  };

  const logout = async (): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      await authService.logout();
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Check authentication status on mount with timeout handling
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: "AUTH_START" });

      try {
        const user = await authService.getCurrentUser();

        if (user) {
          dispatch({ type: "AUTH_SUCCESS", payload: { user } });
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.log("Auth check failed:", error);
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    // Use setTimeout to prevent blocking initial render
    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
