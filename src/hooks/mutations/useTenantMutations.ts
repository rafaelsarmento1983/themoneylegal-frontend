import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '@/services/tenantService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { CreateTenantRequest, UpdateTenantRequest } from '@/types/tenant.types';

/**
 * Hook para criar tenant
 * Invalida cache e atualiza lista automaticamente
 */
export function useCreateTenant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { switchTenant } = useAuth();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantService.createTenant(data),
    
    onSuccess: (newTenant) => {
      // Invalidar cache de tenants (recarrega lista)
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      // Setar como tenant atual
      const tenantForAuth = {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        type: newTenant.type,
        plan: newTenant.plan,
        role: (newTenant.userRole as any) || 'OWNER',
      };
      switchTenant(tenantForAuth);
      
      toast.success('Workspace criado com sucesso!');
      navigate('/dashboard');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar workspace');
    },
  });
}

/**
 * Hook para atualizar tenant
 * Invalida cache do tenant específico e da lista
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantRequest }) => 
      tenantService.update(id, data),
    
    onSuccess: (updatedTenant) => {
      // Invalidar cache do tenant específico
      queryClient.invalidateQueries({ queryKey: ['tenant', updatedTenant.id] });
      
      // Invalidar lista de tenants
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      toast.success('Workspace atualizado com sucesso!');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar workspace');
    },
  });
}

/**
 * Hook para deletar tenant
 * Invalida cache e remove da lista
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => tenantService.delete(id),
    
    onSuccess: (_, deletedId) => {
      // Invalidar cache de tenants
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      // Remover cache do tenant deletado
      queryClient.removeQueries({ queryKey: ['tenant', deletedId] });
      
      toast.success('Workspace deletado com sucesso!');
      navigate('/dashboard');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar workspace');
    },
  });
}

/**
 * Hook para aceitar convite
 * Invalida cache de tenants para mostrar novo workspace
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ tenantId, code }: { tenantId: string; code: string }) =>
      tenantService.acceptInvitation(tenantId, code),
    
    onSuccess: () => {
      // Invalidar cache de tenants (novo tenant na lista)
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      toast.success('Você entrou no workspace!');
      navigate('/dashboard');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Código de convite inválido');
    },
  });
}

/**
 * Hook para convidar membro
 * Invalida cache de membros do tenant
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) =>
      tenantService.inviteMember(tenantId, data),
    
    onSuccess: (_, { tenantId }) => {
      // Invalidar cache de membros
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
      
      toast.success('Convite enviado com sucesso!');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar convite');
    },
  });
}

/**
 * Hook para remover membro
 * Invalida cache de membros do tenant
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, memberId }: { tenantId: string; memberId: string }) =>
      tenantService.removeMember(tenantId, memberId),
    
    onSuccess: (_, { tenantId }) => {
      // Invalidar cache de membros
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
      
      toast.success('Membro removido com sucesso!');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover membro');
    },
  });
}

/**
 * Hook para atualizar role de membro
 * Invalida cache de membros do tenant
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, memberId, role }: { tenantId: string; memberId: string; role: string }) =>
      tenantService.updateRole(tenantId, memberId, role),
    
    onSuccess: (_, { tenantId }) => {
      // Invalidar cache de membros
      queryClient.invalidateQueries({ queryKey: ['tenant-members', tenantId] });
      
      toast.success('Permissão atualizada com sucesso!');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissão');
    },
  });
}
