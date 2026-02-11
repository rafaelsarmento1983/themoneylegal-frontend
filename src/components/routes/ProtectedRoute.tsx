// frontend/src/components/routes/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRequireCompleteProfile } from '../../hooks/useProfileStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de rota protegida que requer perfil completo
 * Redireciona para /complete-profile/* se o perfil estiver incompleto
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, isCompleted, hasChosenType, hasFilledData, profile } = useRequireCompleteProfile();

  // Mostra loading enquanto verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--color-primary-blue-100)] mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se perfil incompleto, redireciona para etapa apropriada
  if (!isCompleted) {
    if (!hasChosenType) {
      return <Navigate to="/complete-profile/choose-type" replace />;
    }
    
    if (!hasFilledData) {
      const path = profile?.tipo === 'PESSOA_FISICA' 
        ? '/complete-profile/pessoa-fisica'
        : '/complete-profile/pessoa-juridica';
      return <Navigate to={path} replace />;
    }
    
    return <Navigate to="/complete-profile/address" replace />;
  }

  // Perfil completo, permite acesso
  return <>{children}</>;
};

export default ProtectedRoute;
