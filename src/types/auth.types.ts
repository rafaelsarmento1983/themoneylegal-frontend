export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'PERSONAL' | 'FAMILY' | 'BUSINESS';
  plan: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  role: 'VIEWER' | 'MEMBER' | 'MANAGER' | 'ADMIN' | 'OWNER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  defaultTenant: Tenant;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
