// frontend/src/components/routes/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRequireCompleteProfile } from "@/hooks/useProfileStatus";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { loading, isCompleted, hasChosenType, hasFilledData, profile } =
    useRequireCompleteProfile();

  // 1) Se não estiver logado, vai pro login (sua regra original)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2) Logado, mas ainda verificando status do perfil
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

  // 3) Logado, mas perfil incompleto => redireciona para a etapa correta
  if (!isCompleted) {
    if (!hasChosenType) {
      return <Navigate to="/complete-profile/choose-type" replace />;
    }

    if (!hasFilledData) {
      const path =
        profile?.tipo === "PESSOA_FISICA"
          ? "/complete-profile/pessoa-fisica"
          : "/complete-profile/pessoa-juridica";
      return <Navigate to={path} replace />;
    }

    return <Navigate to="/complete-profile/address" replace />;
  }

  // 4) Tudo ok
  return <>{children}</>;
};
