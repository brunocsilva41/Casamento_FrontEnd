// Configuration constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Auth configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  TOKEN_EXPIRY_KEY: 'auth_token_expiry',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Role constants
export const USER_ROLES = {
  USER: 1,
  ADMIN: 2,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh',
  },
  GIFTS: {
    LIST: '/api/gifts',
    AVAILABLE: '/api/gifts/available',
    CREATE: '/api/gifts',
    UPDATE: (id: string) => `/api/gifts/${id}`,
    DELETE: (id: string) => `/api/gifts/${id}`,
  },
  PAYMENTS: {
    CREATE: '/api/payments',
    GET: (id: string) => `/api/payments/${id}`,
    LIST: '/api/payments',
    CANCEL: (id: string) => `/api/payments/${id}/cancel`,
  },
} as const;
