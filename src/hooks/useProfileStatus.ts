// frontend/src/hooks/useProfileStatus.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import { Profile } from "../types/profile.types";
import { logout } from "@/lib/auth/logout";

interface ProfileStatus {
  loading: boolean;
  profile: Profile | null;
  isCompleted: boolean;
  hasChosenType: boolean;
  hasFilledData: boolean;
  needsRedirect: boolean;
}

/**
 * Hook para verificar status do perfil e determinar redirecionamentos
 */
export const useProfileStatus = () => {
  const navigate = useNavigate();
  const logoutOnceRef = useRef(false);

  const [status, setStatus] = useState<ProfileStatus>({
    loading: true,
    profile: null,
    isCompleted: false,
    hasChosenType: false,
    hasFilledData: false,
    needsRedirect: false,
  });

  const checkProfileStatus = useCallback(async () => {
    try {
      const profile = await getMyProfile();

      const tipo = profile?.tipo ?? null;

      const hasChosenType = !!tipo;
      const hasFilledData =
        tipo === "PESSOA_FISICA"
          ? !!profile?.pessoaFisica
          : tipo === "PESSOA_JURIDICA"
          ? !!profile?.pessoaJuridica
          : false;

      const isCompleted = !!profile?.isCompleted;

      setStatus({
        loading: false,
        profile,
        isCompleted,
        hasChosenType,
        hasFilledData,
        needsRedirect: false,
      });
    } catch (error: any) {
      // 🆕 Perfil ainda não existe → onboarding
      if (error?.response?.status === 404) {
        setStatus({
          loading: false,
          profile: null,
          isCompleted: false,
          hasChosenType: false,
          hasFilledData: false,
          needsRedirect: true,
        });
        return;
      }

      // 🔐 Token inválido / expirado → logout centralizado (uma vez)
      const statusCode = error?.response?.status;
      if ((statusCode === 401 || statusCode === 403) && !logoutOnceRef.current) {
        logoutOnceRef.current = true;
        void logout("unauthorized"); // tenta backend + sempre limpa local + redirect
        return;
      }

      // evita console em produção (se quiser, troque por logger)
      // console.error("Erro ao verificar profile:", error);

      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkProfileStatus();
  }, [checkProfileStatus]);

  return status;
};

/**
 * Hook para proteger rotas que REQUEREM perfil incompleto
 * (rotas de /complete-profile/*)
 */
export const useRequireIncompleteProfile = () => {
  const navigate = useNavigate();
  const status = useProfileStatus();

  useEffect(() => {
    if (!status.loading && status.isCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [status.loading, status.isCompleted, navigate]);

  return status;
};

/**
 * Hook para proteger rotas que REQUEREM perfil completo
 * (dashboard, contas, transações, etc.)
 */
export const useRequireCompleteProfile = () => {
  const navigate = useNavigate();
  const status = useProfileStatus();

  useEffect(() => {
    if (!status.loading && !status.isCompleted) {
      if (!status.hasChosenType) {
        navigate("/complete-profile/choose-type", { replace: true });
      } else if (!status.hasFilledData) {
        const path =
          status.profile?.tipo === "PESSOA_FISICA"
            ? "/complete-profile/pessoa-fisica"
            : "/complete-profile/pessoa-juridica";

        navigate(path, { replace: true });
      } else {
        navigate("/complete-profile/address", { replace: true });
      }
    }
  }, [
    status.loading,
    status.isCompleted,
    status.hasChosenType,
    status.hasFilledData,
    status.profile?.tipo,
    navigate,
  ]);

  return status;
};
