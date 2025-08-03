'use client';

import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { authService, LoginData, RegisterData, User } from '../services/auth.service';
import { USER_ROLES } from '../services/config';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null
      };
    
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  // Actions
  login: (credentials: LoginData) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  
  // Helper methods
  isAdmin: () => boolean;
  hasRole: (role: number) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        if (authService.isAuthenticated()) {
          // Try to get current user profile
          const user = await authService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Clear invalid token
        authService.logout();
      } finally {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginData): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: user });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Register
  const register = useCallback(async (userData: RegisterData): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const user = await authService.register(userData);
      dispatch({ type: 'SET_USER', payload: user });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no cadastro';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      // If refresh fails, logout
      logout();
    }
  }, [logout]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return state.user?.role === USER_ROLES.ADMIN;
  }, [state.user]);

  // Check if user has specific role
  const hasRole = useCallback((role: number): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
    clearError,
    isAdmin,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
