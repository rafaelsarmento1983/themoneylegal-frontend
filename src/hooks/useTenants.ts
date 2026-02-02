import { useQuery } from '@tanstack/react-query';
import { tenantService } from '@/services/tenantService';

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
