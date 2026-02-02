import { useQuery } from '@tanstack/react-query';
import { tenantService } from '@/services/tenantService';

/**
 * Hook para buscar todos os tenants do usuário
 * Cache: 5 minutos
 */
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar tenant específico por ID
 * Cache: 10 minutos
 */
export function useTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantService.getById(tenantId!),
    enabled: !!tenantId, // Só busca se tenantId estiver definido
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para buscar membros de um tenant
 * Cache: 5 minutos
 */
export function useTenantMembers(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['tenant-members', tenantId],
    queryFn: () => tenantService.getMembers(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}
