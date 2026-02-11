// frontend/src/hooks/useAuth.ts

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook principal de autenticação
 * Expõe todos os dados e funções do Zustand sem proteção
 * Use este hook quando precisar APENAS dos dados (sem redirecionar)
 * 
 * @example
 * const MyComponent = () => {
 *   const { user, isAdmin } = useAuth();
 *   if (isAdmin) return <AdminPanel />;
 *   return <UserPanel />;
 * }
 */
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

/**
 * Hook para páginas que REQUEREM autenticação básica
 * Redireciona para /login se não estiver autenticado
 * 
 * @example
 * const MyPage = () => {
 *   const { user } = useRequireAuth();
 *   return <div>Página protegida</div>;
 * }
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Não autenticado, redirecionando para /login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return { user, isAuthenticated };
};

/**
 * Hook para páginas de complete-profile
 * Redireciona para /dashboard se perfil já estiver completo
 * Redireciona para /login se não estiver autenticado
 * 
 * USE ESTE HOOK nas 4 páginas de complete-profile:
 * - ChooseTypePage
 * - PessoaFisicaFormPage
 * - PessoaJuridicaFormPage
 * - AddressFormPage
 * 
 * @example
 * const ChooseTypePage = () => {
 *   const { user } = useRequireIncompleteProfile();
 *   return <div>Escolha seu tipo</div>;
 * }
 */
export const useRequireIncompleteProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Primeiro verifica autenticação
    if (!isAuthenticated) {
      console.log('❌ Não autenticado, redirecionando para /login');
      navigate('/login', { replace: true });
      return;
    }

    // Depois verifica se perfil já está completo
    if (user?.profileCompleted) {
      console.log('✅ Perfil já completo, redirecionando para /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return { user, isAuthenticated };
};

/**
 * Hook para páginas que REQUEREM perfil completo
 * Redireciona para /complete-profile se perfil estiver incompleto
 * Redireciona para /login se não estiver autenticado
 * 
 * USE ESTE HOOK em TODAS as páginas protegidas:
 * - Dashboard
 * - Accounts
 * - Transactions
 * - Settings
 * - etc...
 * 
 * @example
 * const DashboardPage = () => {
 *   const { user } = useRequireCompleteProfile();
 *   return <div>Dashboard</div>;
 * }
 */
export const useRequireCompleteProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Primeiro verifica autenticação
    if (!isAuthenticated) {
      console.log('❌ Não autenticado, redirecionando para /login');
      navigate('/login', { replace: true });
      return;
    }

    // Depois verifica se perfil está completo
    if (!user?.profileCompleted) {
      console.log('⚠️ Perfil incompleto, redirecionando para /complete-profile');
      navigate('/complete-profile/choose-type', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return { user, isAuthenticated };
};
