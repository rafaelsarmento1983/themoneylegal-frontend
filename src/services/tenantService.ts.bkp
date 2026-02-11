import api from './api';
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantMember,
  InviteMemberRequest,
  Invitation,
  CreateAccessRequestDTO,
  AccessRequest,
} from '@/types/tenant.types';

export const tenantService = {
  // Criar tenant com slug auto-gerado
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await api.post('/tenants', data);
    return response.data;
  },

  async create(data: CreateTenantRequest): Promise<Tenant> {
    return this.createTenant(data);
  },

  // Buscar todos os tenants do usuário (proprietário ou membro)
  async getAll(): Promise<Tenant[]> {
    const response = await api.get('/tenants');
    return response.data;
  },

  // Buscar tenant por ID
  async getById(id: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  // ✅ NOVO: Buscar todos os tenants da plataforma (para "Explorar")
  async getAllPublic(page: number = 0, size: number = 10, search?: string): Promise<{
    content: Tenant[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await api.get(`/tenants/public?${params.toString()}`);
    return response.data;
  },

  // ✅ NOVO: Buscar tenants do usuário com busca
  async searchMyTenants(search: string): Promise<Tenant[]> {
    const response = await api.get(`/tenants/search?q=${encodeURIComponent(search)}`);
    return response.data;
  },

  // Atualizar tenant
  async update(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  // Deletar tenant
  async delete(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`);
  },

  // Buscar membros de um tenant
  async getMembers(tenantId: string): Promise<TenantMember[]> {
    const response = await api.get(`/tenants/${tenantId}/members`);
    return response.data;
  },

  // Convidar membro
  async inviteMember(tenantId: string, data: InviteMemberRequest): Promise<Invitation> {
    const response = await api.post(`/tenants/${tenantId}/members/invite`, data);
    return response.data;
  },

  // Aceitar convite
  async acceptInvitation(tenantId: string, code: string): Promise<TenantMember> {
    const response = await api.post(`/tenants/${tenantId}/members/accept`, { code });
    return response.data;
  },

  // Remover membro
  async removeMember(tenantId: string, memberId: string): Promise<void> {
    await api.delete(`/tenants/${tenantId}/members/${memberId}`);
  },

  // Atualizar role de membro
  async updateRole(tenantId: string, memberId: string, role: string): Promise<TenantMember> {
    const response = await api.put(`/tenants/${tenantId}/members/${memberId}/role`, null, {
      params: { role },
    });
    return response.data;
  },

  // ✅ NOVO: Solicitar acesso a um tenant
  async requestAccess(data: CreateAccessRequestDTO): Promise<AccessRequest> {
    const response = await api.post('/tenants/access-requests', data);
    return response.data;
  },

  // ✅ NOVO: Listar solicitações de acesso (para owners)
  async getAccessRequests(tenantId: string): Promise<AccessRequest[]> {
    const response = await api.get(`/tenants/${tenantId}/access-requests`);
    return response.data;
  },

  // ✅ NOVO: Aprovar solicitação
  async approveAccessRequest(requestId: string): Promise<void> {
    await api.post(`/tenants/access-requests/${requestId}/approve`);
  },

  // ✅ NOVO: Rejeitar solicitação
  async rejectAccessRequest(requestId: string): Promise<void> {
    await api.post(`/tenants/access-requests/${requestId}/reject`);
  },
};
