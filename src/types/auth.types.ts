// frontend/src/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  profileCompleted?: boolean; // ← ADICIONAR ESTE CAMPO
  createdAt?: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'PERSONAL' | 'FAMILY' | 'BUSINESS';
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
}
