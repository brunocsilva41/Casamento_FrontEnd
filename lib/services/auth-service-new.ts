import { API_BASE_URL, API_ENDPOINTS, USER_ROLES } from './config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private currentUser: User | null = null;

  private constructor() {
    // Initialize token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with email and password
   */
  public async login(credentials: LoginData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email ou senha incorretos');
        }
        throw new Error('Erro no servidor. Tente novamente.');
      }

      const result: AuthResponse = await response.json();
      
      // Store token and user
      this.token = result.data.token;
      this.currentUser = result.data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', this.token);
      }

      return result.data.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  public async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Este email já está em uso');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar conta');
      }

      const result: AuthResponse = await response.json();
      
      // Store token and user
      this.token = result.data.token;
      this.currentUser = result.data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', this.token);
      }

      return result.data.user;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  public async getCurrentUser(): Promise<User> {
    if (!this.isAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Erro ao carregar perfil');
      }

      const result = await response.json();
      this.currentUser = result.data || result;
      
      return this.currentUser;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  public logout(): void {
    this.token = null;
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current user (from memory)
   */
  public getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get authorization headers
   */
  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Check if user has admin role
   */
  public isAdmin(): boolean {
    return this.currentUser?.role === USER_ROLES.ADMIN;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
