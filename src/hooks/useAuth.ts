import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  return {
    user: store.user,
    tenant: store.tenant,
    isAuthenticated: store.isAuthenticated,
    isOwner: store.tenant?.role === 'OWNER',
    isAdmin: store.tenant?.role === 'ADMIN' || store.tenant?.role === 'OWNER',
    isManager: ['MANAGER', 'ADMIN', 'OWNER'].includes(store.tenant?.role || ''),
    setAuth: store.setAuth,
    clearAuth: store.clearAuth,
    updateUser: store.updateUser,
    switchTenant: store.switchTenant,
  };
};
