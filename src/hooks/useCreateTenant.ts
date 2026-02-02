import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '@/services/tenantService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { CreateTenantRequest } from '@/types/tenant.types';

export function useCreateTenant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { switchTenant } = useAuth();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantService.createTenant(data),
    
    onSuccess: (newTenant) => {
      // 1. Invalidar cache de tenants (recarrega lista automaticamente)
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      // 2. Converter para formato AuthStore e setar como tenant atual
      const tenantForAuth = {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        type: newTenant.type,
        plan: newTenant.plan,
        role: (newTenant.userRole as 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER') || 'OWNER',
      };
      switchTenant(tenantForAuth);
      
      // 3. Toast de sucesso
      toast.success('Workspace criado com sucesso!');
      
      // 4. Navegar para dashboard
      navigate('/dashboard');
    },
    
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar workspace');
    },
  });
}
