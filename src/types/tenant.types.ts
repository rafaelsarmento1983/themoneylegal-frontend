// Tenant Types

export type TenantType = 'PERSONAL' | 'FAMILY' | 'BUSINESS';
export type TenantPlan = 'FREE' | 'PREMIUM' | 'ENTERPRISE';
export type RoleType = 'VIEWER' | 'MEMBER' | 'MANAGER' | 'ADMIN' | 'OWNER';

export interface Tenant {
  id: string;
  name: string;
  slug: string;  // ✅ NOVO
  type: TenantType;
  plan: TenantPlan;
  ownerId: string;
  logoUrl?: string;
  primaryColor?: string;
  isActive: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
  userRole?: string;
  role?: RoleType;
}

export interface CreateTenantRequest {
  name: string;
  type: TenantType;
  plan: TenantPlan;
  logoUrl?: string;
  primaryColor?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: RoleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: RoleType;
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  role: RoleType;
  code: string;
  expiresAt: string;
  createdAt: string;
}

// ✅ NOVO: Solicitação de Acesso
export interface AccessRequest {
  id: string;
  tenantId: string;
  userId: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessRequestDTO {
  tenantId: string;
  message: string;
}
