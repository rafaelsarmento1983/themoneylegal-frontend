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

/**
 * Helper: loga erro somente quando fizer sentido
 */
const logIfNotStatus = (error: any, ignoreStatuses: number[], context: string) => {
  const status = error?.response?.status;
  if (!ignoreStatuses.includes(status)) {
    console.error(context, error);
  }
};

export const tenantService = {
  // Criar tenant com slug auto-gerado
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    try {
      const response = await api.post('/tenants', data);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao criar tenant (/tenants):');
      throw error;
    }
  },

  async create(data: CreateTenantRequest): Promise<Tenant> {
    return this.createTenant(data);
  },

  // Buscar todos os tenants do usuário (proprietário ou membro)
  async getAll(): Promise<Tenant[]> {
    try {
      const response = await api.get('/tenants');
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao listar tenants do usuário (/tenants):');
      throw error;
    }
  },

  // Buscar tenant por ID
  async getById(id: string): Promise<Tenant> {
    try {
      const response = await api.get(`/tenants/${id}`);
      return response.data;
    } catch (error: any) {
      // 404 aqui costuma ser esperado (tenant deletado / link inválido)
      logIfNotStatus(error, [404], `Erro ao buscar tenant (${id}) (/tenants/${id}):`);
      throw error;
    }
  },

  // Buscar todos os tenants públicos (Explorar)
  async getAllPublic(
    page: number = 0,
    size: number = 10,
    search?: string
  ): Promise<{
    content: Tenant[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (search) params.append('search', search);

      const response = await api.get(`/tenants/public?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao listar tenants públicos (/tenants/public):');
      throw error;
    }
  },

  // Buscar tenants do usuário com busca
  async searchMyTenants(search: string): Promise<Tenant[]> {
    try {
      const response = await api.get(`/tenants/search?q=${encodeURIComponent(search)}`);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], 'Erro ao buscar meus tenants (/tenants/search):');
      throw error;
    }
  },

  // Atualizar tenant
  async update(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    try {
      const response = await api.put(`/tenants/${id}`, data);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao atualizar tenant (${id}) (/tenants/${id}):`);
      throw error;
    }
  },

  // Deletar tenant
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/tenants/${id}`);
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao deletar tenant (${id}) (/tenants/${id}):`);
      throw error;
    }
  },

  // Buscar membros de um tenant
  async getMembers(tenantId: string): Promise<TenantMember[]> {
    try {
      const response = await api.get(`/tenants/${tenantId}/members`);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao listar membros (/tenants/${tenantId}/members):`);
      throw error;
    }
  },

  // Convidar membro
  async inviteMember(tenantId: string, data: InviteMemberRequest): Promise<Invitation> {
    try {
      const response = await api.post(`/tenants/${tenantId}/members/invite`, data);
      return response.data;
    } catch (error: any) {
      // 409 pode acontecer (já convidado / já membro) e muitas vezes é “esperado” pelo UX
      logIfNotStatus(error, [409], `Erro ao convidar membro (/tenants/${tenantId}/members/invite):`);
      throw error;
    }
  },

  // Aceitar convite
  async acceptInvitation(tenantId: string, code: string): Promise<TenantMember> {
    try {
      const response = await api.post(`/tenants/${tenantId}/members/accept`, { code });
      return response.data;
    } catch (error: any) {
      // 400/404 podem acontecer (code inválido/expirado)
      logIfNotStatus(error, [400, 404], `Erro ao aceitar convite (/tenants/${tenantId}/members/accept):`);
      throw error;
    }
  },

  // Remover membro
  async removeMember(tenantId: string, memberId: string): Promise<void> {
    try {
      await api.delete(`/tenants/${tenantId}/members/${memberId}`);
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao remover membro (/tenants/${tenantId}/members/${memberId}):`);
      throw error;
    }
  },

  // Atualizar role de membro
  async updateRole(tenantId: string, memberId: string, role: string): Promise<TenantMember> {
    try {
      const response = await api.put(
        `/tenants/${tenantId}/members/${memberId}/role`,
        null,
        { params: { role } }
      );
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao atualizar role (/tenants/${tenantId}/members/${memberId}/role):`);
      throw error;
    }
  },

  // Solicitar acesso a um tenant
  async requestAccess(data: CreateAccessRequestDTO): Promise<AccessRequest> {
    try {
      const response = await api.post('/tenants/access-requests', data);
      return response.data;
    } catch (error: any) {
      // 409 pode acontecer (solicitação já existe)
      logIfNotStatus(error, [409], 'Erro ao solicitar acesso (/tenants/access-requests):');
      throw error;
    }
  },

  // Listar solicitações de acesso (para owners)
  async getAccessRequests(tenantId: string): Promise<AccessRequest[]> {
    try {
      const response = await api.get(`/tenants/${tenantId}/access-requests`);
      return response.data;
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao listar solicitações (/tenants/${tenantId}/access-requests):`);
      throw error;
    }
  },

  // Aprovar solicitação
  async approveAccessRequest(requestId: string): Promise<void> {
    try {
      await api.post(`/tenants/access-requests/${requestId}/approve`);
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao aprovar solicitação (/tenants/access-requests/${requestId}/approve):`);
      throw error;
    }
  },

  // Rejeitar solicitação
  async rejectAccessRequest(requestId: string): Promise<void> {
    try {
      await api.post(`/tenants/access-requests/${requestId}/reject`);
    } catch (error: any) {
      logIfNotStatus(error, [], `Erro ao rejeitar solicitação (/tenants/access-requests/${requestId}/reject):`);
      throw error;
    }
  },
};
