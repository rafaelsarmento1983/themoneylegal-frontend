// frontend/src/components/routes/ProfileRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRequireIncompleteProfile } from '../../hooks/useProfileStatus';

interface ProfileRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de rota protegida para páginas de complete-profile
 * Redireciona para /dashboard se o perfil já estiver completo
 */
const ProfileRoute: React.FC<ProfileRouteProps> = ({ children }) => {
  const { loading, isCompleted } = useRequireIncompleteProfile();

  // Mostra loading enquanto verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando seu perfil...</p>
        </div>
      </div>
    );
  }

  // Se perfil completo, o hook já redireciona via navigate
  // Mas retornamos Navigate como fallback
  if (isCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Perfil incompleto, permite acesso
  return <>{children}</>;
};

export default ProfileRoute;
